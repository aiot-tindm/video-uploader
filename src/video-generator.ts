import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import { promises as fs } from 'fs';
import * as path from 'path';
import config from './config';
import { SimpleVideoGenerator } from './simple-video-generator';
import { Product } from './types';

// Set FFmpeg path
ffmpeg.setFfmpegPath(ffmpegStatic!);

let Canvas: any, loadImage: any;
let canvasAvailable = false;

try {
  const skiaCanvas = require('skia-canvas');
  Canvas = skiaCanvas.Canvas;
  loadImage = skiaCanvas.loadImage;
  canvasAvailable = true;
  console.log('✅ Skia Canvas available - using advanced video generation');
} catch (error) {
  console.log('⚠️ Skia Canvas not available - using simple video generation');
  canvasAvailable = false;
}

export class VideoGenerator {
  private canvas?: any;
  private ctx?: any;
  private outputDir: string;
  private simpleGenerator?: SimpleVideoGenerator;

  constructor() {
    if (!canvasAvailable) {
      // Use simple generator as fallback
      this.simpleGenerator = new SimpleVideoGenerator();
      return;
    }
    
    this.canvas = new Canvas(config.video.width, config.video.height);
    this.ctx = this.canvas.getContext('2d');
    this.outputDir = path.join(__dirname, '../output');
  }

  async init(): Promise<void> {
    if (!canvasAvailable) {
      return await this.simpleGenerator!.init();
    }
    
    // Create output directory
    try {
      await fs.mkdir(this.outputDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }
  }

  async generateThumbnail(product: Product, index: number): Promise<Buffer> {
    const { width, height } = config.video;
    
    // Clear canvas
    this.ctx.fillStyle = '#FF4444';
    this.ctx.fillRect(0, 0, width, height);

    // Add gradient background
    const gradient = this.ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#FF6B6B');
    gradient.addColorStop(1, '#FF8E53');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, width, height);

    try {
      // Load and draw product image
      const productImage = await loadImage(product.image);
      const imageSize = Math.min(width * 0.6, height * 0.4);
      const imageX = (width - imageSize) / 2;
      const imageY = height * 0.15;
      
      this.ctx.drawImage(productImage, imageX, imageY, imageSize, imageSize);
    } catch (error: any) {
      console.log('Could not load product image:', error.message);
      // Draw placeholder
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.fillRect(width * 0.2, height * 0.15, width * 0.6, height * 0.4);
      this.ctx.fillStyle = '#666';
      this.ctx.font = '32px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('Product Image', width / 2, height * 0.35);
    }

    // Add rank badge
    this.ctx.fillStyle = '#FFD700';
    this.ctx.beginPath();
    this.ctx.arc(100, 100, 50, 0, 2 * Math.PI);
    this.ctx.fill();
    
    this.ctx.fillStyle = '#000';
    this.ctx.font = 'bold 36px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`#${index + 1}`, 100, 110);

    // Add product name
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = 'bold 48px Arial';
    this.ctx.textAlign = 'center';
    
    const maxWidth = width * 0.9;
    const lineHeight = 60;
    const lines = this.wrapText(product.name, maxWidth, 48);
    const startY = height * 0.65;
    
    lines.forEach((line, i) => {
      this.ctx.fillText(line, width / 2, startY + i * lineHeight);
    });

    // Add price
    this.ctx.fillStyle = '#FFD700';
    this.ctx.font = 'bold 54px Arial';
    this.ctx.fillText(product.price, width / 2, height * 0.85);

    // Add "HOT" label
    this.ctx.fillStyle = '#FF0000';
    this.ctx.font = 'bold 32px Arial';
    this.ctx.fillText('🔥 HOT SHOPEE 🔥', width / 2, height * 0.92);

    return await this.canvas.png;
  }

  private wrapText(text: string, maxWidth: number, fontSize: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    this.ctx.font = `${fontSize}px Arial`;

    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const metrics = this.ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }

    return lines.slice(0, 3); // Max 3 lines
  }

  async generateVideo(products: Product[], audioPath?: string | null): Promise<string> {
    if (!canvasAvailable) {
      return await this.simpleGenerator!.generateVideo(products, audioPath);
    }
    
    const videoPath = path.join(this.outputDir, `shopee_top5_${Date.now()}.mp4`);
    const framesDir = path.join(this.outputDir, 'frames');
    
    try {
      await fs.mkdir(framesDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }

    // Generate frames for each product
    const frameDuration = config.video.duration / products.length; // seconds per product
    const framesPerProduct = Math.floor(frameDuration * config.video.fps);

    let frameIndex = 0;
    
    for (let i = 0; i < products.length; i++) {
      const thumbnail = await this.generateThumbnail(products[i], i);
      
      // Create multiple frames for this product
      for (let f = 0; f < framesPerProduct; f++) {
        const framePath = path.join(framesDir, `frame_${frameIndex.toString().padStart(6, '0')}.png`);
        await fs.writeFile(framePath, thumbnail);
        frameIndex++;
      }
    }

    // Create video using FFmpeg
    return new Promise((resolve, reject) => {
      const buildCommand = async () => {
        const command = ffmpeg()
          .input(path.join(framesDir, 'frame_%06d.png'))
          .inputFPS(config.video.fps)
          .videoCodec('libx264')
          .size(`${config.video.width}x${config.video.height}`)
          .autopad()
          .duration(config.video.duration);

        // Add audio if provided
        if (audioPath && await this.fileExists(audioPath)) {
          command.input(audioPath).audioCodec('aac');
        }

        command
          .output(videoPath)
          .on('end', () => {
            console.log('✅ Video generated successfully:', videoPath);
            resolve(videoPath);
          })
          .on('error', (error) => {
            console.error('❌ Video generation failed:', error);
            reject(error);
          })
          .run();
      };

      buildCommand().catch(reject);
    });
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async cleanup(): Promise<void> {
    if (!canvasAvailable) {
      return await this.simpleGenerator!.cleanup();
    }
    
    // Clean up frames directory
    const framesDir = path.join(this.outputDir, 'frames');
    try {
      const files = await fs.readdir(framesDir);
      for (const file of files) {
        await fs.unlink(path.join(framesDir, file));
      }
      await fs.rmdir(framesDir);
    } catch (error) {
      // Directory might not exist
    }
  }
}

// For testing
export async function testVideoGenerator(): Promise<string> {
  const mockProducts: Product[] = [
    {
      name: 'Áo thun nam nữ form rộng phong cách Hàn Quốc',
      price: '₫89.000',
      image: 'https://via.placeholder.com/300x300',
      link: 'https://shopee.vn/product/1',
      sold: '1k+ đã bán',
      rank: 1
    },
    {
      name: 'Giày sneaker thể thao nam nữ hot trend 2024',
      price: '₫299.000',
      image: 'https://via.placeholder.com/300x300',
      link: 'https://shopee.vn/product/2',
      sold: '500+ đã bán',
      rank: 2
    }
  ];

  const generator = new VideoGenerator();
  await generator.init();
  
  console.log('🎬 Generating video...');
  const videoPath = await generator.generateVideo(mockProducts);
  
  await generator.cleanup();
  return videoPath;
}

if (require.main === module) {
  testVideoGenerator().catch(console.error);
}
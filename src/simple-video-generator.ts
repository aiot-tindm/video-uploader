import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import sharp from 'sharp';
import { promises as fs } from 'fs';
import * as path from 'path';
import config from './config';
import { Product } from './types';

// Set FFmpeg path
ffmpeg.setFfmpegPath(ffmpegStatic!);

export class SimpleVideoGenerator {
  private outputDir: string;

  constructor() {
    this.outputDir = path.join(__dirname, '../output');
  }

  async init(): Promise<void> {
    try {
      await fs.mkdir(this.outputDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }
  }

  async generateThumbnail(product: Product, index: number): Promise<Buffer> {
    const { width, height } = config.video;
    
    // Create a simple thumbnail using Sharp (no canvas needed)
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:#FF6B6B;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#FF8E53;stop-opacity:1" />
          </linearGradient>
        </defs>
        
        <!-- Background -->
        <rect width="100%" height="100%" fill="url(#grad1)"/>
        
        <!-- Rank badge -->
        <circle cx="100" cy="100" r="50" fill="#FFD700"/>
        <text x="100" y="115" text-anchor="middle" font-family="Arial" font-size="36" font-weight="bold" fill="#000">#${index + 1}</text>
        
        <!-- Product placeholder -->
        <rect x="${width * 0.2}" y="${height * 0.15}" width="${width * 0.6}" height="${height * 0.4}" fill="#FFFFFF" rx="20"/>
        <text x="${width / 2}" y="${height * 0.35}" text-anchor="middle" font-family="Arial" font-size="32" fill="#666">Product Image</text>
        
        <!-- Product name -->
        <text x="${width / 2}" y="${height * 0.65}" text-anchor="middle" font-family="Arial" font-size="36" font-weight="bold" fill="#FFFFFF">${this.truncateText(product.name, 30)}</text>
        
        <!-- Price -->
        <text x="${width / 2}" y="${height * 0.75}" text-anchor="middle" font-family="Arial" font-size="48" font-weight="bold" fill="#FFD700">${product.price}</text>
        
        <!-- Hot label -->
        <text x="${width / 2}" y="${height * 0.85}" text-anchor="middle" font-family="Arial" font-size="32" font-weight="bold" fill="#FF0000">🔥 HOT SHOPEE 🔥</text>
        
        <!-- Sold info -->
        <text x="${width / 2}" y="${height * 0.92}" text-anchor="middle" font-family="Arial" font-size="28" fill="#FFFFFF">${product.sold || '0 đã bán'}</text>
      </svg>
    `;

    const buffer = await sharp(Buffer.from(svg))
      .png()
      .toBuffer();

    return buffer;
  }

  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }

  async generateVideo(products: Product[], audioPath?: string | null): Promise<string> {
    const videoPath = path.join(this.outputDir, `shopee_top5_${Date.now()}.mp4`);
    const framesDir = path.join(this.outputDir, 'frames');
    
    try {
      await fs.mkdir(framesDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }

    // Generate frames for each product
    const frameDuration = config.video.duration / products.length;
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
    return new Promise(async (resolve, reject) => {
      const command = ffmpeg()
        .input(path.join(framesDir, 'frame_%06d.png'))
        .inputFPS(config.video.fps)
        .videoCodec('libx264')
        .size(`${config.video.width}x${config.video.height}`)
        .duration(config.video.duration);

      // Add audio if provided
      if (audioPath && await this.fileExists(audioPath)) {
        command.input(audioPath).audioCodec('aac');
      } else {
        // Add silent audio track for better compatibility
        command.input('anullsrc=channel_layout=stereo:sample_rate=48000')
               .inputOptions('-f lavfi')
               .audioCodec('aac');
      }

      command
        .output(videoPath)
        .outputOptions([
          '-pix_fmt yuv420p',
          '-preset fast',
          '-crf 23'
        ])
        .on('end', () => {
          console.log('✅ Video generated successfully:', videoPath);
          resolve(videoPath);
        })
        .on('error', (error) => {
          console.error('❌ Video generation failed:', error);
          reject(error);
        })
        .run();
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
export async function testSimpleVideoGenerator(): Promise<string> {
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

  const generator = new SimpleVideoGenerator();
  await generator.init();
  
  console.log('🎬 Generating simple video...');
  const videoPath = await generator.generateVideo(mockProducts);
  
  await generator.cleanup();
  return videoPath;
}

if (require.main === module) {
  testSimpleVideoGenerator().catch(console.error);
}
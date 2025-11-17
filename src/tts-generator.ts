import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { promises as fs } from 'fs';
import * as path from 'path';
import config from './config';
import { Product, TTSRequest } from './types';

export class TTSGenerator {
  private client: TextToSpeechClient;
  private outputDir: string;

  constructor() {
    this.client = new TextToSpeechClient({
      projectId: config.googleCloud.projectId,
      keyFilename: config.googleCloud.keyFilename
    });
    this.outputDir = path.join(__dirname, '../output');
  }

  async init(): Promise<void> {
    try {
      await fs.mkdir(this.outputDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }
  }

  generateScript(products: Product[]): string {
    const intro = "Chào mọi người! Hôm nay mình sẽ giới thiệu top 5 sản phẩm hot nhất trên Shopee tuần này.";
    
    let script = intro + " ";
    
    products.forEach((product, index) => {
      const rank = index + 1;
      const productScript = `Vị trí số ${rank}: ${product.name}. Giá chỉ ${product.price}. ${product.sold}. `;
      script += productScript;
    });
    
    const outro = "Link mua hàng có trong mô tả video. Đừng quên like và subscribe kênh để ủng hộ mình nhé!";
    script += outro;
    
    return script;
  }

  async generateAudio(script: string): Promise<string | null> {
    try {
      const request: TTSRequest = {
        input: { text: script },
        voice: {
          languageCode: 'vi-VN',
          name: 'vi-VN-Standard-A', // Female voice
          ssmlGender: 'FEMALE'
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: 1.0,
          pitch: 0.0,
          volumeGainDb: 0.0
        }
      };

      console.log('🎤 Generating TTS audio...');
      const [response] = await this.client.synthesizeSpeech(request);
      
      const audioPath = path.join(this.outputDir, `tts_${Date.now()}.mp3`);
      await fs.writeFile(audioPath, response.audioContent!, 'binary');
      
      console.log(`✅ Audio saved to: ${audioPath}`);
      return audioPath;
    } catch (error: any) {
      console.error('❌ TTS generation failed:', error);
      
      // Fallback: return null to generate video without audio
      console.log('⚠️ Continuing without audio...');
      return null;
    }
  }

  // Alternative free TTS using browser Speech Synthesis (for reference)
  generateBrowserTTS(script: string): string {
    // This is for web browsers only, not Node.js
    // Keeping it here for reference
    return `
// Browser TTS code (run in browser console):
const utterance = new SpeechSynthesisUtterance('${script}');
utterance.lang = 'vi-VN';
utterance.rate = 1.0;
utterance.pitch = 1.0;
speechSynthesis.speak(utterance);
    `;
  }
}

// Alternative: Simple text-based narrator (fallback)
export class SimpleNarrator {
  generateScript(products: Product[]): string {
    const script = [
      "🔥 TOP 5 SẢN PHẨM HOT SHOPEE TUẦN NÀY! 🔥",
      "",
      ...products.map((product, index) => 
        `#${index + 1} ${product.name}\n💰 ${product.price}\n📦 ${product.sold}\n`
      ),
      "👆 Link mua hàng trong mô tả",
      "❤️ LIKE & SUBSCRIBE ủng hộ kênh!"
    ].join('\n');
    
    return script;
  }

  async saveScript(script: string): Promise<string> {
    const scriptPath = path.join(__dirname, '../output', `script_${Date.now()}.txt`);
    await fs.writeFile(scriptPath, script, 'utf8');
    return scriptPath;
  }
}

// For testing
export async function testTTS(): Promise<string | null> {
  const mockProducts: Product[] = [
    {
      name: 'Áo thun nam nữ form rộng phong cách Hàn Quốc',
      price: '89.000đ',
      image: 'https://via.placeholder.com/300x300',
      link: 'https://shopee.vn/product/1',
      sold: '1k+ đã bán',
      rank: 1
    },
    {
      name: 'Giày sneaker thể thao nam nữ hot trend 2024',
      price: '299.000đ',
      image: 'https://via.placeholder.com/300x300',
      link: 'https://shopee.vn/product/2',
      sold: '500+ đã bán',
      rank: 2
    }
  ];

  try {
    const tts = new TTSGenerator();
    await tts.init();
    
    const script = tts.generateScript(mockProducts);
    console.log('📝 Generated script:');
    console.log(script);
    
    const audioPath = await tts.generateAudio(script);
    return audioPath;
  } catch (error) {
    console.log('⚠️ Google TTS not configured, using simple narrator...');
    
    const narrator = new SimpleNarrator();
    const script = narrator.generateScript(mockProducts);
    console.log('📝 Generated script:');
    console.log(script);
    
    const scriptPath = await narrator.saveScript(script);
    return scriptPath;
  }
}

if (require.main === module) {
  testTTS().catch(console.error);
}
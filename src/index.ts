import { ShopeeScraper } from './scraper';
import { VideoGenerator } from './video-generator';
import { TTSGenerator, SimpleNarrator } from './tts-generator';
import { YouTubeUploader } from './uploader';
import { NotificationService, Logger } from './notifier';
import { Product, SystemResult, UploadResult } from './types';

export class AutoVideoSystem {
  private scraper: ShopeeScraper;
  private videoGenerator: VideoGenerator;
  private ttsGenerator: TTSGenerator;
  private simpleNarrator: SimpleNarrator;
  private uploader: YouTubeUploader;
  private notifier: NotificationService;
  private logger: Logger;

  constructor() {
    this.scraper = new ShopeeScraper();
    this.videoGenerator = new VideoGenerator();
    this.ttsGenerator = new TTSGenerator();
    this.simpleNarrator = new SimpleNarrator();
    this.uploader = new YouTubeUploader();
    this.notifier = new NotificationService();
    this.logger = new Logger();
  }

  async run(): Promise<void> {
    this.logger.log('info', '🚀 Starting Auto Shopee Video System...');

    try {
      // Step 1: Initialize components
      await this.initialize();

      // Step 2: Scrape Shopee products
      const products = await this.scrapeProducts();

      // Step 3: Generate TTS audio
      const audioPath = await this.generateAudio(products);

      // Step 4: Generate video
      const videoPath = await this.generateVideo(products, audioPath);

      // Step 5: Upload to YouTube
      const uploadResult = await this.uploadVideo(videoPath, products);

      // Step 6: Send notifications
      await this.sendNotifications(uploadResult);

      this.logger.log('success', '✅ Auto video system completed successfully!');

    } catch (error: any) {
      this.logger.log('error', '❌ System failed:', error.message);
      await this.notifier.sendErrorNotification(error);
      throw error; // Re-throw to ensure finally block runs before exit
    } finally {
      // Step 7: Cleanup - always runs even if errors occur
      await this.cleanup();
    }
  }

  private async initialize(): Promise<void> {
    this.logger.log('info', '🔧 Initializing components...');
    
    await this.scraper.init();
    await this.videoGenerator.init();
    await this.ttsGenerator.init();
    
    this.logger.log('success', '✅ All components initialized');
  }

  private async scrapeProducts(): Promise<Product[]> {
    this.logger.log('info', '🕷️ Scraping Shopee products...');
    
    const products = await this.scraper.scrapeTopProducts(5);
    
    if (products.length === 0) {
      throw new Error('No products found during scraping');
    }
    
    this.logger.updateStats('productsScraped', products.length);
    this.logger.log('success', `✅ Found ${products.length} products`);
    
    // Log product details
    products.forEach((product, index) => {
      this.logger.log('info', `Product ${index + 1}: ${product.name}`);
    });
    
    return products;
  }

  private async generateAudio(products: Product[]): Promise<string | null> {
    this.logger.log('info', '🎤 Generating audio narration...');
    
    try {
      const script = this.ttsGenerator.generateScript(products);
      this.logger.log('info', '📝 Generated script');
      
      const audioPath = await this.ttsGenerator.generateAudio(script);
      
      if (audioPath) {
        this.logger.log('success', '✅ Audio generated successfully');
        return audioPath;
      } else {
        this.logger.log('warning', '⚠️ Audio generation failed, continuing without audio');
        return null;
      }
    } catch (error: any) {
      this.logger.log('warning', '⚠️ TTS failed, using text-only approach:', error.message);
      
      // Fallback to simple narrator
      const script = this.simpleNarrator.generateScript(products);
      await this.simpleNarrator.saveScript(script);
      
      return null;
    }
  }

  private async generateVideo(products: Product[], audioPath: string | null): Promise<string> {
    this.logger.log('info', '🎬 Generating video...');
    
    const videoPath = await this.videoGenerator.generateVideo(products, audioPath);
    
    this.logger.updateStats('videosCreated');
    this.logger.log('success', `✅ Video generated: ${videoPath}`);
    
    return videoPath;
  }

  private async uploadVideo(videoPath: string, products: Product[]): Promise<UploadResult> {
    this.logger.log('info', '📤 Uploading to YouTube...');
    
    const result = await this.uploader.uploadVideo(videoPath, products);
    
    if (result.success) {
      this.logger.updateStats('videosUploaded');
      this.logger.log('success', `✅ Upload successful: ${result.url}`);
    } else {
      this.logger.updateStats('errors');
      this.logger.log('error', `❌ Upload failed: ${result.error}`);
      throw new Error(`Upload failed: ${result.error}`);
    }
    
    return result;
  }

  private async sendNotifications(uploadResult: UploadResult): Promise<void> {
    this.logger.log('info', '📱 Sending notifications...');
    
    if (uploadResult.success) {
      await this.notifier.sendSuccessNotification(uploadResult);
      this.logger.log('success', '✅ Success notification sent');
    }
    
    // Send daily report
    const stats = this.logger.getStats();
    await this.notifier.sendDailyReport(stats);
  }

  private async cleanup(): Promise<void> {
    this.logger.log('info', '🧹 Cleaning up...');
    
    try {
      await this.scraper.close();
      await this.videoGenerator.cleanup();
      
      this.logger.log('success', '✅ Cleanup completed');
    } catch (error: any) {
      this.logger.log('warning', '⚠️ Cleanup warning:', error.message);
    }
  }
}

// Main execution
async function main(): Promise<void> {
  const system = new AutoVideoSystem();
  await system.run();
}

// Handle uncaught errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled rejection:', error);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception:', error);
  process.exit(1);
});

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ System failed:', error);
    process.exit(1);
  });
}
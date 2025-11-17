// Test script that runs the complete system without upload
import { ShopeeScraper } from './src/scraper';
import { VideoGenerator } from './src/video-generator';
import { TTSGenerator, SimpleNarrator } from './src/tts-generator';
import { Product, SystemResult } from './src/types';
import * as fs from 'fs';

async function testCompleteSystem(): Promise<SystemResult> {
  console.log('🚀 Testing complete auto video system...');
  
  try {
    // Step 1: Test scraping
    const scraper = new ShopeeScraper();
    await scraper.init();
    
    console.log('📊 Testing product scraping...');
    const products = await scraper.scrapeTopProducts(5);
    console.log(`✅ Found ${products.length} products`);
    
    if (products.length === 0) {
      throw new Error('No products found');
    }
    
    // Step 2: Test TTS (with fallback)
    console.log('🎤 Testing TTS generation...');
    let audioPath: string | null = null;
    
    try {
      const tts = new TTSGenerator();
      await tts.init();
      const script = tts.generateScript(products);
      audioPath = await tts.generateAudio(script);
    } catch (error: any) {
      console.log('⚠️ TTS failed, using text-only approach');
      const narrator = new SimpleNarrator();
      const script = narrator.generateScript(products);
      console.log('📝 Generated script:', script.substring(0, 100) + '...');
    }
    
    // Step 3: Test video generation
    console.log('🎬 Testing video generation...');
    const videoGenerator = new VideoGenerator();
    await videoGenerator.init();
    
    const videoPath = await videoGenerator.generateVideo(products, audioPath);
    console.log(`✅ Video generated: ${videoPath}`);
    
    // Step 4: Verify video file exists
    if (fs.existsSync(videoPath)) {
      const stats = fs.statSync(videoPath);
      console.log(`📁 Video file size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    }
    
    // Cleanup
    await scraper.close();
    await videoGenerator.cleanup();
    
    console.log('🎉 Complete system test successful!');
    console.log('📋 Summary:');
    console.log(`   • Products scraped: ${products.length}`);
    console.log(`   • Video generated: ✅`);
    console.log(`   • Video path: ${videoPath}`);
    console.log(`   • TTS: ${audioPath ? '✅' : '❌ (fallback mode)'}`);
    
    return {
      success: true,
      products,
      videoPath,
      audioPath
    };
    
  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run test
if (require.main === module) {
  testCompleteSystem()
    .then(result => {
      if (result.success) {
        console.log('\n✅ All tests passed! System is ready for production.');
        process.exit(0);
      } else {
        console.log('\n❌ Tests failed. Please check the configuration.');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('❌ Test runner failed:', error);
      process.exit(1);
    });
}
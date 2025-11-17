import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';
import config from './config';
import { Product, UploadResult, VideoMetadata } from './types';

export class YouTubeUploader {
  private oauth2Client: any;
  private youtube: any;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      config.youtube.clientId,
      config.youtube.clientSecret,
      'http://localhost'
    );
    
    this.oauth2Client.setCredentials({
      refresh_token: config.youtube.refreshToken
    });
    
    this.youtube = google.youtube({
      version: 'v3',
      auth: this.oauth2Client
    });
  }

  generateMetadata(products: Product[]): VideoMetadata {
    const currentDate = new Date().toLocaleDateString('vi-VN');
    
    const title = `🔥 TOP 5 SẢN PHẨM HOT SHOPEE TUẦN NÀY (${currentDate}) | Giá Rẻ Chất Lượng!`;
    
    const description = this.generateDescription(products);
    
    const tags = [
      'shopee', 'top 5', 'sản phẩm hot', 'giá rẻ', 'trending',
      'shopping', 'deal hot', 'khuyến mãi', 'review sản phẩm',
      'tiktok shop', 'youtube shorts', 'viral', 'hot trend'
    ];
    
    return { title, description, tags };
  }

  private generateDescription(products: Product[]): string {
    let description = `🛒 TOP 5 SẢN PHẨM HOT NHẤT SHOPEE TUẦN NÀY!\n\n`;
    description += `⏰ Cập nhật: ${new Date().toLocaleDateString('vi-VN')}\n\n`;
    
    description += `📋 DANH SÁCH SẢN PHẨM:\n`;
    products.forEach((product, index) => {
      description += `\n${index + 1}️⃣ ${product.name}\n`;
      description += `💰 Giá: ${product.price}\n`;
      description += `📦 Đã bán: ${product.sold}\n`;
      description += `🔗 Link: ${product.link}\n`;
    });
    
    description += `\n\n🔥 HASHTAGS:\n`;
    description += `#Shopee #Top5 #SanPhamHot #GiaRe #Shopping #Deal #KhuyenMai #TrendingNow\n\n`;
    
    description += `📧 Liên hệ hợp tác: contact@yourmail.com\n`;
    description += `📱 Follow để không bỏ lỡ deal hot: @yourchannel\n\n`;
    
    description += `⚠️ Lưu ý: Giá có thể thay đổi theo thời gian thực\n`;
    description += `🎯 Video được tạo tự động để cập nhật thông tin nhanh nhất\n\n`;
    
    if (config.affiliate.tag) {
      description += `💡 Mua qua link trên để ủng hộ kênh nhé!\n`;
    }
    
    return description;
  }

  async uploadVideo(videoPath: string, products: Product[]): Promise<UploadResult> {
    try {
      const { title, description, tags } = this.generateMetadata(products);
      
      console.log('📤 Uploading video to YouTube...');
      console.log(`Title: ${title}`);
      
      const response = await this.youtube.videos.insert({
        part: 'snippet,status',
        requestBody: {
          snippet: {
            title: title,
            description: description,
            tags: tags,
            categoryId: '22', // People & Blogs
            defaultLanguage: 'vi',
            defaultAudioLanguage: 'vi'
          },
          status: {
            privacyStatus: 'public', // or 'private' for testing
            madeForKids: false,
            selfDeclaredMadeForKids: false
          }
        },
        media: {
          body: fs.createReadStream(videoPath)
        }
      });

      const videoId = response.data.id;
      const videoUrl = `https://youtu.be/${videoId}`;
      
      console.log('✅ Video uploaded successfully!');
      console.log(`🔗 Video URL: ${videoUrl}`);
      
      return {
        success: true,
        videoId: videoId,
        url: videoUrl,
        title: title
      };
      
    } catch (error: any) {
      console.error('❌ Upload failed:', error);
      
      if (error.code === 401) {
        console.log('🔑 Authentication failed. Please check your YouTube API credentials.');
      } else if (error.code === 403) {
        console.log('🚫 Quota exceeded or API access denied.');
      }
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Test upload with a small file
  async testUpload(): Promise<UploadResult> {
    const testVideoPath = path.join(__dirname, '../output/test_video.mp4');
    
    // Create a minimal test video if it doesn't exist
    if (!fs.existsSync(testVideoPath)) {
      console.log('⚠️ No test video found. Please generate a video first.');
      return { success: false, error: 'No test video found' };
    }
    
    const mockProducts: Product[] = [{
      name: 'Test Product',
      price: '100.000đ',
      image: 'https://via.placeholder.com/300x300',
      link: 'https://shopee.vn',
      sold: '1 đã bán',
      rank: 1
    }];
    
    return await this.uploadVideo(testVideoPath, mockProducts);
  }
}

// Alternative uploader for other platforms (future implementation)
export class MultiPlatformUploader {
  async uploadToTikTok(videoPath: string, products: Product[]): Promise<UploadResult> {
    // TikTok doesn't have official upload API
    // Would need to use unofficial methods or manual upload
    console.log('⚠️ TikTok upload requires manual process');
    return { success: false, error: 'Manual upload required' };
  }
  
  async uploadToFacebook(videoPath: string, products: Product[]): Promise<UploadResult> {
    // Facebook Reels API is limited
    // Would need Facebook Developer approval
    console.log('⚠️ Facebook upload requires API approval');
    return { success: false, error: 'API approval required' };
  }
}

// For testing
export async function testUploader(): Promise<UploadResult> {
  const uploader = new YouTubeUploader();
  return await uploader.testUpload();
}

if (require.main === module) {
  testUploader().catch(console.error);
}
import dotenv from 'dotenv';
import { Config } from '../types';

dotenv.config();

const config: Config = {
  youtube: {
    clientId: process.env.YOUTUBE_CLIENT_ID || '',
    clientSecret: process.env.YOUTUBE_CLIENT_SECRET || '',
    refreshToken: process.env.YOUTUBE_REFRESH_TOKEN || '',
    scopes: ['https://www.googleapis.com/auth/youtube.upload']
  },
  
  googleCloud: {
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID || '',
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS || ''
  },
  
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN || '',
    chatId: process.env.TELEGRAM_CHAT_ID || ''
  },
  
  shopee: {
    baseUrl: process.env.SHOPEE_BASE_URL || 'https://shopee.vn',
    trendingUrl: process.env.SHOPEE_TRENDING_URL || 'https://shopee.vn/search?order=desc&page=0&sortBy=sales'
  },
  
  video: {
    width: parseInt(process.env.VIDEO_WIDTH || '1080'),
    height: parseInt(process.env.VIDEO_HEIGHT || '1920'),
    fps: parseInt(process.env.VIDEO_FPS || '30'),
    duration: parseInt(process.env.VIDEO_DURATION || '30')
  },
  
  affiliate: {
    tag: process.env.AFFILIATE_TAG || ''
  }
};

export default config;
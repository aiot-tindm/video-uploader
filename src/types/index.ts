export interface Product {
  name: string;
  price: string;
  image: string;
  link: string;
  sold: string;
  rank: number;
}

export interface VideoConfig {
  width: number;
  height: number;
  fps: number;
  duration: number;
}

export interface Config {
  youtube: {
    clientId: string;
    clientSecret: string;
    refreshToken: string;
    scopes: string[];
  };
  googleCloud: {
    projectId: string;
    keyFilename: string;
  };
  telegram: {
    botToken: string;
    chatId: string;
  };
  shopee: {
    baseUrl: string;
    trendingUrl: string;
  };
  video: VideoConfig;
  affiliate: {
    tag: string;
  };
}

export interface UploadResult {
  success: boolean;
  videoId?: string;
  url?: string;
  title?: string;
  error?: string;
}

export interface VideoMetadata {
  title: string;
  description: string;
  tags: string[];
}

export interface LogEntry {
  timestamp: string;
  level: 'info' | 'success' | 'error' | 'warning';
  message: string;
  data?: any;
}

export interface Stats {
  videosCreated: number;
  videosUploaded: number;
  errors: number;
  productsScraped: number;
}

export interface SystemResult {
  success: boolean;
  products?: Product[];
  videoPath?: string;
  audioPath?: string | null;
  uploadResult?: UploadResult;
  error?: string;
}

export type LogLevel = 'info' | 'success' | 'error' | 'warning';

export interface TTSRequest {
  input: { text: string };
  voice: {
    languageCode: string;
    name: string;
    ssmlGender: string;
  };
  audioConfig: {
    audioEncoding: string;
    speakingRate: number;
    pitch: number;
    volumeGainDb: number;
  };
}

export interface NotificationMessage {
  title: string;
  url: string;
  time?: string;
}

export interface ErrorNotification {
  message: string;
  time?: string;
}

export interface DailyReport {
  videosCreated: number;
  videosUploaded: number;
  errors: number;
  productsScraped: number;
}
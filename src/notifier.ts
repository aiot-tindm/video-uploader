import TelegramBot from 'node-telegram-bot-api';
import config from './config';
import { LogEntry, LogLevel, Stats, UploadResult, NotificationMessage, ErrorNotification, DailyReport } from './types';

export class NotificationService {
  private bot?: TelegramBot;

  constructor() {
    if (config.telegram.botToken) {
      this.bot = new TelegramBot(config.telegram.botToken);
    }
  }

  async sendTelegram(message: string): Promise<boolean> {
    if (!this.bot || !config.telegram.chatId) {
      console.log('📱 Telegram not configured, skipping notification');
      return false;
    }

    try {
      await this.bot.sendMessage(config.telegram.chatId, message, {
        parse_mode: 'HTML',
        disable_web_page_preview: false
      });
      console.log('✅ Telegram notification sent');
      return true;
    } catch (error: any) {
      console.error('❌ Telegram notification failed:', error.message);
      return false;
    }
  }

  async sendSuccessNotification(result: UploadResult): Promise<void> {
    const message = `
🎉 <b>Video Upload Successful!</b>

📹 <b>Title:</b> ${result.title}
🔗 <b>URL:</b> ${result.url}
⏰ <b>Time:</b> ${new Date().toLocaleString('vi-VN')}

✅ Auto-upload completed successfully!
    `.trim();

    await this.sendTelegram(message);
  }

  async sendErrorNotification(error: Error): Promise<void> {
    const message = `
❌ <b>Video Upload Failed!</b>

🚨 <b>Error:</b> ${error.message}
⏰ <b>Time:</b> ${new Date().toLocaleString('vi-VN')}

Please check the logs for more details.
    `.trim();

    await this.sendTelegram(message);
  }

  async sendDailyReport(stats: Stats): Promise<void> {
    const message = `
📊 <b>Daily Report - Auto Shopee Videos</b>

📈 <b>Today's Stats:</b>
• Videos created: ${stats.videosCreated}
• Videos uploaded: ${stats.videosUploaded}
• Errors: ${stats.errors}

🛒 <b>Products scraped:</b> ${stats.productsScraped}
⏰ <b>Report time:</b> ${new Date().toLocaleString('vi-VN')}

🔥 Keep it up! Your automation is working great!
    `.trim();

    await this.sendTelegram(message);
  }

  // Console logger for when Telegram is not available
  logToConsole(type: LogLevel, message: string): void {
    const timestamp = new Date().toLocaleString('vi-VN');
    const emoji = {
      success: '✅',
      error: '❌',
      info: 'ℹ️',
      warning: '⚠️'
    }[type] || 'ℹ️';

    console.log(`\n${emoji} [${timestamp}] ${type.toUpperCase()}`);
    console.log(message);
    console.log('─'.repeat(50));
  }
}

export class Logger {
  private logs: LogEntry[] = [];
  private stats: Stats = {
    videosCreated: 0,
    videosUploaded: 0,
    errors: 0,
    productsScraped: 0
  };

  log(level: LogLevel, message: string, data?: any): void {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data
    };

    this.logs.push(logEntry);
    
    // Also log to console
    const emoji = {
      info: 'ℹ️',
      success: '✅',
      error: '❌',
      warning: '⚠️'
    }[level] || 'ℹ️';

    console.log(`${emoji} [${new Date().toLocaleString('vi-VN')}] ${message}`);
    
    if (data) {
      console.log('   Data:', data);
    }
  }

  updateStats(key: keyof Stats, increment: number = 1): void {
    if (this.stats.hasOwnProperty(key)) {
      this.stats[key] += increment;
    }
  }

  getStats(): Stats {
    return { ...this.stats };
  }

  exportLogs(): { stats: Stats; logs: LogEntry[] } {
    return {
      stats: this.getStats(),
      logs: this.logs.slice(-100) // Last 100 logs
    };
  }
}

// For testing
export async function testNotifications(): Promise<boolean> {
  const notifier = new NotificationService();
  const logger = new Logger();

  // Test console logging
  logger.log('info', 'Testing notification system...');
  
  // Test Telegram notification
  const testResult: UploadResult = {
    success: true,
    title: 'Test Video - Top 5 Shopee Products',
    url: 'https://youtu.be/test123',
    videoId: 'test123'
  };

  await notifier.sendSuccessNotification(testResult);
  
  // Test stats
  logger.updateStats('videosCreated');
  logger.updateStats('videosUploaded');
  
  console.log('📊 Current stats:', logger.getStats());
  
  return true;
}

if (require.main === module) {
  testNotifications().catch(console.error);
}
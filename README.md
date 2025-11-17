# 🚀 Auto TikTok/YT Shorts - Top 5 Shopee Products

Automated system that generates weekly TikTok/YouTube Shorts videos featuring top trending Shopee products with **ZERO initial cost**. Built with **TypeScript** for maximum reliability and developer experience.

## ✨ Features

- 🕷️ **Auto Shopee Scraping**: Gets top 5 trending products weekly
- 🎬 **Video Generation**: Creates engaging vertical videos (1080x1920)
- 🎤 **Vietnamese TTS**: Natural voice narration
- 📤 **Auto Upload**: Publishes to YouTube automatically
- 📱 **Smart Notifications**: Telegram alerts on success/failure
- ⏰ **Scheduled Execution**: Runs weekly via GitHub Actions
- 💰 **100% Free**: Uses only free APIs and tools
- 🔧 **TypeScript**: Full type safety and modern development experience

## 🏗️ Architecture

```
GitHub Actions (Cron) → Shopee Scraper → TTS Generator → Video Builder → YouTube Upload → Telegram Notify
```

## 🛠️ Setup Guide

### 1. Prerequisites (All Free)

- GitHub account
- Google Cloud account (free tier)
- YouTube Channel
- Telegram Bot (optional)

### 2. Installation

```bash
# Clone this repository
git clone <your-repo-url>
cd video-uploader

# Install dependencies
npm install
```

### 3. Configuration

#### 3.1 Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

#### 3.2 YouTube API Setup (Free)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (free)
3. Enable YouTube Data API v3
4. Create OAuth 2.0 credentials
5. Get your refresh token using OAuth playground

**Detailed YouTube Setup:**
```bash
# 1. Create OAuth credentials
# 2. Use Google OAuth Playground: https://developers.google.com/oauthplayground/
# 3. Select YouTube Data API v3
# 4. Exchange authorization code for tokens
# 5. Copy refresh_token to .env file
```

#### 3.3 Google Cloud TTS (Free Tier)

1. Enable Text-to-Speech API in Google Cloud
2. Create service account
3. Download JSON key file
4. Save as `src/config/google-credentials.json`

#### 3.4 Telegram Bot (Optional)

1. Message @BotFather on Telegram
2. Create new bot with `/newbot`
3. Get bot token
4. Get your chat ID by messaging @userinfobot

### 4. GitHub Actions Setup

#### 4.1 Repository Secrets

Add these secrets in your GitHub repository settings:

```
YOUTUBE_CLIENT_ID=your_client_id
YOUTUBE_CLIENT_SECRET=your_client_secret  
YOUTUBE_REFRESH_TOKEN=your_refresh_token
GOOGLE_CLOUD_PROJECT_ID=your_project_id
GOOGLE_CREDENTIALS=your_json_credentials_content
TELEGRAM_BOT_TOKEN=your_bot_token (optional)
TELEGRAM_CHAT_ID=your_chat_id (optional)
```

#### 4.2 Enable GitHub Actions

1. Go to your repository settings
2. Enable GitHub Actions
3. The workflow will run every Sunday at 10:00 AM UTC

## 🚀 Usage

### Manual Run (Testing)

```bash
# Test individual components (TypeScript)
npm run scrape      # Test Shopee scraping
npm run generate    # Test video generation  
npm run upload      # Test YouTube upload

# Run complete system
npm start

# Development with hot reload
npm run dev

# Type checking
npx tsc --noEmit

# Build TypeScript
npm run build
```

### Automated Run

The system runs automatically every Sunday via GitHub Actions. You can also trigger it manually:

1. Go to your repository's "Actions" tab
2. Select "Auto Shopee Video Generator"
3. Click "Run workflow"

## 📊 Cost Breakdown (All Free!)

| Service | Free Tier | Monthly Usage |
|---------|-----------|---------------|
| GitHub Actions | 2000 minutes | ~20 minutes |
| Google Cloud TTS | 300 requests | ~4 requests |
| YouTube API | 10,000 requests/day | ~50 requests |
| Telegram Bot | Unlimited | Unlimited |
| **Total Cost** | **$0** | **$0** |

## 🔧 Customization

### Video Settings

Edit `src/config/index.js`:

```javascript
video: {
  width: 1080,        // Video width
  height: 1920,       // Video height (vertical)
  fps: 30,            // Frame rate
  duration: 30        // Video length in seconds
}
```

### Scheduling

Edit `.github/workflows/auto-video.yml`:

```yaml
schedule:
  # Every Sunday at 10:00 AM UTC
  - cron: '0 10 * * 0'
  
  # Every day at 6:00 AM UTC  
  # - cron: '0 6 * * *'
  
  # Twice a week (Sunday & Wednesday)
  # - cron: '0 10 * * 0,3'
```

## 🛠️ Troubleshooting

### Common Issues

1. **YouTube Upload Fails**
   ```bash
   # Check quota limits
   # Verify OAuth credentials
   # Test with manual upload first
   ```

2. **Scraping Returns No Products**
   ```bash
   # Shopee might have changed their HTML structure
   # Update selectors in src/scraper.js
   # Test locally first
   ```

3. **TTS Generation Fails**
   ```bash
   # Check Google Cloud credentials
   # Verify billing account (free tier)
   # System falls back to text-only videos
   ```

4. **GitHub Actions Timeout**
   ```bash
   # Optimize video generation
   # Reduce video duration
   # Split into multiple workflows
   ```

### Debug Mode

```bash
# Enable verbose logging
DEBUG=true npm start

# Test individual components
node src/scraper.js
node src/video-generator.js  
node src/uploader.js
```

## 📈 Scaling (Still Free!)

### Multiple Channels

1. Create separate repositories for each channel
2. Use different YouTube channels
3. Modify scheduling to avoid conflicts

### Different Product Categories

1. Modify scraper selectors for different Shopee categories
2. Update video templates in `video-generator.js`
3. Customize TTS scripts in `tts-generator.js`

### Additional Platforms

- **TikTok**: Requires manual upload (no official API)
- **Instagram Reels**: Requires Facebook Business API approval
- **Facebook Reels**: Limited API access

## 📝 File Structure

```
video-uploader/
├── src/
│   ├── types/index.ts           # TypeScript type definitions
│   ├── config/index.ts          # Typed configuration
│   ├── scraper.ts               # Shopee scraper with types
│   ├── mock-scraper.ts          # Mock data with types
│   ├── video-generator.ts       # Video creation with types
│   ├── simple-video-generator.ts # Fallback generator
│   ├── tts-generator.ts         # Text-to-speech with types
│   ├── uploader.ts              # YouTube upload with types
│   ├── notifier.ts              # Telegram notifications with types
│   └── index.ts                 # Main orchestrator (TypeScript)
├── .github/workflows/
│   └── auto-video.yml           # GitHub Actions workflow
├── output/                      # Generated videos (temp)
├── tsconfig.json                # TypeScript configuration
├── package.json                 # Dependencies
├── test.ts                      # TypeScript test runner
├── .env.example                 # Environment template
├── TYPESCRIPT-MIGRATION.md     # TypeScript features guide
└── README.md                    # This file
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## ⚠️ Legal Notice

- Respect Shopee's robots.txt and terms of service
- Use scraped data responsibly
- Don't overwhelm servers with requests
- Consider affiliate disclosure in videos
- Comply with YouTube monetization policies

## 📞 Support

- 🐛 Bug reports: Create GitHub issue
- 💡 Feature requests: Create GitHub discussion
- 📧 Contact: [Your email]

## 🎯 Roadmap

- [ ] Support for multiple Shopee regions
- [ ] Instagram Reels integration
- [ ] Custom video templates
- [ ] Product price tracking
- [ ] Analytics dashboard
- [ ] Multi-language support

---

**Made with ❤️ for the Vietnamese e-commerce community**

🚀 **Start your automated content empire today - completely free!**
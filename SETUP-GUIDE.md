# 🚀 Quick Setup Guide - Zero Cost Implementation

Follow this step-by-step guide to get your auto video system running in **30 minutes** with **$0 cost**.

## 📋 Checklist

- [ ] GitHub account
- [ ] Google account  
- [ ] YouTube channel
- [ ] 30 minutes of time

## 🎯 Step 1: YouTube API Setup (15 minutes)

### 1.1 Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "New Project"
3. Name: "Shopee Auto Videos"
4. Click "Create"

### 1.2 Enable YouTube API

1. Go to "APIs & Services" > "Library"
2. Search "YouTube Data API v3"
3. Click "Enable"

### 1.3 Create OAuth Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Configure consent screen:
   - User Type: External
   - App name: "Shopee Video Auto"
   - User support email: your email
   - Developer email: your email
4. Create OAuth client:
   - Application type: Desktop application
   - Name: "Shopee Auto Client"
5. Download credentials JSON

### 1.4 Get Refresh Token

1. Go to [OAuth Playground](https://developers.google.com/oauthplayground/)
2. Click settings gear ⚙️
3. Check "Use your own OAuth credentials"
4. Enter your Client ID and Secret
5. In left panel, find "YouTube Data API v3"
6. Select scope: `https://www.googleapis.com/auth/youtube.upload`
7. Click "Authorize APIs"
8. Sign in with your YouTube account
9. Click "Exchange authorization code for tokens"
10. Copy the `refresh_token` (save this!)

## 🎯 Step 2: Google Cloud TTS Setup (5 minutes)

### 2.1 Enable TTS API

1. In Google Cloud Console
2. Go to "APIs & Services" > "Library"  
3. Search "Cloud Text-to-Speech API"
4. Click "Enable"

### 2.2 Create Service Account

1. Go to "IAM & Admin" > "Service Accounts"
2. Click "Create Service Account"
3. Name: "tts-service"
4. Role: "Cloud Text-to-Speech User"
5. Click "Create"
6. Click on the created service account
7. Go to "Keys" tab
8. Click "Add Key" > "Create new key"
9. Choose "JSON"
10. Download the key file (save as `google-credentials.json`)

## 🎯 Step 3: Telegram Bot Setup (5 minutes) - Optional

### 3.1 Create Bot

1. Open Telegram
2. Message @BotFather
3. Send `/newbot`
4. Choose bot name: "Shopee Video Bot"
5. Choose username: "your_shopee_bot"
6. Copy the bot token

### 3.2 Get Chat ID

1. Message @userinfobot
2. Copy your user ID (this is your chat_id)

## 🎯 Step 4: Repository Setup (5 minutes)

### 4.1 Fork Repository

1. Fork this repository to your GitHub account
2. Clone to your local machine (optional for testing)

### 4.2 Add GitHub Secrets

Go to your repository Settings > Secrets and variables > Actions

Add these secrets:

```
Name: YOUTUBE_CLIENT_ID
Value: [from OAuth credentials]

Name: YOUTUBE_CLIENT_SECRET  
Value: [from OAuth credentials]

Name: YOUTUBE_REFRESH_TOKEN
Value: [from OAuth playground]

Name: GOOGLE_CLOUD_PROJECT_ID
Value: [your project ID]

Name: GOOGLE_CREDENTIALS
Value: [entire content of google-credentials.json file]

Name: TELEGRAM_BOT_TOKEN (optional)
Value: [from BotFather]

Name: TELEGRAM_CHAT_ID (optional)  
Value: [from userinfobot]
```

## 🎯 Step 5: Test Run

### 5.1 Manual Trigger

1. Go to your repository
2. Click "Actions" tab
3. Select "Auto Shopee Video Generator"
4. Click "Run workflow"
5. Click green "Run workflow" button

### 5.2 Check Results

- Watch the workflow run in real-time
- Check your YouTube channel for uploaded video
- Check Telegram for notification (if configured)

## 🔧 Local Testing (Optional)

If you want to test locally before GitHub Actions:

```bash
# Clone your repository
git clone https://github.com/yourusername/video-uploader.git
cd video-uploader

# Install dependencies  
npm install

# Create .env file
cp .env.example .env

# Edit .env with your credentials
nano .env

# Create Google credentials file
mkdir -p src/config
# Copy your google-credentials.json to src/config/

# Test individual components
npm run scrape      # Test scraping
npm run generate    # Test video generation (requires products)
npm run upload      # Test upload (requires video)

# Run full system
npm start
```

## ⚙️ Configuration Options

### Change Schedule

Edit `.github/workflows/auto-video.yml`:

```yaml
# Weekly on Sunday at 10 AM UTC
- cron: '0 10 * * 0'

# Daily at 6 AM UTC
- cron: '0 6 * * *'  

# Twice a week (Wednesday & Sunday)
- cron: '0 10 * * 0,3'
```

### Customize Video

Edit `src/config/index.js`:

```javascript
video: {
  width: 1080,           // Can change to 720 for smaller files
  height: 1920,          // Keep for vertical format
  fps: 30,               // Can reduce to 24 for smaller files  
  duration: 30           // 15-60 seconds recommended
}
```

## 🚨 Troubleshooting

### Issue: YouTube quota exceeded

**Solution:** 
- Wait 24 hours for quota reset
- Reduce upload frequency
- Multiple Google accounts for more quota

### Issue: Scraping fails

**Solution:**
- Shopee changed their website structure
- Update selectors in `src/scraper.js`
- Test locally first

### Issue: TTS fails

**Solution:**
- Check Google Cloud billing account enabled
- Verify service account permissions
- System will fallback to text-only videos

### Issue: GitHub Actions timeout

**Solution:**
- Reduce video duration
- Optimize image sizes
- Split workflow into smaller parts

## 📊 Usage Monitoring

### Free Tier Limits

- **GitHub Actions**: 2000 minutes/month (you use ~5 minutes/week)
- **Google TTS**: 300 requests/month (you use ~4/week)  
- **YouTube API**: 10,000 requests/day (you use ~20/week)

### Stay Within Limits

- Don't run more than daily
- Monitor GitHub Actions usage
- Use shorter TTS scripts
- Optimize video generation

## 🎉 Success Metrics

After setup, you should see:
- ✅ Weekly videos auto-posted to YouTube
- ✅ Professional-looking content
- ✅ Vietnamese narration
- ✅ Trending Shopee products
- ✅ Telegram notifications
- ✅ Zero monthly costs

## 🔄 Next Steps

1. **Week 1**: Monitor first few auto-uploads
2. **Week 2**: Customize video templates  
3. **Week 3**: Add affiliate links
4. **Week 4**: Optimize for better engagement

## 💡 Pro Tips

- Start with private videos to test
- Use eye-catching thumbnails (auto-generated)
- Add trending hashtags in descriptions
- Monitor which products get best engagement
- Consider multiple channels for different niches

---

🎊 **Congratulations! Your auto video empire is now running!** 

Check your YouTube channel every Sunday for fresh content! 📺✨
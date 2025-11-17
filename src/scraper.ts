import config from './config';
import { MockShopeeScraper } from './mock-scraper';
import { Product } from './types';

let puppeteer: any;
let puppeteerAvailable = false;

try {
  puppeteer = require('puppeteer');
  puppeteerAvailable = true;
  console.log('✅ Puppeteer available - using real scraping');
} catch (error) {
  console.log('⚠️ Puppeteer not available - using mock data');
  puppeteerAvailable = false;
}

export class ShopeeScraper {
  private browser: any = null;
  private page: any = null;
  private mockScraper?: MockShopeeScraper;

  constructor() {
    if (!puppeteerAvailable) {
      this.mockScraper = new MockShopeeScraper();
      return;
    }
  }

  async init(): Promise<void> {
    if (!puppeteerAvailable) {
      await this.mockScraper!.init();
      return;
    }
    
    try {
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      this.page = await this.browser.newPage();
      
      // Set Vietnamese user agent
      await this.page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      );
    } catch (error) {
      console.log('⚠️ Puppeteer failed to launch, falling back to mock data');
      this.mockScraper = new MockShopeeScraper();
      await this.mockScraper.init();
      return;
    }
  }

  async scrapeTopProducts(limit: number = 5): Promise<Product[]> {
    if (!puppeteerAvailable || this.mockScraper) {
      return await this.mockScraper!.scrapeTopProducts(limit);
    }
    
    try {
      await this.page.goto(config.shopee.trendingUrl, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      });

      // Wait for products to load
      await this.page.waitForSelector('[data-sqe="item"]', { timeout: 10000 });

      const products: Product[] = await this.page.evaluate((limit: number) => {
        const items = (globalThis as any).document.querySelectorAll('[data-sqe="item"]');
        const results: any[] = [];

        for (let i = 0; i < Math.min(items.length, limit); i++) {
          const item = items[i];
          
          try {
            const nameElement = item.querySelector('[data-sqe="name"]');
            const priceElement = item.querySelector('.ZEgDH9, ._1w9jLI');
            const imageElement = item.querySelector('img');
            const linkElement = item.querySelector('a');
            const soldElement = item.querySelector('._1cEkb-');

            if (nameElement && priceElement && imageElement && linkElement) {
              results.push({
                name: nameElement.textContent?.trim() || '',
                price: priceElement.textContent?.trim() || '',
                image: imageElement.src || '',
                link: 'https://shopee.vn' + linkElement.getAttribute('href'),
                sold: soldElement ? soldElement.textContent?.trim() || '0 đã bán' : '0 đã bán',
                rank: i + 1
              });
            }
          } catch (error) {
            console.log(`Error parsing item ${i}:`, error);
          }
        }

        return results;
      }, limit);

      return products;
    } catch (error: any) {
      console.error('⚠️ Real scraping failed, using mock data:', error.message);
      
      // Fallback to mock scraper
      if (!this.mockScraper) {
        this.mockScraper = new MockShopeeScraper();
        await this.mockScraper.init();
      }
      
      return await this.mockScraper.scrapeTopProducts(limit);
    }
  }

  async close(): Promise<void> {
    if (!puppeteerAvailable || this.mockScraper) {
      await this.mockScraper!.close();
      return;
    }
    
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// For testing
export async function testScraper(): Promise<Product[]> {
  const scraper = new ShopeeScraper();
  await scraper.init();
  
  console.log('🔍 Scraping top 5 Shopee products...');
  const products = await scraper.scrapeTopProducts(5);
  
  console.log('📊 Results:');
  products.forEach((product, index) => {
    console.log(`${index + 1}. ${product.name}`);
    console.log(`   Price: ${product.price}`);
    console.log(`   Sold: ${product.sold}`);
    console.log(`   Link: ${product.link}`);
    console.log(`   Image: ${product.image}`);
    console.log('---');
  });
  
  await scraper.close();
  return products;
}

if (require.main === module) {
  testScraper().catch(console.error);
}
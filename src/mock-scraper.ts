import { Product } from './types';

export class MockShopeeScraper {
  private mockProducts: Product[] = [
    {
      name: 'Áo thun nam nữ form rộng phong cách Hàn Quốc',
      price: '₫89.000',
      image: 'https://cf.shopee.vn/file/placeholder_product_1',
      link: 'https://shopee.vn/product/1',
      sold: '1.2k+ đã bán',
      rank: 1
    },
    {
      name: 'Giày sneaker thể thao nam nữ hot trend 2024',
      price: '₫299.000',
      image: 'https://cf.shopee.vn/file/placeholder_product_2',
      link: 'https://shopee.vn/product/2',
      sold: '850+ đã bán',
      rank: 2
    },
    {
      name: 'Balo laptop chống nước cao cấp',
      price: '₫199.000',
      image: 'https://cf.shopee.vn/file/placeholder_product_3',
      link: 'https://shopee.vn/product/3',
      sold: '560+ đã bán',
      rank: 3
    },
    {
      name: 'Ốp lưng iPhone 15 Pro Max silicon mềm',
      price: '₫45.000',
      image: 'https://cf.shopee.vn/file/placeholder_product_4',
      link: 'https://shopee.vn/product/4',
      sold: '2.1k+ đã bán',
      rank: 4
    },
    {
      name: 'Tai nghe Bluetooth không dây chống ồn',
      price: '₫599.000',
      image: 'https://cf.shopee.vn/file/placeholder_product_5',
      link: 'https://shopee.vn/product/5',
      sold: '430+ đã bán',
      rank: 5
    }
  ];

  async init(): Promise<boolean> {
    console.log('🔧 Mock scraper initialized');
    return true;
  }

  async scrapeTopProducts(limit: number = 5): Promise<Product[]> {
    console.log('🕷️ Using mock Shopee data (fallback mode)');
    
    // Simulate real scraping delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Return shuffled products to simulate daily changes
    const shuffled = [...this.mockProducts].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, limit);
  }

  async close(): Promise<boolean> {
    console.log('🔄 Mock scraper closed');
    return true;
  }
}

// For testing
export async function testMockScraper(): Promise<Product[]> {
  const scraper = new MockShopeeScraper();
  await scraper.init();
  
  console.log('🔍 Scraping mock top 5 Shopee products...');
  const products = await scraper.scrapeTopProducts(5);
  
  console.log('📊 Results:');
  products.forEach((product, index) => {
    console.log(`${index + 1}. ${product.name}`);
    console.log(`   Price: ${product.price}`);
    console.log(`   Sold: ${product.sold}`);
    console.log(`   Link: ${product.link}`);
    console.log('---');
  });
  
  await scraper.close();
  return products;
}

if (require.main === module) {
  testMockScraper().catch(console.error);
}
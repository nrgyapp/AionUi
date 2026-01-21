/**
 * Web Scraper Template
 * Template for scraping data from websites with Puppeteer
 */

const puppeteer = require('puppeteer');
const fs = require('fs');

async function scrapeWebsite() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    // Navigate to target page
    await page.goto('https://example.com', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Wait for content to load
    await page.waitForSelector('.content-container');

    // Extract data
    const data = await page.evaluate(() => {
      // This code runs in the browser context
      const items = [];
      
      document.querySelectorAll('.item').forEach(item => {
        items.push({
          title: item.querySelector('.title')?.textContent.trim(),
          description: item.querySelector('.description')?.textContent.trim(),
          price: item.querySelector('.price')?.textContent.trim(),
          link: item.querySelector('a')?.href,
          image: item.querySelector('img')?.src
        });
      });
      
      return {
        pageTitle: document.title,
        timestamp: new Date().toISOString(),
        items: items
      };
    });

    // Handle pagination (if needed)
    let currentPage = 1;
    const maxPages = 5;
    
    while (currentPage < maxPages) {
      const nextButton = await page.$('.next-page');
      if (!nextButton) break;
      
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle2' }),
        nextButton.click()
      ]);
      
      // Extract data from next page
      // ... add to data.items
      
      currentPage++;
    }

    // Save results
    fs.writeFileSync('scraped_data.json', JSON.stringify(data, null, 2));
    console.log(`Scraped ${data.items.length} items`);

  } catch (error) {
    console.error('Scraping error:', error);
  } finally {
    await browser.close();
  }
}

// Run the scraper
scrapeWebsite();

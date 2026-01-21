#!/usr/bin/env node

/**
 * Screenshot Capture Script
 * Captures screenshots of web pages
 * 
 * Usage: node screenshot.js <url> <output.png> [--fullPage] [--selector='css-selector']
 */

const puppeteer = require('puppeteer');

async function takeScreenshot(url, outputPath, options = {}) {
  let browser;
  
  try {
    // Launch browser
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Navigate to URL
    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Take screenshot
    const screenshotOptions = {
      path: outputPath,
      fullPage: options.fullPage || false
    };
    
    if (options.selector) {
      console.log(`Capturing element: ${options.selector}`);
      const element = await page.waitForSelector(options.selector);
      await element.screenshot({ path: outputPath });
    } else {
      console.log('Capturing screenshot...');
      await page.screenshot(screenshotOptions);
    }
    
    console.log(`Screenshot saved to ${outputPath}`);
    
  } catch (error) {
    console.error('Error taking screenshot:', error.message);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('Usage: node screenshot.js <url> <output.png> [--fullPage] [--selector="css-selector"]');
    process.exit(1);
  }
  
  const url = args[0];
  const outputPath = args[1];
  const options = {
    fullPage: args.includes('--fullPage'),
    selector: args.find(arg => arg.startsWith('--selector='))?.split('=')[1]
  };
  
  takeScreenshot(url, outputPath, options);
}

module.exports = { takeScreenshot };

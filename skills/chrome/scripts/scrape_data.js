#!/usr/bin/env node

/**
 * Web Scraping Script
 * Extracts structured data from web pages using Puppeteer
 * 
 * Usage: node scrape_data.js <url> <selectors.json> <output.json>
 */

const puppeteer = require('puppeteer');
const fs = require('fs');

async function scrapeData(url, selectorsPath, outputPath) {
  let browser;
  
  try {
    // Read selectors configuration
    const config = JSON.parse(fs.readFileSync(selectorsPath, 'utf8'));
    
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
    
    // Extract data based on configuration
    console.log('Extracting data...');
    const data = await page.evaluate((config) => {
      const extractValue = (element, fieldSelector) => {
        // Handle attribute extraction (e.g., "a@href")
        if (fieldSelector.includes('@')) {
          const [sel, attr] = fieldSelector.split('@');
          const el = sel ? element.querySelector(sel) : element;
          return el ? el.getAttribute(attr) : null;
        }
        
        const el = element.querySelector(fieldSelector);
        return el ? el.textContent.trim() : null;
      };
      
      const result = {};
      
      for (const [key, value] of Object.entries(config)) {
        if (typeof value === 'string') {
          // Simple selector
          result[key] = extractValue(document, value);
        } else if (value.multiple) {
          // Multiple items
          const items = Array.from(document.querySelectorAll(value.selector));
          result[key] = items.map(item => {
            const itemData = {};
            for (const [fieldKey, fieldSelector] of Object.entries(value.fields)) {
              itemData[fieldKey] = extractValue(item, fieldSelector);
            }
            return itemData;
          });
        } else {
          // Single complex item
          const element = document.querySelector(value.selector);
          if (element && value.fields) {
            result[key] = {};
            for (const [fieldKey, fieldSelector] of Object.entries(value.fields)) {
              result[key][fieldKey] = extractValue(element, fieldSelector);
            }
          }
        }
      }
      
      return result;
    }, config);
    
    // Save results
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
    console.log(`Data saved to ${outputPath}`);
    console.log(`Extracted ${Object.keys(data).length} fields`);
    
  } catch (error) {
    console.error('Error scraping data:', error.message);
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
  
  if (args.length < 3) {
    console.error('Usage: node scrape_data.js <url> <selectors.json> <output.json>');
    process.exit(1);
  }
  
  const [url, selectorsPath, outputPath] = args;
  scrapeData(url, selectorsPath, outputPath);
}

module.exports = { scrapeData };

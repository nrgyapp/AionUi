#!/usr/bin/env node

/**
 * Extract Data Script
 * Extracts data from web pages using CSS selectors
 */

const { chromium } = require('playwright');
const fs = require('fs').promises;

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const config = {
    url: null,
    selector: null,
    output: 'extracted_data.json',
    format: 'json', // json, csv, or text
    headless: true,
    timeout: 30000,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--url':
        config.url = args[++i];
        break;
      case '--selector':
        config.selector = args[++i];
        break;
      case '--output':
        config.output = args[++i];
        break;
      case '--format':
        config.format = args[++i];
        break;
      case '--headless':
        config.headless = args[++i] === 'true';
        break;
      case '--timeout':
        config.timeout = parseInt(args[++i], 10);
        break;
      case '--help':
        console.log(`
Usage: node extract_data.js --url <page_url> --selector <css_selector> [options]

Options:
  --url <url>          Page URL to extract from (required)
  --selector <sel>     CSS selector for elements to extract (required)
  --output <file>      Output file (default: extracted_data.json)
  --format <fmt>       Output format: json, csv, or text (default: json)
  --headless <bool>    Run in headless mode (default: true)
  --timeout <ms>       Page load timeout (default: 30000)
  --help               Show this help message
        `);
        process.exit(0);
    }
  }

  if (!config.url) {
    console.error('Error: --url parameter is required');
    process.exit(1);
  }

  if (!config.selector) {
    console.error('Error: --selector parameter is required');
    process.exit(1);
  }

  return config;
}

// Convert data to CSV format
function toCSV(data) {
  if (data.length === 0) return '';

  // If data is array of objects, convert to CSV
  if (typeof data[0] === 'object' && !Array.isArray(data[0])) {
    const headers = Object.keys(data[0]);
    const rows = data.map((item) =>
      headers.map((header) => JSON.stringify(item[header] || '')).join(',')
    );
    return [headers.join(','), ...rows].join('\n');
  }

  // If data is array of arrays
  if (Array.isArray(data[0])) {
    return data.map((row) => row.map((cell) => JSON.stringify(cell)).join(',')).join('\n');
  }

  // Simple array
  return data.join('\n');
}

// Extract data from page
async function extractData(config) {
  let browser = null;

  try {
    console.log('Launching browser...');
    browser = await chromium.launch({
      headless: config.headless,
      timeout: config.timeout,
    });

    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
    });

    const page = await context.newPage();

    console.log(`Navigating to ${config.url}...`);
    await page.goto(config.url, {
      waitUntil: 'networkidle',
      timeout: config.timeout,
    });

    // Wait a bit for dynamic content
    await page.waitForTimeout(2000);

    console.log(`Extracting data with selector: ${config.selector}...`);

    // Try to extract table data if selector is a table
    const isTable = await page.evaluate((sel) => {
      const element = document.querySelector(sel);
      return element && element.tagName === 'TABLE';
    }, config.selector);

    let extractedData;

    if (isTable) {
      // Extract table data
      extractedData = await page.$$eval(config.selector, (tables) => {
        return tables.map((table) => {
          const rows = Array.from(table.querySelectorAll('tr'));
          return rows.map((row) => {
            const cells = Array.from(row.querySelectorAll('td, th'));
            return cells.map((cell) => cell.textContent?.trim() || '');
          });
        });
      });

      // Flatten if only one table
      if (extractedData.length === 1) {
        extractedData = extractedData[0];
      }
    } else {
      // Extract text content from all matching elements
      extractedData = await page.$$eval(config.selector, (elements) => {
        return elements.map((el) => ({
          text: el.textContent?.trim() || '',
          html: el.innerHTML,
          tag: el.tagName,
          attributes: Array.from(el.attributes).reduce((acc, attr) => {
            acc[attr.name] = attr.value;
            return acc;
          }, {}),
        }));
      });
    }

    console.log(`Extracted ${Array.isArray(extractedData) ? extractedData.length : 1} items`);

    // Format and save data
    let output;
    let outputData;

    switch (config.format) {
      case 'csv':
        output = toCSV(extractedData);
        outputData = output;
        break;
      case 'text':
        if (Array.isArray(extractedData)) {
          output = extractedData
            .map((item) => (typeof item === 'string' ? item : item.text || JSON.stringify(item)))
            .join('\n');
        } else {
          output = JSON.stringify(extractedData);
        }
        outputData = output;
        break;
      case 'json':
      default:
        outputData = {
          timestamp: new Date().toISOString(),
          url: config.url,
          selector: config.selector,
          itemCount: Array.isArray(extractedData) ? extractedData.length : 1,
          data: extractedData,
        };
        output = JSON.stringify(outputData, null, 2);
        break;
    }

    console.log(`Saving to ${config.output}...`);
    await fs.writeFile(config.output, output);

    console.log('Done!');
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run the script
const config = parseArgs();
extractData(config);

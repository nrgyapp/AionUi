#!/usr/bin/env node

/**
 * PDF Generation Script
 * Converts web pages to PDF format
 * 
 * Usage: node generate_pdf.js <url> <output.pdf> [--landscape] [--format=A4]
 */

const puppeteer = require('puppeteer');

async function generatePDF(url, outputPath, options = {}) {
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
    
    // Navigate to URL
    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Generate PDF
    console.log('Generating PDF...');
    const pdfOptions = {
      path: outputPath,
      format: options.format || 'A4',
      landscape: options.landscape || false,
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      }
    };
    
    await page.pdf(pdfOptions);
    
    console.log(`PDF saved to ${outputPath}`);
    
  } catch (error) {
    console.error('Error generating PDF:', error.message);
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
    console.error('Usage: node generate_pdf.js <url> <output.pdf> [--landscape] [--format=A4]');
    process.exit(1);
  }
  
  const url = args[0];
  const outputPath = args[1];
  const options = {
    landscape: args.includes('--landscape'),
    format: args.find(arg => arg.startsWith('--format='))?.split('=')[1] || 'A4'
  };
  
  generatePDF(url, outputPath, options);
}

module.exports = { generatePDF };

#!/usr/bin/env node

/**
 * Form Filling Script
 * Automates filling out web forms using Puppeteer
 * 
 * Usage: node fill_form.js <url> <form_data.json> [output_screenshot.png]
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function fillForm(url, formDataPath, screenshotPath) {
  let browser;
  
  try {
    // Read form data
    const formData = JSON.parse(fs.readFileSync(formDataPath, 'utf8'));
    
    // Launch browser with Windows compatibility
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
    
    // Fill form fields
    console.log('Filling form fields...');
    for (const [selector, value] of Object.entries(formData.selectors)) {
      if (value === 'click') {
        console.log(`Clicking: ${selector}`);
        await page.click(selector);
      } else {
        console.log(`Filling ${selector} with: ${value}`);
        await page.waitForSelector(selector, { timeout: 5000 });
        await page.type(selector, String(value));
      }
      
      // Small delay between actions
      await page.waitForTimeout(100);
    }
    
    // Wait for navigation if requested
    if (formData.wait_for_navigation) {
      console.log('Waiting for navigation...');
      await page.waitForNavigation({ timeout: 10000 }).catch(() => {
        console.log('No navigation occurred');
      });
    }
    
    // Take screenshot if path provided
    if (screenshotPath) {
      console.log(`Saving screenshot to ${screenshotPath}...`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
    }
    
    console.log('Form filled successfully!');
    
  } catch (error) {
    console.error('Error filling form:', error.message);
    if (browser) {
      const page = (await browser.pages())[0];
      if (page && screenshotPath) {
        await page.screenshot({ path: screenshotPath.replace('.png', '_error.png') });
        console.log('Error screenshot saved');
      }
    }
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
    console.error('Usage: node fill_form.js <url> <form_data.json> [output_screenshot.png]');
    process.exit(1);
  }
  
  const [url, formDataPath, screenshotPath] = args;
  fillForm(url, formDataPath, screenshotPath);
}

module.exports = { fillForm };

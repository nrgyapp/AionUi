#!/usr/bin/env node

/**
 * Page Testing Script
 * Automated testing for web pages
 * 
 * Usage: node test_page.js <url> <test_config.json>
 */

const puppeteer = require('puppeteer');
const fs = require('fs');

async function testPage(url, configPath) {
  let browser;
  const results = {
    passed: [],
    failed: [],
    startTime: new Date().toISOString()
  };
  
  try {
    // Read test configuration
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    
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
    console.log(`Testing page: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Run tests
    for (const test of config.tests) {
      console.log(`Running test: ${test.name}`);
      
      try {
        switch (test.type) {
          case 'element_exists':
            await page.waitForSelector(test.selector, { timeout: 5000 });
            results.passed.push({ name: test.name, message: `Element found: ${test.selector}` });
            break;
            
          case 'text_contains':
            const text = await page.$eval(test.selector, el => el.textContent);
            if (text.includes(test.expected)) {
              results.passed.push({ name: test.name, message: `Text contains: ${test.expected}` });
            } else {
              throw new Error(`Expected text not found. Got: ${text}`);
            }
            break;
            
          case 'click_and_verify':
            await page.click(test.click_selector);
            await page.waitForSelector(test.verify_selector, { timeout: 5000 });
            results.passed.push({ name: test.name, message: 'Click successful and verified' });
            break;
            
          case 'custom':
            const result = await page.evaluate(test.script);
            if (result) {
              results.passed.push({ name: test.name, message: 'Custom test passed' });
            } else {
              throw new Error('Custom test failed');
            }
            break;
            
          default:
            throw new Error(`Unknown test type: ${test.type}`);
        }
      } catch (error) {
        results.failed.push({
          name: test.name,
          error: error.message
        });
      }
    }
    
    results.endTime = new Date().toISOString();
    
    // Print results
    console.log('\n=== Test Results ===');
    console.log(`Passed: ${results.passed.length}`);
    console.log(`Failed: ${results.failed.length}`);
    
    if (results.failed.length > 0) {
      console.log('\nFailed tests:');
      results.failed.forEach(f => {
        console.log(`  ❌ ${f.name}: ${f.error}`);
      });
    }
    
    // Save results if output path specified
    if (config.output_path) {
      fs.writeFileSync(config.output_path, JSON.stringify(results, null, 2));
      console.log(`\nResults saved to ${config.output_path}`);
    }
    
    // Exit with error if tests failed
    if (results.failed.length > 0) {
      process.exit(1);
    }
    
  } catch (error) {
    console.error('Error running tests:', error.message);
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
    console.error('Usage: node test_page.js <url> <test_config.json>');
    process.exit(1);
  }
  
  const [url, configPath] = args;
  testPage(url, configPath);
}

module.exports = { testPage };

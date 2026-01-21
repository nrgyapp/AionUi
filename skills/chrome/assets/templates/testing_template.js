/**
 * Testing Template
 * Template for automated browser testing with Puppeteer
 */

const puppeteer = require('puppeteer');

async function runTests() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const testResults = {
    passed: 0,
    failed: 0,
    tests: []
  };

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    // Test 1: Page loads successfully
    console.log('Test 1: Page loads');
    try {
      const response = await page.goto('https://example.com', {
        waitUntil: 'networkidle2'
      });
      
      if (response.ok()) {
        console.log('✓ Page loaded successfully');
        testResults.passed++;
        testResults.tests.push({ name: 'Page load', status: 'passed' });
      } else {
        throw new Error(`HTTP ${response.status()}`);
      }
    } catch (error) {
      console.log('✗ Page load failed:', error.message);
      testResults.failed++;
      testResults.tests.push({ name: 'Page load', status: 'failed', error: error.message });
    }

    // Test 2: Required elements exist
    console.log('Test 2: Required elements');
    try {
      await page.waitForSelector('.header', { timeout: 5000 });
      await page.waitForSelector('.content', { timeout: 5000 });
      await page.waitForSelector('.footer', { timeout: 5000 });
      
      console.log('✓ All required elements found');
      testResults.passed++;
      testResults.tests.push({ name: 'Required elements', status: 'passed' });
    } catch (error) {
      console.log('✗ Required elements missing:', error.message);
      testResults.failed++;
      testResults.tests.push({ name: 'Required elements', status: 'failed', error: error.message });
    }

    // Test 3: Navigation works
    console.log('Test 3: Navigation');
    try {
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle2' }),
        page.click('a.about-link')
      ]);
      
      const url = page.url();
      if (url.includes('/about')) {
        console.log('✓ Navigation successful');
        testResults.passed++;
        testResults.tests.push({ name: 'Navigation', status: 'passed' });
      } else {
        throw new Error('Wrong page');
      }
    } catch (error) {
      console.log('✗ Navigation failed:', error.message);
      testResults.failed++;
      testResults.tests.push({ name: 'Navigation', status: 'failed', error: error.message });
    }

    // Test 4: Form submission
    console.log('Test 4: Form submission');
    try {
      await page.goto('https://example.com/contact');
      await page.type('#name', 'Test User');
      await page.type('#email', 'test@example.com');
      await page.type('#message', 'Test message');
      
      await Promise.all([
        page.waitForSelector('.success-message', { timeout: 5000 }),
        page.click('button[type="submit"]')
      ]);
      
      console.log('✓ Form submitted successfully');
      testResults.passed++;
      testResults.tests.push({ name: 'Form submission', status: 'passed' });
    } catch (error) {
      console.log('✗ Form submission failed:', error.message);
      testResults.failed++;
      testResults.tests.push({ name: 'Form submission', status: 'failed', error: error.message });
      
      // Take screenshot on failure
      await page.screenshot({ path: 'test_failure.png' });
    }

    // Print summary
    console.log('\n=== Test Summary ===');
    console.log(`Total: ${testResults.passed + testResults.failed}`);
    console.log(`Passed: ${testResults.passed}`);
    console.log(`Failed: ${testResults.failed}`);

  } catch (error) {
    console.error('Test suite error:', error);
  } finally {
    await browser.close();
  }

  // Exit with error code if tests failed
  if (testResults.failed > 0) {
    process.exit(1);
  }
}

// Run tests
runTests();

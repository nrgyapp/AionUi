/**
 * Form Automation Template
 * Template for automating form submissions with Puppeteer
 */

const puppeteer = require('puppeteer');

async function automateForm() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    // Navigate to form page
    await page.goto('https://example.com/form', {
      waitUntil: 'networkidle2'
    });

    // Fill text inputs
    await page.type('#firstName', 'John');
    await page.type('#lastName', 'Doe');
    await page.type('#email', 'john.doe@example.com');

    // Select dropdown
    await page.select('#country', 'USA');

    // Check checkbox
    await page.click('#terms-checkbox');

    // Click radio button
    await page.click('input[name="gender"][value="male"]');

    // Upload file (if needed)
    // const fileInput = await page.$('input[type="file"]');
    // await fileInput.uploadFile('/path/to/file.pdf');

    // Submit form
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2' }),
      page.click('button[type="submit"]')
    ]);

    // Verify submission
    const successMessage = await page.$eval('.success-message', el => el.textContent);
    console.log('Success:', successMessage);

    // Take screenshot
    await page.screenshot({ path: 'form_submitted.png' });

  } catch (error) {
    console.error('Error:', error);
    // Take error screenshot
    const page = (await browser.pages())[0];
    if (page) {
      await page.screenshot({ path: 'error.png' });
    }
  } finally {
    await browser.close();
  }
}

// Run the automation
automateForm();

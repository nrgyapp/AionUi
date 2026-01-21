---
name: chrome
description: Chrome browser automation for web scraping, form filling, testing, and data extraction. Use when Claude needs to automate web interactions, scrape websites, fill forms automatically, capture screenshots, or perform browser-based testing. Supports both headless and headed modes with cross-platform compatibility including Windows.
license: Complete terms in LICENSE.txt
---

# Chrome Browser Automation

This skill provides comprehensive Chrome browser automation capabilities using Puppeteer, enabling automated web interactions, data scraping, form filling, and browser testing.

## Capabilities

- **Web Scraping**: Extract data from websites with JavaScript rendering support
- **Form Automation**: Fill forms, submit data, and navigate multi-step processes
- **Screenshot & PDF**: Capture screenshots and generate PDFs from web pages
- **Testing**: Automated browser testing for web applications
- **Headless Mode**: Run in CI/CD pipelines without UI
- **Cross-platform**: Works on Windows, macOS, and Linux

## Quick Start

### Basic Navigation and Scraping

```javascript
const puppeteer = require('puppeteer');

// Launch browser
const browser = await puppeteer.launch({
  headless: true, // Set to false for debugging
  args: ['--no-sandbox', '--disable-setuid-sandbox'] // Windows compatibility
});

const page = await browser.newPage();
await page.goto('https://example.com');

// Extract data
const data = await page.evaluate(() => {
  return {
    title: document.title,
    headings: Array.from(document.querySelectorAll('h1')).map(h => h.textContent)
  };
});

console.log(data);
await browser.close();
```

## Built-in Scripts

### Form Filling (`scripts/fill_form.js`)

Automates form filling with configurable field mapping:

```bash
node skills/chrome/scripts/fill_form.js <url> <form_data.json> [output_screenshot.png]
```

**form_data.json format:**
```json
{
  "selectors": {
    "#username": "john_doe",
    "#password": "secret123",
    "#email": "john@example.com",
    "button[type='submit']": "click"
  },
  "wait_for_navigation": true
}
```

### Web Scraping (`scripts/scrape_data.js`)

Extract structured data from web pages:

```bash
node skills/chrome/scripts/scrape_data.js <url> <selectors.json> <output.json>
```

**selectors.json format:**
```json
{
  "title": "h1.main-title",
  "items": {
    "selector": ".product-item",
    "multiple": true,
    "fields": {
      "name": ".product-name",
      "price": ".product-price",
      "link": "a@href"
    }
  }
}
```

### Screenshot Capture (`scripts/screenshot.js`)

Capture full-page or element screenshots:

```bash
node skills/chrome/scripts/screenshot.js <url> <output.png> [--fullPage] [--selector='css-selector']
```

### PDF Generation (`scripts/generate_pdf.js`)

Convert web pages to PDF:

```bash
node skills/chrome/scripts/generate_pdf.js <url> <output.pdf> [--landscape] [--format=A4]
```

### Headless Testing (`scripts/test_page.js`)

Run automated tests on web pages:

```bash
node skills/chrome/scripts/test_page.js <url> <test_config.json>
```

## Common Patterns

### Wait for Elements

```javascript
// Wait for specific element
await page.waitForSelector('.loaded-content');

// Wait for navigation
await Promise.all([
  page.waitForNavigation(),
  page.click('a.next-page')
]);

// Wait for timeout
await page.waitForTimeout(2000);
```

### Handle Dynamic Content

```javascript
// Scroll to load more content
await page.evaluate(() => {
  window.scrollTo(0, document.body.scrollHeight);
});
await page.waitForTimeout(1000);

// Handle infinite scroll
let previousHeight;
while (true) {
  previousHeight = await page.evaluate('document.body.scrollHeight');
  await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
  await page.waitForTimeout(1000);
  const newHeight = await page.evaluate('document.body.scrollHeight');
  if (newHeight === previousHeight) break;
}
```

### Authentication

```javascript
// Fill login form
await page.type('#username', 'user@example.com');
await page.type('#password', 'password123');
await Promise.all([
  page.waitForNavigation(),
  page.click('button[type="submit"]')
]);

// Set cookies
await page.setCookie({
  name: 'session',
  value: 'abc123',
  domain: 'example.com'
});
```

## Windows Compatibility

### Launch Options for Windows

```javascript
const browser = await puppeteer.launch({
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage', // Overcome limited resource problems
    '--disable-gpu' // Windows-specific
  ],
  executablePath: process.env.CHROME_PATH || undefined // Custom Chrome path
});
```

### Environment Variables

Set these on Windows if Chrome is not auto-detected:

```bash
# PowerShell
$env:CHROME_PATH = "C:\Program Files\Google\Chrome\Application\chrome.exe"

# Command Prompt
set CHROME_PATH=C:\Program Files\Google\Chrome\Application\chrome.exe
```

## Error Handling

```javascript
try {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Set timeout
  page.setDefaultTimeout(30000);
  
  // Navigation with error handling
  const response = await page.goto(url, {
    waitUntil: 'networkidle2',
    timeout: 30000
  });
  
  if (!response.ok()) {
    throw new Error(`Failed to load page: ${response.status()}`);
  }
  
  // Your automation logic here
  
  await browser.close();
  
} catch (error) {
  console.error('Automation failed:', error);
  throw error;
}
```

## Best Practices

1. **Always close browsers**: Use try/finally to ensure browsers are closed
2. **Use headless mode in CI/CD**: Set `headless: true` for automated pipelines
3. **Set appropriate timeouts**: Adjust based on page load times
4. **Handle navigation carefully**: Always wait for navigation to complete
5. **Take screenshots on errors**: Helps debugging when automation fails
6. **Use unique selectors**: Prefer IDs or data attributes over class names
7. **Test locally first**: Run headed mode during development

## CI/CD Integration

### GitHub Actions Example

```yaml
- name: Install dependencies
  run: npm install

- name: Install Chrome dependencies (Linux)
  run: |
    sudo apt-get update
    sudo apt-get install -y libgbm-dev

- name: Run automation
  run: node skills/chrome/scripts/your_script.js
```

### Docker Support

```dockerfile
FROM node:18

# Install Chrome dependencies
RUN apt-get update && apt-get install -y \
    chromium \
    libgbm-dev

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app
COPY . .
RUN npm install

CMD ["node", "skills/chrome/scripts/your_script.js"]
```

## Troubleshooting

### Common Issues

**Issue**: Chrome fails to launch on Windows
**Solution**: Install Chrome and set CHROME_PATH environment variable

**Issue**: Navigation timeout
**Solution**: Increase timeout or use 'domcontentloaded' wait condition

**Issue**: Element not found
**Solution**: Add explicit waits before interacting with elements

**Issue**: Screenshots are blank
**Solution**: Wait for content to load before capturing

### Debug Mode

Run in headed mode to see what's happening:

```javascript
const browser = await puppeteer.launch({
  headless: false,
  slowMo: 100 // Slow down by 100ms
});
```

## Advanced Features

### Custom User Agent

```javascript
await page.setUserAgent('Custom User Agent String');
```

### Request Interceptio

```javascript
await page.setRequestInterception(true);
page.on('request', (request) => {
  if (request.resourceType() === 'image') {
    request.abort();
  } else {
    request.continue();
  }
});
```

### Execute Custom Scripts

```javascript
const result = await page.evaluate((arg1, arg2) => {
  // This runs in browser context
  return arg1 + arg2;
}, 5, 10);
```

## Templates

See `assets/templates/` for pre-built automation templates:

- `form_automation_template.js` - Form filling template
- `scraper_template.js` - Web scraping template
- `testing_template.js` - Browser testing template

## References

For detailed Puppeteer API documentation, see:
- [Puppeteer API](https://pptr.dev/api)
- [Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/)

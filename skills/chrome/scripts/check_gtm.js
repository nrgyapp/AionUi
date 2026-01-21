#!/usr/bin/env node

/**
 * Check GTM Script
 * Checks Google Tag Manager configuration and data layer
 */

const { chromium } = require('playwright');
const fs = require('fs').promises;

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const config = {
    url: null,
    output: 'gtm_report.json',
    headless: true,
    timeout: 30000,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--url':
        config.url = args[++i];
        break;
      case '--output':
        config.output = args[++i];
        break;
      case '--headless':
        config.headless = args[++i] === 'true';
        break;
      case '--timeout':
        config.timeout = parseInt(args[++i], 10);
        break;
      case '--help':
        console.log(`
Usage: node check_gtm.js --url <page_url> [options]

Options:
  --url <url>          Page URL to check (required)
  --output <file>      Output file for report (default: gtm_report.json)
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

  return config;
}

// Check GTM implementation
async function checkGTM(config) {
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

    // Collect network requests
    const requests = [];
    page.on('request', (request) => {
      const url = request.url();
      if (
        url.includes('google-analytics.com') ||
        url.includes('googletagmanager.com') ||
        url.includes('analytics.google.com')
      ) {
        requests.push({
          url,
          method: request.method(),
          resourceType: request.resourceType(),
        });
      }
    });

    console.log(`Navigating to ${config.url}...`);
    await page.goto(config.url, {
      waitUntil: 'networkidle',
      timeout: config.timeout,
    });

    // Wait for GTM to load
    await page.waitForTimeout(3000);

    console.log('Analyzing GTM implementation...');

    // Check for GTM presence and extract data layer
    const gtmInfo = await page.evaluate(() => {
      const result = {
        gtmPresent: false,
        gtmContainerId: null,
        dataLayer: null,
        dataLayerLength: 0,
        ga4Present: false,
        ga4MeasurementIds: [],
        universalAnalyticsPresent: false,
        uaPropertyIds: [],
      };

      // Check for GTM container
      if (window.google_tag_manager) {
        result.gtmPresent = true;
        const containerIds = Object.keys(window.google_tag_manager);
        result.gtmContainerId = containerIds[0] || null;
      }

      // Check data layer
      if (window.dataLayer) {
        result.dataLayer = window.dataLayer;
        result.dataLayerLength = window.dataLayer.length;
      }

      // Check for GA4
      if (window.gtag) {
        result.ga4Present = true;
      }

      // Try to find measurement IDs from scripts
      const scripts = Array.from(document.querySelectorAll('script'));
      scripts.forEach((script) => {
        const content = script.textContent || '';

        // Look for GA4 measurement IDs (G-XXXXXXXXXX)
        const ga4Match = content.match(/['"]G-[A-Z0-9]+['"]/g);
        if (ga4Match) {
          ga4Match.forEach((id) => {
            const cleanId = id.replace(/['"]/g, '');
            if (!result.ga4MeasurementIds.includes(cleanId)) {
              result.ga4MeasurementIds.push(cleanId);
            }
          });
        }

        // Look for Universal Analytics IDs (UA-XXXXXXXX-X)
        const uaMatch = content.match(/['"]UA-[0-9]+-[0-9]+['"]/g);
        if (uaMatch) {
          result.universalAnalyticsPresent = true;
          uaMatch.forEach((id) => {
            const cleanId = id.replace(/['"]/g, '');
            if (!result.uaPropertyIds.includes(cleanId)) {
              result.uaPropertyIds.push(cleanId);
            }
          });
        }

        // Check for GTM container in script src
        const src = script.src || '';
        if (src.includes('googletagmanager.com/gtm.js')) {
          const idMatch = src.match(/id=(GTM-[A-Z0-9]+)/);
          if (idMatch && !result.gtmContainerId) {
            result.gtmContainerId = idMatch[1];
            result.gtmPresent = true;
          }
        }
      });

      return result;
    });

    // Build report
    const report = {
      timestamp: new Date().toISOString(),
      url: config.url,
      gtm: gtmInfo,
      networkRequests: {
        total: requests.length,
        requests: requests.slice(0, 20), // Limit to first 20 requests
      },
      recommendations: [],
    };

    // Add recommendations
    if (!gtmInfo.gtmPresent) {
      report.recommendations.push({
        type: 'warning',
        message: 'Google Tag Manager not detected on this page',
      });
    }

    if (!gtmInfo.dataLayer || gtmInfo.dataLayerLength === 0) {
      report.recommendations.push({
        type: 'warning',
        message: 'Data Layer is empty or not found',
      });
    }

    if (!gtmInfo.ga4Present && !gtmInfo.universalAnalyticsPresent) {
      report.recommendations.push({
        type: 'warning',
        message: 'No Google Analytics implementation detected',
      });
    }

    if (gtmInfo.universalAnalyticsPresent) {
      report.recommendations.push({
        type: 'info',
        message:
          'Universal Analytics detected. Consider migrating to GA4 as UA is deprecated.',
      });
    }

    if (requests.length === 0) {
      report.recommendations.push({
        type: 'error',
        message: 'No analytics network requests detected',
      });
    }

    // Save report
    console.log(`\nSaving report to ${config.output}...`);
    await fs.writeFile(config.output, JSON.stringify(report, null, 2));

    // Print summary
    console.log('\n=== GTM Check Summary ===');
    console.log(`GTM Present: ${gtmInfo.gtmPresent ? 'Yes' : 'No'}`);
    if (gtmInfo.gtmContainerId) {
      console.log(`Container ID: ${gtmInfo.gtmContainerId}`);
    }
    console.log(`Data Layer Events: ${gtmInfo.dataLayerLength}`);
    console.log(`GA4 Present: ${gtmInfo.ga4Present ? 'Yes' : 'No'}`);
    if (gtmInfo.ga4MeasurementIds.length > 0) {
      console.log(`GA4 IDs: ${gtmInfo.ga4MeasurementIds.join(', ')}`);
    }
    console.log(`Network Requests: ${requests.length}`);
    console.log(`Recommendations: ${report.recommendations.length}`);

    if (report.recommendations.length > 0) {
      console.log('\nRecommendations:');
      report.recommendations.forEach((rec) => {
        console.log(`  [${rec.type.toUpperCase()}] ${rec.message}`);
      });
    }

    console.log('\nDone!');
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
checkGTM(config);

#!/usr/bin/env node

/**
 * Monitor Dashboard Script
 * Monitors a Google Data Studio dashboard for anomalies and data updates
 */

const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const config = {
    url: null,
    interval: 300, // 5 minutes default
    output: 'dashboard_status.json',
    headless: true,
    timeout: 30000,
    checkCount: 1, // Number of checks to perform (1 = single check)
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--url':
        config.url = args[++i];
        break;
      case '--interval':
        config.interval = parseInt(args[++i], 10);
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
      case '--checks':
        config.checkCount = parseInt(args[++i], 10);
        break;
      case '--help':
        console.log(`
Usage: node monitor_dashboard.js --url <dashboard_url> [options]

Options:
  --url <url>          Dashboard URL to monitor (required)
  --interval <sec>     Check interval in seconds (default: 300)
  --output <file>      Output file for status (default: dashboard_status.json)
  --headless <bool>    Run in headless mode (default: true)
  --timeout <ms>       Page load timeout (default: 30000)
  --checks <num>       Number of checks to perform (default: 1)
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

// Detect anomalies in dashboard
async function detectAnomalies(page) {
  const anomalies = [];

  try {
    // Check for error messages
    const errorSelectors = [
      '.error-message',
      '.data-error',
      '[data-error]',
      '.alert-danger',
      '.warning',
    ];

    for (const selector of errorSelectors) {
      const errors = await page.$$(selector);
      if (errors.length > 0) {
        for (const error of errors) {
          const text = await error.textContent();
          anomalies.push({
            type: 'error',
            selector,
            message: text?.trim(),
          });
        }
      }
    }

    // Check for loading states that might be stuck
    const loadingSelectors = ['.loading', '.spinner', '[data-loading="true"]'];

    for (const selector of loadingSelectors) {
      const loading = await page.$$(selector);
      if (loading.length > 0) {
        anomalies.push({
          type: 'loading_stuck',
          selector,
          count: loading.length,
          message: 'Elements still in loading state',
        });
      }
    }

    // Check for empty data tables
    const tables = await page.$$('table');
    for (let i = 0; i < tables.length; i++) {
      const rowCount = await tables[i].$$eval('tr', (rows) => rows.length);
      if (rowCount <= 1) {
        // Only header or empty
        anomalies.push({
          type: 'empty_table',
          index: i,
          message: 'Table appears to be empty',
        });
      }
    }

    // Check for charts with no data
    const chartSelectors = [
      'svg[class*="chart"]',
      'canvas[class*="chart"]',
      '.chart-container',
    ];

    for (const selector of chartSelectors) {
      const charts = await page.$$(selector);
      for (let i = 0; i < charts.length; i++) {
        const boundingBox = await charts[i].boundingBox();
        if (boundingBox && (boundingBox.width < 10 || boundingBox.height < 10)) {
          anomalies.push({
            type: 'chart_too_small',
            selector,
            index: i,
            message: 'Chart appears too small or hidden',
          });
        }
      }
    }
  } catch (error) {
    anomalies.push({
      type: 'detection_error',
      message: error.message,
    });
  }

  return anomalies;
}

// Extract data from dashboard
async function extractDashboardData(page) {
  const data = {
    timestamp: new Date().toISOString(),
    title: await page.title(),
    url: page.url(),
    metrics: [],
    tables: [],
    charts: [],
  };

  try {
    // Extract visible metrics/KPIs
    const metricSelectors = [
      '.metric-value',
      '.kpi-value',
      '[data-metric]',
      '.scorecard-value',
    ];

    for (const selector of metricSelectors) {
      const metrics = await page.$$(selector);
      for (const metric of metrics) {
        const text = await metric.textContent();
        const label =
          (await metric.getAttribute('aria-label')) ||
          (await metric.getAttribute('title'));
        data.metrics.push({
          value: text?.trim(),
          label: label || 'Unlabeled',
        });
      }
    }

    // Extract table data
    const tables = await page.$$('table');
    for (let i = 0; i < tables.length; i++) {
      const tableData = await tables[i].evaluate((table) => {
        const rows = Array.from(table.querySelectorAll('tr'));
        return rows.map((row) => {
          const cells = Array.from(row.querySelectorAll('td, th'));
          return cells.map((cell) => cell.textContent?.trim() || '');
        });
      });
      data.tables.push({
        index: i,
        rows: tableData.length,
        data: tableData,
      });
    }

    // Get screenshot count of charts
    const charts = await page.$$('svg, canvas');
    data.charts.push({
      count: charts.length,
      message: `Found ${charts.length} chart elements`,
    });
  } catch (error) {
    data.error = error.message;
  }

  return data;
}

// Main monitoring function
async function monitorDashboard(config) {
  const results = [];
  let browser = null;

  try {
    console.log(`Launching browser...`);
    browser = await chromium.launch({
      headless: config.headless,
      timeout: config.timeout,
    });

    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });

    const page = await context.newPage();

    for (let i = 0; i < config.checkCount; i++) {
      console.log(
        `\nCheck ${i + 1}/${config.checkCount} - Navigating to ${config.url}...`
      );

      try {
        await page.goto(config.url, {
          waitUntil: 'networkidle',
          timeout: config.timeout,
        });

        // Wait a bit for dynamic content to load
        await page.waitForTimeout(3000);

        console.log('Detecting anomalies...');
        const anomalies = await detectAnomalies(page);

        console.log('Extracting dashboard data...');
        const dashboardData = await extractDashboardData(page);

        const result = {
          check: i + 1,
          timestamp: new Date().toISOString(),
          status: anomalies.length === 0 ? 'healthy' : 'issues_detected',
          anomalyCount: anomalies.length,
          anomalies,
          data: dashboardData,
        };

        results.push(result);

        console.log(`Status: ${result.status}`);
        console.log(`Anomalies found: ${anomalies.length}`);
        console.log(`Metrics extracted: ${dashboardData.metrics.length}`);
        console.log(`Tables found: ${dashboardData.tables.length}`);

        // If more checks to do, wait for interval
        if (i < config.checkCount - 1) {
          console.log(`Waiting ${config.interval} seconds before next check...`);
          await page.waitForTimeout(config.interval * 1000);
        }
      } catch (error) {
        console.error(`Error during check ${i + 1}:`, error.message);
        results.push({
          check: i + 1,
          timestamp: new Date().toISOString(),
          status: 'error',
          error: error.message,
        });
      }
    }

    // Save results
    console.log(`\nSaving results to ${config.output}...`);
    await fs.writeFile(config.output, JSON.stringify(results, null, 2));
    console.log('Done!');

    // Summary
    const healthyCount = results.filter((r) => r.status === 'healthy').length;
    const issuesCount = results.filter((r) => r.status === 'issues_detected').length;
    const errorCount = results.filter((r) => r.status === 'error').length;

    console.log('\n=== Summary ===');
    console.log(`Total checks: ${results.length}`);
    console.log(`Healthy: ${healthyCount}`);
    console.log(`Issues detected: ${issuesCount}`);
    console.log(`Errors: ${errorCount}`);
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
monitorDashboard(config);

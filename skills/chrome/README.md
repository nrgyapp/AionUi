# Chrome Automation Skill

This skill provides browser automation capabilities using Playwright, enabling automated interaction with web applications, particularly Google Data Studio dashboards and other Chrome-based web tools.

## Features

- **Dashboard Monitoring**: Automated monitoring of Google Data Studio dashboards
- **Anomaly Detection**: Detect when values don't update or charts show issues
- **GTM Tracing**: Trace Google Tag Manager data resources
- **Analytics Viewing**: Access and analyze GA4 and log analytics data
- **Screenshot Capture**: Capture dashboard states for comparison
- **Data Extraction**: Extract data from web tables and charts

## Scripts

- `launch_browser.js` - Launch and configure Chrome browser
- `navigate_dashboard.js` - Navigate to specific dashboards
- `monitor_dashboard.js` - Monitor dashboard for anomalies
- `extract_data.js` - Extract data from dashboard elements
- `check_gtm.js` - Check GTM data resources and tracking
- `view_analytics.js` - Access GA4 and analytics data

## Usage Examples

### Monitor a Dashboard

```bash
node skills/chrome/scripts/monitor_dashboard.js \
  --url "https://datastudio.google.com/reporting/..." \
  --interval 300 \
  --output dashboard_status.json
```

### Extract Dashboard Data

```bash
node skills/chrome/scripts/extract_data.js \
  --url "https://datastudio.google.com/reporting/..." \
  --selector ".table-data" \
  --output data.csv
```

### Check GTM Configuration

```bash
node skills/chrome/scripts/check_gtm.js \
  --url "https://example.com" \
  --output gtm_report.json
```

## Prerequisites

- Playwright installed: `npm install playwright`
- Chrome browser (installed automatically by Playwright)
- Valid credentials for accessing dashboards (if required)

## Configuration

Create a `config.json` file in the skills/chrome directory:

```json
{
  "headless": true,
  "timeout": 30000,
  "viewport": {
    "width": 1920,
    "height": 1080
  },
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
}
```

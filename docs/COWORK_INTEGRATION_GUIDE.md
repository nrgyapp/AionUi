# Cowork Enhancement Integration Guide

This guide provides comprehensive examples of using the new Chrome automation and enhanced Office document features in the AionUi Cowork assistant.

## Table of Contents

1. [Chrome Automation](#chrome-automation)
2. [Advanced Excel Features](#advanced-excel-features)
3. [Advanced PowerPoint Features](#advanced-powerpoint-features)
4. [Advanced Word Features](#advanced-word-features)
5. [Integration Workflows](#integration-workflows)

## Chrome Automation

### Overview

The Chrome automation skill enables automated interaction with web applications, particularly Google Data Studio dashboards, using Playwright browser automation.

### Setup

1. Install dependencies:
```bash
npm install
# Playwright browsers are installed automatically
```

2. Configure monitoring (optional):
```bash
# Edit skills/chrome/config.json to customize settings
{
  "headless": true,
  "timeout": 30000,
  "monitoring": {
    "checkTypes": ["errors", "loading", "emptyTables", "smallCharts", "staleData"],
    "alertThreshold": 2
  }
}
```

### Use Cases

#### 1. Monitor Google Data Studio Dashboard

Monitor a dashboard for anomalies and data freshness:

```bash
# Single check
node skills/chrome/scripts/monitor_dashboard.js \
  --url "https://datastudio.google.com/reporting/your-dashboard" \
  --output dashboard_status.json

# Continuous monitoring
node skills/chrome/scripts/monitor_dashboard.js \
  --url "https://datastudio.google.com/reporting/your-dashboard" \
  --checks 10 \
  --interval 300 \
  --output monitoring_results.json
```

Output format:
```json
[
  {
    "check": 1,
    "timestamp": "2024-01-21T10:00:00.000Z",
    "status": "healthy",
    "anomalyCount": 0,
    "data": {
      "metrics": [...],
      "tables": [...]
    }
  }
]
```

#### 2. Validate Google Tag Manager Setup

Check GTM implementation and data layer configuration:

```bash
node skills/chrome/scripts/check_gtm.js \
  --url "https://yourwebsite.com" \
  --output gtm_report.json
```

Output includes:
- GTM container presence and ID
- Data layer structure and events
- GA4 measurement IDs
- Network request tracking
- Recommendations for improvements

#### 3. Extract Data from Web Pages

Extract structured data using CSS selectors:

```bash
# Extract table data
node skills/chrome/scripts/extract_data.js \
  --url "https://example.com/data-table" \
  --selector "table.data" \
  --format csv \
  --output data.csv

# Extract metrics
node skills/chrome/scripts/extract_data.js \
  --url "https://dashboard.example.com" \
  --selector ".metric-card" \
  --format json \
  --output metrics.json
```

## Advanced Excel Features

### Data Analysis

Analyze Excel data and generate comprehensive statistics:

```bash
node skills/xlsx/excel_advanced.js \
  --action analyze \
  --input sales_data.xlsx \
  --output analysis_report.xlsx
```

This generates a summary sheet with:
- Column statistics (min, max, average, sum)
- Data type analysis
- Unique value counts
- Missing data indicators

### Add Autofilter and Formatting

Make spreadsheets more user-friendly:

```bash
node skills/xlsx/excel_advanced.js \
  --action autofilter \
  --input raw_data.xlsx \
  --output filtered_data.xlsx \
  --range A1:Z1000
```

Features added:
- Autofilter on header row
- Frozen header row
- Improved navigation

### Compare Excel Files

Identify differences between two versions:

```bash
node skills/xlsx/excel_advanced.js \
  --action compare \
  --input version1.xlsx \
  --file2 version2.xlsx \
  --output comparison.json
```

## Advanced PowerPoint Features

### Create Presentation from JSON

Define entire presentations in JSON for automation:

**Example: Create slides.json**
```json
{
  "author": "Your Name",
  "title": "Q4 Business Review",
  "theme": "blue",
  "slides": [
    {
      "elements": [
        { "type": "title", "text": "Q4 Business Review" },
        { "type": "text", "text": "Strategic Overview", "y": 3.5, "fontSize": 24, "align": "center" }
      ]
    },
    {
      "elements": [
        { "type": "text", "text": "Key Achievements", "y": 0.5, "fontSize": 32, "bold": true },
        {
          "type": "bullet",
          "items": [
            { "text": "Revenue up 25%", "options": { "bullet": true } },
            { "text": "New product launch", "options": { "bullet": true } }
          ]
        }
      ]
    }
  ]
}
```

**Generate presentation:**
```bash
node skills/pptx/scripts/pptx_advanced.js \
  --action from-json \
  --input slides.json \
  --output presentation.pptx
```

### Quick Slide Templates

Create common slide types quickly:

```bash
# Title slide
node skills/pptx/scripts/pptx_advanced.js \
  --action title-slide \
  --title "Project Kickoff" \
  --subtitle "Team Meeting 2024" \
  --author "John Doe" \
  --theme blue \
  --output title.pptx

# Agenda slide
node skills/pptx/scripts/pptx_advanced.js \
  --action agenda \
  --theme green \
  --output agenda.pptx

# Comparison slide
node skills/pptx/scripts/pptx_advanced.js \
  --action comparison \
  --title "Before vs After" \
  --theme purple \
  --output comparison.pptx
```

### Available Themes

- **Blue**: Professional corporate theme (primary: #4472C4)
- **Green**: Nature/growth theme (primary: #70AD47)
- **Red**: Bold/urgent theme (primary: #C5504B)
- **Purple**: Creative theme (primary: #7030A0)

## Advanced Word Features

### Create Document from JSON

Define document structure in JSON:

**Example: Create document.json**
```json
{
  "title": "Project Proposal",
  "author": "Jane Smith",
  "content": [
    { "type": "heading", "level": 1, "text": "Executive Summary" },
    { "type": "paragraph", "text": "This proposal outlines..." },
    { "type": "heading", "level": 2, "text": "Objectives" },
    { "type": "bullet", "text": "Increase efficiency", "level": 0 },
    { "type": "bullet", "text": "Reduce costs", "level": 0 },
    {
      "type": "table",
      "rows": [
        ["Item", "Cost", "Timeline"],
        ["Phase 1", "$50K", "Q1"],
        ["Phase 2", "$75K", "Q2"]
      ]
    }
  ]
}
```

**Generate document:**
```bash
node skills/docx/scripts/docx_advanced.js \
  --action from-json \
  --input document.json \
  --output proposal.docx
```

### Professional Report Template

Create a formatted business report:

```bash
node skills/docx/scripts/docx_advanced.js \
  --action report \
  --title "Annual Business Report 2024" \
  --author "Jane Smith" \
  --output annual_report.docx
```

The report includes:
- Title page with metadata
- Table of contents placeholder
- Executive summary section
- Multiple heading levels
- Sample data tables
- Headers and footers with page numbers

### Business Letter Template

Create a formal business letter:

```bash
node skills/docx/scripts/docx_advanced.js \
  --action letter \
  --author "John Doe" \
  --output business_letter.docx
```

## Integration Workflows

### Workflow 1: Dashboard to Presentation

Monitor a dashboard and create a presentation with the results:

```bash
# Step 1: Monitor dashboard
node skills/chrome/scripts/monitor_dashboard.js \
  --url "https://datastudio.google.com/..." \
  --output dashboard_data.json

# Step 2: Extract key metrics (manual or scripted)
# Parse dashboard_data.json to create slides.json

# Step 3: Generate presentation
node skills/pptx/scripts/pptx_advanced.js \
  --action from-json \
  --input slides.json \
  --output dashboard_report.pptx
```

### Workflow 2: Excel Analysis to Word Report

Analyze data and create a comprehensive report:

```bash
# Step 1: Analyze Excel data
node skills/xlsx/excel_advanced.js \
  --action analyze \
  --input sales_data.xlsx \
  --output analysis.xlsx

# Step 2: Create report from analysis
# Use analysis results to populate document.json

# Step 3: Generate Word report
node skills/docx/scripts/docx_advanced.js \
  --action report \
  --title "Sales Analysis Report" \
  --output sales_report.docx
```

### Workflow 3: Analytics Audit

Complete analytics implementation audit:

```bash
# Step 1: Check GTM setup
node skills/chrome/scripts/check_gtm.js \
  --url "https://yoursite.com" \
  --output gtm_audit.json

# Step 2: Create audit report
# Parse gtm_audit.json to create document.json with findings

# Step 3: Generate audit document
node skills/docx/scripts/docx_advanced.js \
  --action from-json \
  --input audit_content.json \
  --output gtm_audit_report.docx
```

### Workflow 4: Multi-Dashboard Monitoring

Monitor multiple dashboards simultaneously:

```bash
#!/bin/bash
# monitor_all.sh

DASHBOARDS=(
  "https://datastudio.google.com/dashboard1"
  "https://datastudio.google.com/dashboard2"
  "https://datastudio.google.com/dashboard3"
)

for i in "${!DASHBOARDS[@]}"; do
  node skills/chrome/scripts/monitor_dashboard.js \
    --url "${DASHBOARDS[$i]}" \
    --output "dashboard_${i}_status.json" &
done

wait
echo "All dashboards monitored!"
```

## Best Practices

### Chrome Automation

1. **Use headless mode** for scheduled tasks to save resources
2. **Set appropriate timeouts** based on dashboard loading times
3. **Store baseline snapshots** for comparison in anomaly detection
4. **Monitor during business hours** when data is most likely to update
5. **Alert on consecutive failures** rather than single instances

### Office Document Automation

1. **Use JSON-driven generation** for repeatable processes
2. **Maintain consistent themes** across presentations
3. **Validate data** before inserting into documents
4. **Use templates** for common document types
5. **Keep file sizes manageable** by optimizing images

### Error Handling

All scripts include:
- Input validation
- Helpful error messages
- `--help` flag for usage information
- Graceful failure handling

## Troubleshooting

### Playwright Issues

If browser automation fails:
```bash
# Reinstall browsers
npx playwright install chromium
```

### Permission Errors

Ensure scripts are executable:
```bash
chmod +x skills/chrome/scripts/*.js
chmod +x skills/pptx/scripts/*.js
chmod +x skills/docx/scripts/*.js
chmod +x skills/xlsx/*.js
```

### Dependencies

If scripts fail to run:
```bash
# Reinstall dependencies
npm install
```

## Contributing

To add new automation features:

1. Create scripts in appropriate `skills/` directory
2. Update `assistant/cowork/cowork-skills.md` with documentation
3. Add examples to `skills/*/examples/`
4. Create tests in `tests/unit/`

## Support

For issues or questions:
- Review skill documentation: `assistant/cowork/cowork-skills.md`
- Check script help: `node script.js --help`
- See examples: `skills/*/examples/`

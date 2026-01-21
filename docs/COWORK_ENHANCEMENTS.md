# Cowork Feature Enhancements

This document provides an overview of the enhanced "cowork" features in AionUi, including Chrome automation, advanced Office document processing, and PDF manipulation capabilities.

## Table of Contents

1. [Chrome Automation](#chrome-automation)
2. [Excel Enhancements](#excel-enhancements)
3. [Word Document Enhancements](#word-document-enhancements)
4. [PowerPoint Enhancements](#powerpoint-enhancements)
5. [PDF Enhancements](#pdf-enhancements)
6. [Windows Compatibility](#windows-compatibility)
7. [Installation](#installation)
8. [Usage Examples](#usage-examples)

## Chrome Automation

Automate web interactions using Puppeteer with support for headless browser operations, form filling, and data scraping.

### Features

- **Form Automation**: Fill web forms automatically with configurable field mapping
- **Web Scraping**: Extract structured data from dynamic websites
- **Screenshot Capture**: Take full-page or element-specific screenshots
- **PDF Generation**: Convert web pages to PDF format
- **Testing**: Automated browser testing with assertions
- **Cross-platform**: Windows, macOS, and Linux support

### Scripts

- `skills/chrome/scripts/fill_form.js` - Automate form filling
- `skills/chrome/scripts/scrape_data.js` - Extract data from websites
- `skills/chrome/scripts/screenshot.js` - Capture screenshots
- `skills/chrome/scripts/generate_pdf.js` - Generate PDFs from web pages
- `skills/chrome/scripts/test_page.js` - Automated testing

### Templates

- `skills/chrome/assets/templates/form_automation_template.js`
- `skills/chrome/assets/templates/scraper_template.js`
- `skills/chrome/assets/templates/testing_template.js`

### Example Usage

```bash
# Fill a web form
node skills/chrome/scripts/fill_form.js https://example.com/form form_data.json screenshot.png

# Scrape website data
node skills/chrome/scripts/scrape_data.js https://example.com selectors.json output.json

# Capture screenshot
node skills/chrome/scripts/screenshot.js https://example.com screenshot.png --fullPage
```

## Excel Enhancements

Advanced Excel capabilities including financial modeling, chart generation, and CSV import/export.

### Features

- **Financial Models**: Multi-sheet models with income statements, balance sheets, and cash flow
- **Advanced Formulas**: VLOOKUP, SUMIFS, INDEX-MATCH, pivot tables
- **Chart Generation**: Bar, line, pie, scatter charts
- **CSV Integration**: Convert between CSV and Excel with formatting
- **Formula Recalculation**: LibreOffice integration for formula updates

### Scripts

- `skills/xlsx/scripts/create_financial_model.js` - Generate comprehensive financial models
- `skills/xlsx/scripts/create_charts.js` - Create charts from data
- `skills/xlsx/scripts/csv_to_excel.js` - Convert CSV to Excel
- `skills/xlsx/scripts/excel_to_csv.js` - Export Excel to CSV

### Templates

- `skills/xlsx/assets/templates/financial_model_config.json`

### Example Usage

```bash
# Create financial model
node skills/xlsx/scripts/create_financial_model.js config.json financial_model.xlsx

# Convert CSV to Excel
node skills/xlsx/scripts/csv_to_excel.js data.csv output.xlsx --header-row --auto-format

# Export Excel to CSV
node skills/xlsx/scripts/excel_to_csv.js workbook.xlsx output_dir --all-sheets
```

## Word Document Enhancements

Professional document generation with advanced styling, table of contents, and templates.

### Features

- **Professional Templates**: Project reports, business documents
- **Table of Contents**: Automatic TOC generation
- **Advanced Styling**: Headings, tables, numbered/bullet lists
- **References**: Citations and reference management
- **Headers/Footers**: Page numbers and custom content

### Scripts

- `skills/docx/scripts/create_professional_doc.js` - Generate professional documents

### Templates

- `skills/docx/assets/templates/project_report_template.json`

### Example Usage

```bash
# Create professional document
node skills/docx/scripts/create_professional_doc.js config.json report.docx
```

## PowerPoint Enhancements

Create professional presentations with charts, speaker notes, and custom branding.

### Features

- **Slide Transitions**: Built-in transition support
- **Speaker Notes**: Notes for each slide
- **Charts**: Bar, line, pie, scatter charts
- **Custom Branding**: Master slides, backgrounds, footers
- **Two-Column Layouts**: Multi-column content support

### Scripts

- `skills/pptx/scripts/create_presentation.js` - Generate presentations

### Templates

- `skills/pptx/assets/templates/business_presentation_template.json`

### Example Usage

```bash
# Create presentation
node skills/pptx/scripts/create_presentation.js config.json presentation.pptx
```

## PDF Enhancements

Advanced PDF manipulation including annotations, merging, and template filling.

### Features

- **Annotations**: Add text, highlights, rectangles, watermarks
- **Template Filling**: Dynamic data integration
- **PDF Merging**: Combine multiple PDFs (JavaScript implementation)
- **Dynamic Data**: Variable substitution in templates
- **Metadata**: Set title, author, subject, keywords

### Scripts

- `skills/pdf/scripts/annotate_pdf.js` - Add annotations to PDFs
- `skills/pdf/scripts/fill_pdf_template.js` - Fill PDF templates with data
- `skills/pdf/scripts/merge_pdfs_js.js` - Merge multiple PDFs

### Example Usage

```bash
# Annotate PDF
node skills/pdf/scripts/annotate_pdf.js input.pdf annotations.json output.pdf

# Fill PDF template
node skills/pdf/scripts/fill_pdf_template.js template.pdf data.json output.pdf

# Merge PDFs
node skills/pdf/scripts/merge_pdfs_js.js merged.pdf file1.pdf file2.pdf file3.pdf
```

## Windows Compatibility

All features have been tested and optimized for Windows systems.

### Chrome Automation on Windows

**Browser Path Configuration**:

If Chrome is not automatically detected, set the environment variable:

```powershell
# PowerShell
$env:CHROME_PATH = "C:\Program Files\Google\Chrome\Application\chrome.exe"

# Command Prompt
set CHROME_PATH=C:\Program Files\Google\Chrome\Application\chrome.exe
```

**Launch Options**:

The scripts use Windows-compatible launch arguments:

```javascript
{
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu'  // Windows-specific
  ]
}
```

### File Path Handling

- All scripts use `path.join()` for cross-platform compatibility
- No hard-coded Unix paths
- Supports Windows backslash paths

### LibreOffice on Windows

For Excel formula recalculation, LibreOffice is automatically configured on first run. Install LibreOffice from: https://www.libreoffice.org/download/download/

## Installation

### Prerequisites

- Node.js 18+ (Download from https://nodejs.org/)
- npm (comes with Node.js)
- Chrome or Chromium browser (for Chrome automation)
- LibreOffice (optional, for Excel formula recalculation)

### Install Dependencies

```bash
cd /path/to/AionUi
npm install
```

This will install:
- `puppeteer` (^23.10.4) - Chrome automation
- `exceljs` (^4.4.0) - Advanced Excel features
- `pptxgenjs` (^3.12.0) - PowerPoint generation
- `pdf-lib` (^1.17.1) - PDF manipulation
- `docx` (^9.5.1) - Word document creation (already included)

### Verify Installation

```bash
# Test Chrome automation
node skills/chrome/scripts/screenshot.js https://example.com test.png

# Test Excel generation
echo '{"projectionYears":3,"startYear":2025}' > test_config.json
node skills/xlsx/scripts/create_financial_model.js test_config.json test.xlsx
```

## Usage Examples

### Complete Workflow: Financial Report

```bash
# 1. Scrape financial data from website
node skills/chrome/scripts/scrape_data.js \
  https://finance.example.com selectors.json data.json

# 2. Create Excel financial model
node skills/xlsx/scripts/create_financial_model.js \
  config.json financial_model.xlsx

# 3. Generate Word report
node skills/docx/scripts/create_professional_doc.js \
  report_config.json quarterly_report.docx

# 4. Create PowerPoint presentation
node skills/pptx/scripts/create_presentation.js \
  presentation_config.json board_presentation.pptx

# 5. Merge everything into PDF
node skills/pdf/scripts/merge_pdfs_js.js \
  complete_report.pdf report1.pdf report2.pdf
```

### Automated Testing Pipeline

```bash
# 1. Run browser tests
node skills/chrome/scripts/test_page.js \
  https://app.example.com test_config.json

# 2. Capture screenshots
node skills/chrome/scripts/screenshot.js \
  https://app.example.com --fullPage screenshot.png

# 3. Generate PDF report
node skills/chrome/scripts/generate_pdf.js \
  https://app.example.com test_report.pdf
```

## Troubleshooting

### Chrome fails to launch

**Error**: `Could not find Chrome executable`

**Solution**: 
1. Install Chrome from https://www.google.com/chrome/
2. Set CHROME_PATH environment variable (see Windows Compatibility section)

### Excel formulas showing as text

**Error**: Formulas not calculating

**Solution**:
```bash
python skills/xlsx/recalc.py output.xlsx
```

### PDF annotation not visible

**Error**: Annotations don't appear in PDF

**Solution**: Ensure coordinates are within page bounds. PDF coordinates are from bottom-left corner.

### Module not found errors

**Error**: `Cannot find module 'puppeteer'`

**Solution**:
```bash
npm install
```

## Support

For issues and feature requests, please visit: https://github.com/nrgyapp/AionUi/issues

## License

Apache-2.0 - See LICENSE file for details

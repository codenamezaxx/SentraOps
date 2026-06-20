'use client'

/**
 * Injects `@media print` CSS for professional PDF export of the financial report.
 * Renders a hidden structure that becomes visible only during print.
 */
export function PrintStyles() {
  return (
    <>
      <style>{`
        @media print {
          /* Hide interactive elements */
          nav, .sidebar, .bottom-nav, button, .md\\:hidden,
          a:not(.print\\:inline), kbd,
          [class*="PeriodSelector"],
          [class*="ExportButton"],
          [class*="Navigation"],
          [class*="MobileBottomNav"],
          [class*="ThemeToggle"],
          [class*="GlobalSearch"],
          [class*="NotificationBell"],
          phantom-ui,
          .no-print {
            display: none !important;
          }

          /* Page setup */
          @page {
            size: A4 portrait;
            margin: 15mm 20mm;
          }

          body {
            background: white !important;
            color: black !important;
            font-family: 'Be Vietnam Pro', Arial, sans-serif !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* Main container reset */
          .flex-1 {
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
            background: white !important;
          }

          /* Report header */
          .print-header {
            display: flex !important;
            justify-content: space-between !important;
            align-items: flex-end !important;
            border-bottom: 2px solid #1a1a1a !important;
            padding-bottom: 8px !important;
            margin-bottom: 16px !important;
          }

          .print-header h1 {
            font-size: 20pt !important;
            font-weight: 700 !important;
            color: #1a1a1a !important;
            margin: 0 !important;
          }

          .print-header .print-date {
            font-size: 8pt !important;
            color: #666 !important;
          }

          .print-period {
            font-size: 9pt !important;
            color: #444 !important;
            margin-bottom: 20px !important;
          }

          /* Stat cards — simple rows for print */
          .print-metrics-row {
            display: flex !important;
            gap: 12px !important;
            margin-bottom: 12px !important;
          }

          .print-metrics-row.two-col > .print-metric {
            flex: 1 !important;
          }

          .print-metrics-row.three-col > .print-metric {
            flex: 1 !important;
          }

          .print-metric {
            border: 1px solid #ddd !important;
            border-radius: 4px !important;
            padding: 10px 14px !important;
            page-break-inside: avoid !important;
          }

          .print-metric .label {
            font-size: 8pt !important;
            color: #666 !important;
            text-transform: uppercase !important;
            letter-spacing: 0.5px !important;
            margin-bottom: 2px !important;
          }

          .print-metric .value {
            font-size: 14pt !important;
            font-weight: 700 !important;
            color: #1a1a1a !important;
          }

          .print-metric .value.negative {
            color: #d32f2f !important;
          }

          .print-metric .value.positive {
            color: #2e7d32 !important;
          }

          /* Summary table */
          .print-table {
            width: 100% !important;
            border-collapse: collapse !important;
            margin-bottom: 20px !important;
            font-size: 9pt !important;
          }

          .print-table th {
            background: #f5f5f5 !important;
            color: #1a1a1a !important;
            font-weight: 600 !important;
            text-align: left !important;
            padding: 8px 10px !important;
            border: 1px solid #ddd !important;
            text-transform: uppercase !important;
            font-size: 8pt !important;
            letter-spacing: 0.5px !important;
          }

          .print-table td {
            padding: 7px 10px !important;
            border: 1px solid #ddd !important;
            color: #333 !important;
          }

          .print-table td:last-child,
          .print-table th:last-child {
            text-align: right !important;
          }

          .print-table tr:last-child td {
            font-weight: 700 !important;
            border-top: 2px solid #1a1a1a !important;
          }

          /* Chart section */
          .print-chart-section {
            page-break-inside: avoid !important;
            margin-bottom: 20px !important;
          }

          .print-chart-section h3 {
            font-size: 11pt !important;
            font-weight: 700 !important;
            color: #1a1a1a !important;
            border-bottom: 1px solid #ddd !important;
            padding-bottom: 4px !important;
            margin-bottom: 10px !important;
          }

          /* Payment breakdown table */
          .print-payment-section {
            page-break-inside: avoid !important;
          }

          /* Footer */
          .print-footer {
            margin-top: 24px !important;
            padding-top: 8px !important;
            border-top: 1px solid #ddd !important;
            font-size: 7pt !important;
            color: #999 !important;
            text-align: center !important;
          }

          /* Hide screen-only cards, show print equivalents */
          .screen-only {
            display: none !important;
          }

          .print-only {
            display: block !important;
          }

          /* Remove all rounded corners, shadows, borders from screen cards */
          [class*="rounded-2xl"],
          [class*="rounded-xl"],
          [class*="rounded-lg"] {
            border-radius: 0 !important;
          }

          [class*="shadow"] {
            box-shadow: none !important;
          }

          /* Override card backgrounds to white */
          [class*="bg-card"],
          [class*="bg-muted"],
          [class*="bg-surface"] {
            background: white !important;
          }

          /* Ensure text contrast */
          [class*="text-muted-foreground"],
          [class*="text-on-surface-variant"] {
            color: #666 !important;
          }

          [class*="text-foreground"],
          [class*="text-on-surface"] {
            color: #1a1a1a !important;
          }
        }
      `}</style>

      {/* Print-only header injected at top */}
      <div className="print-only hidden print:flex print-header">
        <div>
          <h1>Laporan Keuangan</h1>
          <p className="print-date" id="print-date" />
        </div>
      </div>
    </>
  )
}

import type { TDocumentDefinitions, TDocumentInformation } from 'pdfmake/interfaces'

export interface PdfExportData {
  storeName: string
  periodLabel: string
  metrics: {
    grossRevenue: number
    totalExpenses: number
    cogs: number
    netProfit: number
    profitMargin: number
  }
  chartData: { date: string; revenue: number }[]
  paymentMethodData: { method: string; count: number; total: number }[]
  topProducts: { name: string; total_profit: number; total_qty: number }[]
}

function fmtCurrency(n: number): string {
  return `Rp ${n.toLocaleString('id-ID')}`
}

export function buildReportDefinition(data: PdfExportData): TDocumentDefinitions {
  const now = new Date()
  const printDate = now.toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

  const profitColor = data.metrics.netProfit >= 0 ? '#2e7d32' : '#d32f2f'

  // ── Revenue table body ──
  const revenueTableBody: any[][] = [
    [
      { text: 'Tanggal', style: 'tableHeader' },
      { text: 'Pendapatan', style: 'tableHeader', alignment: 'right' },
    ],
    ...data.chartData.map((d) => [
      { text: d.date, fontSize: 9 },
      { text: fmtCurrency(d.revenue), fontSize: 9, alignment: 'right' },
    ]),
  ]

  // ── Payment method table body ──
  const paymentTableBody: any[][] = [
    [
      { text: 'Metode', style: 'tableHeader' },
      { text: 'Jumlah', style: 'tableHeader', alignment: 'center' },
      { text: 'Total', style: 'tableHeader', alignment: 'right' },
    ],
    ...data.paymentMethodData.map((d) => [
      { text: d.method === 'cash' ? 'Tunai' : 'QRIS / Transfer', fontSize: 9 },
      { text: `${d.count}`, fontSize: 9, alignment: 'center' },
      { text: fmtCurrency(d.total), fontSize: 9, alignment: 'right' },
    ]),
  ]

  // ── Top products table body ──
  const topProductsBody: any[][] = [
    [
      { text: 'Produk', style: 'tableHeader' },
      { text: 'Terjual', style: 'tableHeader', alignment: 'center' },
      { text: 'Laba', style: 'tableHeader', alignment: 'right' },
    ],
    ...data.topProducts.map((p) => [
      { text: p.name, fontSize: 9 },
      { text: `${p.total_qty}`, fontSize: 9, alignment: 'center' },
      { text: fmtCurrency(p.total_profit), fontSize: 9, alignment: 'right' },
    ]),
  ]

  const totalRevenue = data.metrics.grossRevenue

  // ── Document Definition ──
  const dd: TDocumentDefinitions = {
    info: {
      title: `Laporan Keuangan - ${data.periodLabel}`,
      author: 'SentraOps',
    } as TDocumentInformation,

    pageMargins: [40, 60, 40, 60],

    footer: (currentPage: number, pageCount: number) => ({
      text: `Halaman ${currentPage} / ${pageCount}`,
      alignment: 'center',
      fontSize: 8,
      color: '#999',
      margin: [0, 10, 0, 0],
    }),

    content: [
      // ── HEADER ──
      {
        columns: [
          {
            width: '*',
            stack: [
              { text: 'LAPORAN KEUANGAN', fontSize: 20, bold: true, color: '#1a1a1a' },
              { text: data.storeName, fontSize: 10, color: '#666', margin: [0, 2, 0, 0] },
            ],
          },
          {
            width: 'auto',
            stack: [
              { text: `Periode: ${data.periodLabel}`, fontSize: 9, color: '#444', alignment: 'right' },
              { text: `Dicetak: ${printDate}`, fontSize: 8, color: '#999', alignment: 'right' },
            ],
          },
        ],
      },
      { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 2, lineColor: '#1a1a1a' }] },
      { text: '', margin: [0, 4, 0, 0] },

      // ── SUMMARY METRICS ROW 1: Revenue + Expenses ──
      {
        columns: [
          {
            width: '50%',
            stack: [
              { text: 'TOTAL PENDAPATAN', fontSize: 8, color: '#666', margin: [0, 0, 0, 2] },
              { text: fmtCurrency(data.metrics.grossRevenue), fontSize: 16, bold: true, color: '#1a1a1a' },
            ],
            margin: [0, 0, 6, 0],
          },
          {
            width: '50%',
            stack: [
              { text: 'TOTAL PENGELUARAN', fontSize: 8, color: '#666', margin: [0, 0, 0, 2] },
              { text: fmtCurrency(data.metrics.totalExpenses), fontSize: 16, bold: true, color: '#d32f2f' },
            ],
            margin: [6, 0, 0, 0],
          },
        ],
      },
      { text: '', margin: [0, 4, 0, 0] },

      // ── SUMMARY METRICS ROW 2: COGS + Net Profit + Margin ──
      {
        columns: [
          {
            width: '33%',
            stack: [
              { text: 'HARGA POKOK PENJUALAN', fontSize: 8, color: '#666', margin: [0, 0, 0, 2] },
              { text: fmtCurrency(data.metrics.cogs), fontSize: 14, bold: true, color: '#1a1a1a' },
            ],
            margin: [0, 0, 4, 0],
          },
          {
            width: '33%',
            stack: [
              { text: 'LABA BERSIH', fontSize: 8, color: '#666', margin: [0, 0, 0, 2] },
              { text: fmtCurrency(data.metrics.netProfit), fontSize: 14, bold: true, color: profitColor },
            ],
            margin: [4, 0, 4, 0],
          },
          {
            width: '33%',
            stack: [
              { text: 'MARGIN LABA', fontSize: 8, color: '#666', margin: [0, 0, 0, 2] },
              { text: `${data.metrics.profitMargin.toFixed(1)}%`, fontSize: 14, bold: true, color: '#1a1a1a' },
            ],
            margin: [4, 0, 0, 0],
          },
        ],
      },
      { text: '', margin: [0, 8, 0, 0] },

      // ── LINE ──
      { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5, lineColor: '#ddd' }] },
      { text: '', margin: [0, 4, 0, 0] },

      // ── REVENUE TABLE ──
      { text: 'RINCIAN PENDAPATAN', fontSize: 11, bold: true, color: '#1a1a1a', margin: [0, 0, 0, 4] },
      {
        table: {
          headerRows: 1,
          widths: ['*', 'auto'],
          body: revenueTableBody,
        },
        layout: {
          hLineWidth: (i: number) => (i === 0 || i === revenueTableBody.length ? 0.5 : 0.3),
          vLineWidth: () => 0,
          hLineColor: () => '#ddd',
          paddingLeft: () => 6,
          paddingRight: () => 6,
          paddingTop: () => 4,
          paddingBottom: () => 4,
        },
      },
      { text: '', margin: [0, 4, 0, 0] },

      // ── TOTAL REVENUE ──
      {
        columns: [
          { width: '*', text: '' },
          {
            width: 'auto',
            stack: [
              { text: `Total Pendapatan: ${fmtCurrency(totalRevenue)}`, fontSize: 10, bold: true, color: '#1a1a1a' },
            ],
          },
        ],
      },
      { text: '', margin: [0, 8, 0, 0] },

      // ── PAYMENT METHOD TABLE ──
      { text: 'METODE PEMBAYARAN', fontSize: 11, bold: true, color: '#1a1a1a', margin: [0, 0, 0, 4] },
      {
        table: {
          headerRows: 1,
          widths: ['*', 'auto', 'auto'],
          body: paymentTableBody,
        },
        layout: {
          hLineWidth: (i: number) => (i === 0 || i === paymentTableBody.length ? 0.5 : 0.3),
          vLineWidth: () => 0,
          hLineColor: () => '#ddd',
          paddingLeft: () => 6,
          paddingRight: () => 6,
          paddingTop: () => 4,
          paddingBottom: () => 4,
        },
      },
      { text: '', margin: [0, 8, 0, 0] },

      // ── TOP PRODUCTS TABLE ──
      ...(data.topProducts.length > 0
        ? [
            { text: 'PRODUK DENGAN LABA TERTINGGI', fontSize: 11, bold: true, color: '#1a1a1a', margin: [0, 0, 0, 4] as [number, number, number, number] },
            {
              table: {
                headerRows: 1,
                widths: ['*', 'auto', 'auto'],
                body: topProductsBody,
              },
              layout: {
                hLineWidth: (i: number) => (i === 0 || i === topProductsBody.length ? 0.5 : 0.3),
                vLineWidth: () => 0,
                hLineColor: () => '#ddd',
                paddingLeft: () => 6,
                paddingRight: () => 6,
                paddingTop: () => 4,
                paddingBottom: () => 4,
              },
            },
          ]
        : []),

      { text: '', margin: [0, 12, 0, 0] as [number, number, number, number] },
    ],

    defaultStyle: {
      font: 'Roboto',
      fontSize: 10,
      color: '#333',
    },
  }

  return dd
}

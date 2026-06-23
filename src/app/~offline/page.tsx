import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SentraOps - Offline",
};

export default function OfflinePage() {
  return (
    <html lang="id">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body
        style={{
          margin: 0,
          padding: 24,
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          background: "#fafafa",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100dvh",
          color: "#1c1917",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: 360 }}>
          <div
            style={{
              width: 64,
              height: 64,
              background: "#0d9488",
              borderRadius: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
              fontSize: 32,
              color: "white",
              fontWeight: 700,
            }}
          >
            S
          </div>
          <h1 style={{ fontSize: 20, marginBottom: 8 }}>Tidak Ada Koneksi</h1>
          <p style={{ fontSize: 14, color: "#78716c", lineHeight: 1.5 }}>
            SentraOps membutuhkan koneksi internet untuk memuat halaman ini.
            Periksa koneksi Anda dan coba lagi.
          </p>
        </div>
      </body>
    </html>
  );
}

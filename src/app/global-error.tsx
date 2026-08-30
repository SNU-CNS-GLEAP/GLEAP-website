"use client";

import "./globals.css";

export default function GlobalError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="ko" style={{ colorScheme: "light" }}>
      <body style={{ margin: 0, background: "#fff", color: "#071b49", fontFamily: "var(--font-gleap-sans)" }}>
        <title>오류 | GLEAP</title>
        <main style={{ display: "grid", minHeight: "100vh", placeItems: "center", padding: "24px" }}>
          <div style={{ width: "min(100%, 720px)", borderTop: "2px solid #2f65e8", paddingTop: "32px" }}>
            <p style={{ color: "#667085", fontSize: "12px", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase" }}>GLEAP · Something went wrong</p>
            <h1 style={{ margin: "24px 0 0", fontSize: "clamp(40px, 8vw, 72px)", letterSpacing: "-.06em", lineHeight: 1 }}>잠시 문제가 생겼습니다.</h1>
            <p style={{ margin: "24px 0 0", color: "#667085", lineHeight: 1.8 }}>We could not complete your request. 잠시 뒤 다시 시도해 주세요.</p>
            <button type="button" onClick={() => retry()} style={{ marginTop: "32px", border: 0, background: "#071b49", padding: "14px 20px", color: "white", cursor: "pointer", fontWeight: 700 }}>다시 시도 · Try again</button>
          </div>
        </main>
      </body>
    </html>
  );
}

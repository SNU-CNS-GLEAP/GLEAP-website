import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "404 | GLEAP",
  description: "The requested GLEAP page could not be found.",
};

export default function GlobalNotFound() {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="grid min-h-full place-items-center bg-background px-6 text-foreground">
        <main className="w-full max-w-3xl border-t-2 border-accent pt-8">
          <p className="text-xs font-bold uppercase tracking-[.14em] text-muted">GLEAP · 404</p>
          <h1 className="mt-6 text-5xl font-semibold tracking-[-.06em] text-primary-deep sm:text-7xl">페이지를 찾을 수 없습니다.</h1>
          <p className="mt-6 text-base leading-8 text-muted">We could not find the requested page.</p>
          <Link href="/ko" className="editorial-link mt-8">홈으로 · Return home <span aria-hidden>→</span></Link>
        </main>
      </body>
    </html>
  );
}

"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";


export function EasterEggTitle({ children, locale }: { children: React.ReactNode, locale: string }) {
  const [count, setCount] = useState(0);

  return (
    <div className="flex flex-col gap-2">
      <h1
        className="text-3xl font-semibold tracking-tight select-none"
        onClick={() => {
            if (locale === "ko") {
                setCount((c) => c + 1);
            }
        }}
      >
        {children}
      </h1>
      {count < 10 && (
        <p className={`text-xs p-0`} style={{ color: `rgba(1, 1, 1, ${count * 0.03})` }}>
            {`이스터에그까지 ${10 - count}번 남았습니다.`}
        </p>
      )}
      {count >= 10 && (
        <p className="text-sm text-muted">  
          축하합니다! 이스터에그를 발견하셨습니다.{" "}
          <Link href="/wall-of-honor" className="text-primary underline">
            명예의 전당 가기 →
          </Link>
        </p>
      )}
    </div>
  );
}
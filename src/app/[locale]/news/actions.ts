"use server";

import { redirect } from "next/navigation";
import { assertCsrfToken } from "@/lib/csrf";
import { isPostSection } from "@/lib/post-sections";

// /news 검색 폼은 원래 GET 폼(action="/ko/news")이었다. 그런데 GET 폼에 CSRF hidden
// 필드를 넣으면 토큰이 주소창·히스토리·Referer에 그대로 실려 나가고, 빼면 스캐너가
// "anti-CSRF 토큰 없는 <form>"으로 지적한다. 그래서 폼 자체를 Server Action(POST)으로
// 바꾸고, 검색 조건만 뽑아 실제 목록 URL로 redirect한다(Post/Redirect/Get) —
// 토큰은 진짜로 검증되고, 사용자에게 남는 URL은 예전과 똑같이 깨끗한 쿼리스트링이다.
export async function searchNews(locale: string, formData: FormData) {
  await assertCsrfToken(formData);

  const params = new URLSearchParams();
  const q = String(formData.get("q") ?? "").trim();
  const type = String(formData.get("type") ?? "").trim();
  const section = String(formData.get("section") ?? "").trim();

  if (q) params.set("q", q);
  if (type) params.set("type", type);
  if (isPostSection(section)) params.set("section", section);

  const queryString = params.toString();
  redirect(`/${locale}/news${queryString ? `?${queryString}` : ""}`);
}

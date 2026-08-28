import "server-only";

import { dispatchEmail, isEmailConfigured } from "@/lib/email";
import { env } from "@/lib/env";
import { POST_SECTION_LABELS, type PostSection } from "@/lib/post-sections";

const LF = String.fromCharCode(10);

type PostBackupInput = {
  id: number;
  action: "created" | "updated";
  type: string;
  section: PostSection;
  titleKo: string;
  titleEn: string | null;
  bodyKo: string;
  bodyEn: string | null;
  authorName: string | null;
  publishedAt: Date;
};

/**
 * 관리자가 소식 글을 쓰거나 수정할 때마다 본문 원문(Markdown)을 통째로 메일로 남겨두는
 * 자체 백업. Neon(DB)이 유일한 저장소라 실수로 지우거나 DB 자체에 문제가 생겼을 때
 * 복구할 원문이 메일함에 남아있게 하려는 목적 — 별도 백업 인프라 없이 운영 비용 0원을
 * 유지하면서 얻는 가장 간단한 안전망.
 *
 * 발송 실패가 글 저장 자체를 막으면 안 되므로, 호출부(new/edit actions.ts)에서
 * await 없이 fire-and-forget으로 부르고 실패는 콘솔에만 남긴다.
 */
export async function sendPostBackupEmail(post: PostBackupInput): Promise<void> {
  if (!env.postBackupEmailEnabled) return;
  if (!isEmailConfigured()) return;
  const to = env.postBackupEmailTo;
  if (!to) return;

  const actionLabel = post.action === "created" ? "새 글 작성" : "글 수정";
  const sectionLabel = POST_SECTION_LABELS[post.section].ko;
  const subject = `[GLEAP 소식 백업] (${actionLabel}) ${post.titleKo}`;

  const text = [
    `# ${post.titleKo}`,
    "",
    `- id: ${post.id}`,
    `- 동작: ${actionLabel}`,
    `- 분류(type): ${post.type}`,
    `- 구분(section): ${sectionLabel} (${post.section})`,
    `- 작성자 표시명: ${post.authorName ?? "(없음)"}`,
    `- 게시일: ${post.publishedAt.toISOString().slice(0, 10)}`,
    "",
    "## 제목 (한국어)",
    "",
    post.titleKo,
    "",
    "## 제목 (English)",
    "",
    post.titleEn || "(없음)",
    "",
    "---",
    "",
    "## 본문 (한국어, Markdown 원문)",
    "",
    post.bodyKo,
    "",
    "---",
    "",
    "## 본문 (English, Markdown 원문)",
    "",
    post.bodyEn || "(없음)",
    "",
    "---",
    "",
    `- 작성자 표시명: ${post.authorName ?? "(없음)"}`,
    `- 게시일: ${post.publishedAt.toISOString().slice(0, 10)}`,
  ].join(LF);

  try {
    await dispatchEmail({ to, subject, text });
  } catch (error) {
    console.error("소식 게시물 백업 메일 발송 실패:", error);
  }
}

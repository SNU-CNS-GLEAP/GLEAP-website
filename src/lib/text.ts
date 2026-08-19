// 게시판 목록 미리보기용 Markdown → 평문 요약. 렌더링이 아니라 발췌이므로 HTML로 변환하지 않는다.
export function excerpt(markdown: string, maxLength = 140): string {
  const text = markdown
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/(\*\*|__|\*|_|`{1,3}|~~)/g, "")
    .replace(/\r?\n+/g, " ")
    .trim();

  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}…`;
}

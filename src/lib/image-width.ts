// 본문 이미지의 표시 폭(%)을 Blob URL의 ?w= 쿼리에 실어 저장한다. Markdown 표준 이미지 문법에는
// 크기를 담을 자리가 없어서 쓰는 방식 — 실제 파일 요청에는 안 쓰이므로 렌더링 직전에 떼어낸다.
// (CLAUDE.md "이미지" 절 참고)
export function parseImageSrc(rawSrc: string): { src: string; widthPercent: number | null } {
  const queryIndex = rawSrc.indexOf("?");
  if (queryIndex === -1) {
    return { src: rawSrc, widthPercent: null };
  }
  const src = rawSrc.slice(0, queryIndex);
  const params = new URLSearchParams(rawSrc.slice(queryIndex + 1));
  const w = Number(params.get("w"));
  const widthPercent = Number.isFinite(w) && w > 0 && w < 100 ? w : null;
  return { src, widthPercent };
}

export function withImageWidth(src: string, widthPercent: number | null | undefined): string {
  if (!widthPercent || widthPercent >= 100) return src;
  return `${src}?w=${widthPercent}`;
}

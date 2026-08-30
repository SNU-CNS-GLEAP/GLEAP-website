import ExcelJS from "exceljs";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getAllPostsForExport } from "@/lib/posts";
import { POST_SECTION_LABELS, type PostSection } from "@/lib/post-sections";

// 소식 DB 전체를 엑셀(.xlsx) 한 장으로 뽑는 백업 다운로드. `/admin/news`의 버튼에서만
// 링크되는 GET 엔드포인트라 CSRF 토큰이 필요 없다(상태를 바꾸지 않는 조회 요청).
export async function GET() {
  const session = await getSession();
  if (!session.isAdmin) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const posts = await getAllPostsForExport();

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("소식");
  sheet.columns = [
    { header: "id", key: "id", width: 8 },
    { header: "구분(section)", key: "section", width: 14 },
    { header: "분류(type)", key: "type", width: 16 },
    { header: "제목(한국어)", key: "titleKo", width: 30 },
    { header: "제목(English)", key: "titleEn", width: 30 },
    { header: "본문(한국어, Markdown)", key: "bodyKo", width: 60 },
    { header: "본문(English, Markdown)", key: "bodyEn", width: 60 },
    { header: "대표 이미지 URL", key: "photo", width: 30 },
    { header: "작성자 표시명", key: "authorName", width: 16 },
    { header: "게시일", key: "publishedAt", width: 14 },
    { header: "생성일시", key: "createdAt", width: 20 },
    { header: "수정일시", key: "updatedAt", width: 20 },
  ];
  sheet.getRow(1).font = { bold: true };
  sheet.getColumn("publishedAt").numFmt = "yyyy-mm-dd";
  sheet.getColumn("createdAt").numFmt = "yyyy-mm-dd hh:mm:ss";
  sheet.getColumn("updatedAt").numFmt = "yyyy-mm-dd hh:mm:ss";

  for (const post of posts) {
    sheet.addRow({
      id: post.id,
      section: `${POST_SECTION_LABELS[post.section as PostSection].ko} (${post.section})`,
      type: post.type,
      titleKo: post.titleKo,
      titleEn: post.titleEn ?? "",
      bodyKo: post.bodyKo,
      bodyEn: post.bodyEn ?? "",
      photo: post.photo ?? "",
      authorName: post.authorName ?? "",
      publishedAt: post.publishedAt,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const filename = `gleap-posts-backup-${new Date().toISOString().slice(0, 10)}.xlsx`;

  return new NextResponse(buffer as ArrayBuffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

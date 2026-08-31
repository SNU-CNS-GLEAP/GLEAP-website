import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import sharp from "sharp";
import { getSession } from "@/lib/session";

// 에디터/본문에 그대로 저장되는 공개 URL이라 프로덕션에서만 실제 접두사 없이 저장하고,
// 로컬·프리뷰 업로드는 CLAUDE.md "개발 시 주의" 절에 따라 dev/ 아래에 모아 나중에 정리하기 쉽게 함
const BLOB_PREFIX = process.env.VERCEL_ENV === "production" ? "posts/" : "dev/posts/";
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_WIDTH = 1600;

export async function POST(request: Request) {
  const session = await getSession();
  if (!session.isAdmin) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "no file" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "not an image" }, { status: 400 });
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "file too large" }, { status: 400 });
  }

  const original = Buffer.from(await file.arrayBuffer());
  const optimized = await sharp(original)
    .rotate() // EXIF Orientation대로 실제 픽셀을 회전시키고 태그는 제거 — 카카오톡 등에서
    // 내려받은 사진은 원본 픽셀은 안 돌아간 채 EXIF만 "90도 돌려서 보여줘"로 표시되는데,
    // 이 호출 없이 리사이즈/WebP 변환하면 sharp가 EXIF를 버리면서 회전 정보도 같이 사라져
    // 돌아간 채로 굳어버림
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();

  const blob = await put(`${BLOB_PREFIX}${crypto.randomUUID()}.webp`, optimized, {
    access: "public",
    contentType: "image/webp",
  });

  return NextResponse.json({ url: blob.url });
}

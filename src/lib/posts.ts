import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { posts } from "@/lib/schema";

export const PAGE_SIZE = 15;

type PostListParams = {
  page: number;
  q?: string;
  type?: string;
};

export async function getPostTypes() {
  const rows = await db.selectDistinct({ type: posts.type }).from(posts).orderBy(posts.type);
  return rows.map((row) => row.type);
}

export async function getPosts({ page, q, type }: PostListParams) {
  const conditions = [];
  if (q) {
    conditions.push(or(ilike(posts.titleKo, `%${q}%`), ilike(posts.titleEn, `%${q}%`)));
  }
  if (type) {
    conditions.push(eq(posts.type, type));
  }
  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, [{ count }]] = await Promise.all([
    db
      .select()
      .from(posts)
      .where(where)
      // id를 2차 정렬 기준으로 둬 published_at이 같은 날짜라도 페이지네이션 순서가 흔들리지 않게 함.
      .orderBy(desc(posts.publishedAt), desc(posts.id))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db.select({ count: sql<number>`count(*)::int` }).from(posts).where(where),
  ]);

  return {
    posts: rows,
    total: count,
    totalPages: Math.max(1, Math.ceil(count / PAGE_SIZE)),
  };
}

export async function getPost(id: number) {
  const rows = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
  return rows[0];
}

type PostInput = {
  type: string;
  titleKo: string;
  titleEn: string | null;
  bodyKo: string;
  bodyEn: string | null;
  authorName: string | null;
  publishedAt: Date;
};

export async function createPost(input: PostInput) {
  const [row] = await db
    .insert(posts)
    .values({
      type: input.type,
      titleKo: input.titleKo,
      titleEn: input.titleEn,
      bodyKo: input.bodyKo,
      bodyEn: input.bodyEn,
      authorName: input.authorName,
      publishedAt: input.publishedAt,
    })
    .returning({ id: posts.id });
  return row.id;
}

export async function updatePost(id: number, input: PostInput) {
  await db
    .update(posts)
    .set({
      type: input.type,
      titleKo: input.titleKo,
      titleEn: input.titleEn,
      bodyKo: input.bodyKo,
      bodyEn: input.bodyEn,
      authorName: input.authorName,
      publishedAt: input.publishedAt,
      // 실제 마지막 수정 시각 갱신 — schema.ts에 적어둔 대로 Postgres가 자동으로 해주지 않음.
      updatedAt: new Date(),
    })
    .where(eq(posts.id, id));
}

export async function deletePost(id: number) {
  await db.delete(posts).where(eq(posts.id, id));
}

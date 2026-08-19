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
      .orderBy(desc(posts.createdAt))
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

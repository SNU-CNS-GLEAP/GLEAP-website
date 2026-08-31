"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

// CLAUDE.md "공개 페이지에서의 수정 진입점" 패턴: 공개 페이지(서버 컴포넌트)는 세션을
// 조회하지 않아 static을 유지하고, 이 클라이언트 컴포넌트만 하이드레이션 후 세션을 확인해
// admin이면 편집 링크를 보여준다. 삭제 버튼은 일부러 여기 두지 않음 — 공개 목록/상세
// 페이지에 실수로 누를 수 있는 삭제 버튼을 노출하지 않기 위해서고, 실제 삭제는
// write/(dashboard)/news 관리 목록에서만 가능하다.
type Props = {
  postId: number;
  className?: string;
};

export function AdminEditButton({ postId, className }: Props) {
  const t = useTranslations("AdminArea");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetch("/api/session-status")
      .then((res) => res.json())
      .then((data) => setIsAdmin(Boolean(data.isAdmin)))
      .catch(() => {});
  }, []);

  if (!isAdmin) return null;

  return (
    <Link
      href={`/write/news/${postId}/edit`}
      className={
        className ??
        "rounded border border-admin px-2 py-0.5 text-xs text-admin hover:bg-admin hover:text-white"
      }
    >
      {t("edit")}
    </Link>
  );
}

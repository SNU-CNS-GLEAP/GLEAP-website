import Image from "next/image";
import type { Member } from "@/content/members";
import { localize } from "@/lib/localized-text";

type Labels = {
  email: string;
  tistory: string;
  naverblog: string;
  instagram: string;
  github: string;
  linkedin: string;
};

type Props = {
  member: Member;
  locale: string;
  labels: Labels;
};


const logos: Record<string, string> = {
  tistory: "/icons/tistory.svg",
  naverblog: "/icons/naverblog.svg",
  instagram: "/icons/instagram.svg",
  github: "/icons/github.svg",
  linkedin: "/icons/linkedin.svg",
};

// 링크 이미지가 표기되는 순서. members.ts 안에 적은 순서와 무관하게 이 순서로 표기됨. 
// 선택 과정: "가장 Formal한 것부터"
const linkOrder = ["linkedin", "github", "tistory", "naverblog", "instagram"] as const;

export function MemberCard({ member, locale, labels }: Props) {
  const name = localize(member.name, locale);
  const department = localize(member.department, locale);
  const role = member.role ? localize(member.role, locale) : null;
  const links = linkOrder
    .map((key) => ({ key, href: member.links?.[key] }))
    .filter((link): link is { key: (typeof linkOrder)[number]; href: string } => Boolean(link.href));

  return (
    <li className="flex flex-col items-center gap-2 text-center">
      {member.photo ? (
        <Image
          src={member.photo}
          alt={name.text}
          width={480}
          height={480}
          className="h-28 w-28 rounded-full object-cover"
        />
      ) : (
        <div className="h-28 w-28 rounded-full bg-surface" />
      )}
      <span className="text-sm font-medium" lang={name.lang}>
        {name.text}
      </span>
      {role && (
        <span className="text-xs text-primary" lang={role.lang}>
          {role.text}
        </span>
      )}
      <span className="text-xs text-muted" lang={department.lang}>
        {department.text}
        
        {links.length > 0 && (
          <>
          <span> |</span>
          <div className="inline gap-x-2 gap-y-1">
            {links.map(({ key, href }) => (
              <a
                key={key}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="px-1 py-0.5 text-muted"
              >
              <Image src={logos[key]} alt={labels[key]} width={12} height={12} className="inline-block" />
              </a>
            ))}
          </div>
          </>
        )}
      </span>
      {member.email && (
        <a href={`mailto:${member.email}`} className="text-xs text-muted hover:text-primary hover:underline">
          {member.email}
        </a>
      )}
    </li>
  );
}

import Image from "next/image";
import type { Member } from "@/content/members";
import { SNSLinksOrder } from "@/content/members/types";
import { localize } from "@/lib/localized-text";

type Props = {
  member: Member;
  locale: string;
  labels?: Record<string, string>;
};

const linkLabels = {
  linkedin: "IN",
  github: "GH",
  tistory: "T",
  naverblog: "NB",
  instagram: "IG",
} as const;

export function MemberCard({ member, locale }: Props) {
  const surname = localize(member.surname, locale);
  const givenName = localize(member.givenName, locale);
  const name = {
    text: locale === "ko"
      ? `${surname.text}${givenName.text}`
      : `${givenName.text} ${surname.text}`,
    lang: surname.lang,
  };
  const department = localize(member.department, locale);
  const role = member.role ? localize(member.role, locale) : null;
  const links = SNSLinksOrder
    .map((key) => ({ key, href: member.links?.[key] }))
    .filter((link): link is { key: (typeof SNSLinksOrder)[number]; href: string } => Boolean(link.href));

  return (
    <li className="flex min-w-0 flex-col items-center gap-2 text-center">
      {member.photo ? (
        <div className="relative h-28 w-28 overflow-hidden rounded-full bg-surface">
          <Image src={member.photo} alt={name.text} fill sizes="112px" className="object-cover" />
        </div>
      ) : (
        <div className="h-28 w-28 rounded-full bg-surface" aria-hidden />
      )}
      <span className="text-sm font-medium" lang={name.lang}>{name.text}</span>
      {role && <span className="text-xs text-primary" lang={role.lang}>{role.text}</span>}
      <span className="text-xs text-muted" lang={department.lang}>
        {department.text}
        {links.length > 0 && <span aria-hidden> · </span>}
        {links.length > 0 && (
          <span className="inline-flex gap-1">
            {links.map(({ key, href }) => (
              <a
                key={key}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={key}
                className="px-0.5 text-[9px] font-semibold text-muted hover:text-primary"
              >
                {linkLabels[key]}
              </a>
            ))}
          </span>
        )}
      </span>
      {member.email && (
        <a href={`mailto:${member.email}`} className="max-w-full truncate text-xs text-muted hover:text-primary hover:underline">
          {member.email}
        </a>
      )}
    </li>
  );
}

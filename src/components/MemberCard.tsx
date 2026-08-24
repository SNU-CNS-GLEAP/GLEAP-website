import Image from "next/image";
import type { Member } from "@/content/members";
import { localize } from "@/lib/localized-text";

type Labels = {
  email: string;
  blog: string;
  instagram: string;
  github: string;
  linkedin: string;
};

type Props = {
  member: Member;
  locale: string;
  labels: Labels;
};

const linkOrder = ["blog", "instagram", "github", "linkedin"] as const;

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
      </span>
      {member.email && (
        <a href={`mailto:${member.email}`} className="text-xs text-muted hover:text-primary hover:underline">
          {member.email}
        </a>
      )}
      {links.length > 0 && (
        <div className="flex flex-wrap justify-center gap-x-2 gap-y-1">
          {links.map(({ key, href }) => (
            <a
              key={key}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted hover:border-primary hover:text-primary"
            >
              {labels[key]}
            </a>
          ))}
        </div>
      )}
    </li>
  );
}

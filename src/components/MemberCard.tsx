import Image from "next/image";
import type { Member } from "@/content/members";
import { localize } from "@/lib/localized-text";
import { SNSLinksOrder } from "@/content/members/types";

type Props = {
  member: Member;
  locale: string;
};


// SNS 아이콘 및 정보 수정은, 모두 content/members/types.ts 안에서 수정하기!!!
const SNSLogos: Record<string, string> = SNSLinksOrder.reduce((acc, key) => {
  acc[key] = `/icons/${key}.svg`;
  return acc;
}, {} as Record<string, string>);

const linkOrder = SNSLinksOrder; 

export function MemberCard({ member, locale }: Props) {
  const surname = localize(member.surname, locale);
  const givenName = localize(member.givenName, locale);
  const name = locale === "ko" ? { text: `${surname.text}${givenName.text}`, lang: surname.lang } : { text: `${givenName.text} ${surname.text}`, lang: surname.lang };
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
              <Image src={SNSLogos[key]} alt={key} width={12} height={12} className="inline-block" />
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

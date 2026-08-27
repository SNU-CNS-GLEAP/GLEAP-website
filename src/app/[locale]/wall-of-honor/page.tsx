import { getTranslations, setRequestLocale } from "next-intl/server";
import { LocalizedText } from "@/lib/localized-text";


//Hardcoded Wall of Honor page, as an easter egg page.
//한국어로만 고정됨. 영어로는 지원하지 않습니다. 이스터에그니까.

import { AlumniCohortSelect } from "@/components/AlumniCohortSelect";
import { alumniCohorts } from "@/content/members";



const shoutout: Array<{name: string, message: string}> = [
    {name: "문현호", message: "홈페이지 기반 개발"},
    {name: "박정민", message: "홈페이지 회원 공간 개발 및 연결"},
    {name: "고주형", message: "회원공간 보안 Turnstile 연결"},

];

export default async function WallOfHonorPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

    

    return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-16">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold tracking-tight" lang="ko">
            명예의 전당
        </h1>
        <li className="text-sm text-muted" lang="ko">
            이 페이지는 GLEAP의 회원 공간 개발에 기여한 회원들을 기리기 위해 만들어졌습니다.
        </li>
        {shoutout.map((item, index) => (
            <p key={index} className="text-sm text-muted pt-3" lang="ko">
                <span className="font-semibold">{item.name}</span> for {item.message}
            </p>
        ))}
      </div>
    </main>
    );

}
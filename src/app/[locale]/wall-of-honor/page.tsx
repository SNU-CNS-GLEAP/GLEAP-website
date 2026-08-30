import { getTranslations, setRequestLocale } from "next-intl/server";
import { LocalizedText } from "@/lib/localized-text";


//Hardcoded Wall of Honor page, as an easter egg page.
//한국어로만 고정됨. 영어로는 지원하지 않습니다. 이스터에그니까.

import { AlumniCohortSelect } from "@/components/AlumniCohortSelect";
import { alumniCohorts } from "@/content/members";



const shoutout: Array<{name: string, message: string}> = [
    {name: "문현호", message: "홈페이지 기반 개발, snu 도메인 연결"},
    {name: "박정민", message: "홈페이지 회원 공간 개발 및 연결"},
    {name: "고주형", message: "회원공간 보안 Turnstile 연결"},
    {name: "용현정", message: "소개글 및 활동 페이지 정리"},
    {name: "원동현", message: "Alumni 인원 정보 수합 및 연결"},
    {name: "정지혜", message: "랜딩페이지 디자인 및 양식 확정"},
    {name: "고주형", message: "반응형 프런트엔드 개발"},
    {name: "김민채", message: "소식 게시판, 학술 정보 업데이트"},
    {name: "서채원", message: "소식 게시판, 공지 및 활동 정보 업데이트"},
    {name: "차혜린", message: "프런트엔드 및 인수인계 간 지속적 확인"},
    {name: "문현호", message: "assigning First Maintainer"},


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
        <p className="text-sm text-muted" lang="ko">
            이 페이지는 GLEAP의 회원 공간 개발에 기여한 회원들을 기리기 위해 만들어졌습니다.
        </p>
        {shoutout.map((item, index) => (
            <p key={index} className="text-sm text-muted pt-5" lang="ko">
                <span className="font-semibold">{item.name}</span> for {item.message}
            </p>
        ))}
      </div>
    </main>
    );

}
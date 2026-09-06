import type { Cohort } from "../types";

export const cohort: Cohort = {
  id: 10,
  label: { ko: "10기", en: "10th" },
  description: { ko: "GLEAP 10기 회원 명단입니다.", en: "Roster of GLEAP's 10th generation members." },
  members: [
    { surname: { ko: "구", en: "Ku" }, givenName: { ko: "자영", en: "Jayoung" }, department: { ko: "생명과학부", en: "Dept of Biological Sciences" } },
    { surname: { ko: "김", en: "Kim" }, givenName: { ko: "예진", en: "Yejin" }, department: { ko: "생명과학부", en: "Dept of Biological Sciences" } },
    { surname: { ko: "김", en: "Kim" }, givenName: { ko: "재연", en: "Jaeyeon" }, department: { ko: "수리과학부", en: "Dept of Mathematical Sciences" } },
    { surname: { ko: "김", en: "Kim" }, givenName: { ko: "태완", en: "Taewan" }, department: { ko: "화학부", en: "Dept of Chemistry" } },
    { surname: { ko: "백", en: "Baek" }, givenName: { ko: "범한", en: "Beomhan" }, department: { ko: "수리과학부", en: "Dept of Mathematical Sciences" } },
    { surname: { ko: "심", en: "Shim" }, givenName: { ko: "재은", en: "Jaeeun" }, department: { ko: "화학부", en: "Dept of Chemistry" } },
    { surname: { ko: "이", en: "Lee" }, givenName: { ko: "재형", en: "Jaehyung" }, department: { ko: "물리천문학부", en: "Dept of Physics and Astronomy" } },
    { surname: { ko: "장", en: "Jang" }, givenName: { ko: "현성", en: "Hyunseong" }, department: { ko: "화학부", en: "Dept of Chemistry" } },
    { surname: { ko: "정", en: "Jung" }, givenName: { ko: "주환", en: "Joohwan" }, department: { ko: "지구환경과학부", en: "Dept of Earth and Environmental Sciences" } },
  ],
};

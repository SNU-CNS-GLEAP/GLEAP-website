import type { LocalizedText } from "@/lib/localized-text";

export const about: {
  motto: LocalizedText;
  paragraphs: LocalizedText[];
} = {
  motto: {
    ko: "Connect Science, Illuminate World",
    en: "Connect Science, Illuminate World",
  },
  paragraphs: [
    {
      ko: "GLEAP은 서울대학교 자연과학대학이 설립한 공인 학부생 우수학생자치단체입니다. 자연과학계 우수 학생들이 미래의 국제 리더가 될 수 있는 기회를 제공하기 위해 만들어졌습니다.",
      en: "GLEAP is an officially recognized undergraduate student organization established by the College of Natural Sciences at Seoul National University. It was founded to give outstanding students in the natural sciences the opportunity to grow into future global leaders.",
    },
    {
      ko: "GLEAP의 활동은 자연과학대학의 재정적, 행정적 지원을 받아 이루어지지만, 본질적으로 학생들이 주도하는 학생자치단체입니다. 모든 활동은 기획부터 실행까지 학생들의 직접적인 노력을 통해 이루어집니다.",
      en: "While GLEAP's activities are supported financially and administratively by the College of Natural Sciences, it is fundamentally a self-governing organization led by its own members — every activity, from planning to execution, is carried out directly by the students themselves.",
    },
  ],
};

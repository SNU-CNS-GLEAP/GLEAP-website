import type { Cohort } from "../types";

// 1기는 아직 명단이 정리되지 않은 자리표시자(placeholder). Wix에도 기수 드롭다운 옵션만
// 있고 실제 등록된 인원이 없어 members를 빈 배열로 둠 — 나중에 명단이 확인되면 채울 것.
export const cohort: Cohort = {
  id: 1,
  label: { ko: "1기", en: "1st" },
  description: { ko: "GLEAP 1기 회원 명단입니다.", en: "Roster of GLEAP's 1st generation members." },
  members: [],
};

import type { Cohort } from "./types";

export type { Member, Cohort } from "./types";

// 항목 하나가 회원 한 명. 채우는 예시 (전부 선택 필드 — 없는 항목은 그냥 생략):
// {
//   name: { ko: "문현호" },
//   role: { ko: "부회장" },
//   department: { ko: "생명과학부" },
//   photo: "/members/15문현호.jpg",
//   email: "example@snu.ac.kr",
//   links: { tistory: "https://...", naverblog: "https://...", instagram: "https://instagram.com/...", github: "https://github.com/..." },
// }

// 기수 하나 = cohorts/{2자리 번호}.ts 파일 하나. 기수마다 명단이 계속 늘어나면서 예전처럼
// 파일 하나에 15개 기수를 다 넣으면 한 파일이 너무 커져서(수백 줄) 찾고 고치기 번거로워짐 —
// 그래서 기수별로 파일을 쪼개고 여기서 배열로 합치기만 한다. 새 기수를 추가할 때는
// cohorts/{다음 번호}.ts 파일을 만들고 아래 cohorts 배열에 한 줄 추가하면 된다.
import { cohort as cohort01 } from "./cohorts/01";
import { cohort as cohort02 } from "./cohorts/02";
import { cohort as cohort03 } from "./cohorts/03";
import { cohort as cohort04 } from "./cohorts/04";
import { cohort as cohort05 } from "./cohorts/05";
import { cohort as cohort06 } from "./cohorts/06";
import { cohort as cohort07 } from "./cohorts/07";
import { cohort as cohort08 } from "./cohorts/08";
import { cohort as cohort09 } from "./cohorts/09";
import { cohort as cohort10 } from "./cohorts/10";
import { cohort as cohort11 } from "./cohorts/11";
import { cohort as cohort12 } from "./cohorts/12";
import { cohort as cohort13 } from "./cohorts/13";
import { cohort as cohort14 } from "./cohorts/14";
import { cohort as cohort15 } from "./cohorts/15";
// TODO 여기 추가!!!

export const cohorts: Cohort[] = [
  cohort01,
  cohort02,
  cohort03,
  cohort04,
  cohort05,
  cohort06,
  cohort07,
  cohort08,
  cohort09,
  cohort10,
  cohort11,
  cohort12,
  cohort13,
  cohort14,
  cohort15,
  // TODO 여기 추가!!!
];

// [Alumni 기준 상수] 매년 최신 2개 기수(현재 활동 중인 junior/senior)만 "구성원", 나머지는 Alumni.
const CURRENT_COHORT_COUNT = 2;

const sortedCohorts = [...cohorts].sort((a, b) => a.id - b.id);
const latestCohortId = Math.max(...cohorts.map((c) => c.id));


const juniorDescription = {
    ko: "GLEAP 회원은 처음 1년 동안 junior로서 GLEAP 활동에 기여하며 배워나갑니다.",
    en: "For their first year, GLEAP members contribute and learn as juniors.",
  }

const seniorDescription = {
    ko: "GLEAP 회원은 1년차 이후 senior로서 GLEAP 활동을 주도하며 후배를 이끌어갑니다.",
    en: "After their first year, GLEAP members lead and mentor juniors as seniors.",
  }

const sortedDescriptedCohorts = sortedCohorts.map((c) => ({
  ...c,
  description: c.id == latestCohortId ? juniorDescription : c.id == latestCohortId - 1 ? seniorDescription : c.description,
}));


// "구성원" 페이지(현재 활동 중, 최신 2개 기수)에 쓰임.
export const currentCohorts = sortedDescriptedCohorts.filter((c) => c.id > latestCohortId - CURRENT_COHORT_COUNT);

// "Alumni" 페이지(최신 2개 기수를 제외한 나머지 전부)에 쓰임.
export const alumniCohorts = sortedDescriptedCohorts.filter((c) => c.id <= latestCohortId - CURRENT_COHORT_COUNT);

// Alumni 드롭다운 기본 선택값 — "최신 -2기" (지금은 15 - 2 = 13기).
export const DEFAULT_ALUMNI_COHORT_ID = latestCohortId - CURRENT_COHORT_COUNT;

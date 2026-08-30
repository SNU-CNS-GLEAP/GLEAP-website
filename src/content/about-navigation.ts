import type { LocalizedText } from "@/lib/localized-text";

export type AboutPageKey = "overview" | "dean" | "history" | "schedule";

export type AboutNavigationItem = {
  id: AboutPageKey;
  href: "/about" | "/about/dean" | "/about/history" | "/about/schedule";
  index: string;
  label: LocalizedText;
  description: LocalizedText;
};

export const aboutNavigationItems: AboutNavigationItem[] = [
  {
    id: "overview",
    href: "/about",
    index: "01",
    label: { ko: "GLEAP 소개", en: "About GLEAP" },
    description: {
      ko: "GLEAP의 정체성과 세 가지 활동 축",
      en: "Our identity and three program pillars",
    },
  },
  {
    id: "dean",
    href: "/about/dean",
    index: "02",
    label: { ko: "학장님 인사말", en: "Message from the Dean" },
    description: {
      ko: "공식 인사말 준비 중",
      en: "Official message coming soon",
    },
  },
  {
    id: "history",
    href: "/about/history",
    index: "03",
    label: { ko: "연혁", en: "History" },
    description: {
      ko: "2012년 창설부터 이어진 성장의 기록",
      en: "Milestones since GLEAP was founded in 2012",
    },
  },
  {
    id: "schedule",
    href: "/about/schedule",
    index: "04",
    label: { ko: "연간 일정", en: "Annual Schedule" },
    description: {
      ko: "선발부터 학술·교류·사회공헌까지의 한 해",
      en: "A year of selection, academic work, exchange, and service",
    },
  },
];

export const deanPageContent = {
  ko: {
    eyebrow: "GLEAP · SEOUL NATIONAL UNIVERSITY",
    title: "학장님 인사말",
    lede: "공식 인사말을 준비하고 있습니다.",
    status: "준비 중",
    description: "내용이 확정되는 대로 이 페이지에서 안내드리겠습니다.",
  },
  en: {
    eyebrow: "GLEAP · SEOUL NATIONAL UNIVERSITY",
    title: "Message from the Dean",
    lede: "The official message from the dean is being prepared.",
    status: "Coming soon",
    description: "It will be published here once the final text is confirmed.",
  },
} as const;

export const historyPageContent = {
  ko: {
    eyebrow: "Our History",
    title: "연혁",
    lede: "2012년의 첫걸음부터 오늘까지, 과학을 연결하고 사회와 나눈 GLEAP의 시간입니다.",
    present: "현재",
    entries: [
      {
        year: "2012",
        title: "GLEAP 창설 · 1기 발족",
        description: "서울대학교 자연과학대학 공인 학부생 우수학생단체로 출발했습니다. 1기 14명과 2기 19명, 총 33명이 초기 공동체의 기반을 만들었습니다.",
      },
      {
        year: "2014",
        title: "자연과학콘서트 시작",
        description: "GLEAP 구성원이 직접 자연과학 강연을 준비해 고등학생과 나누는 대표 사회공헌 프로그램이 시작되었습니다.",
      },
      {
        year: "2020",
        title: "월간 GLEAP 창간",
        description: "자연과학의 흥미로운 주제를 대중의 눈높이에 맞춘 카드뉴스로 전하는 월간 학술 콘텐츠를 매달 발행하기 시작했습니다.",
      },
      {
        year: "2023",
        title: "학술·교류·사회공헌 체계 강화",
        description: "학술 세미나와 저널클럽, 국내 학생단체 교류, 지역 청소년 과학 멘토링을 세 활동 축으로 연결해 프로그램의 연속성을 높였습니다.",
      },
      {
        year: "2025",
        title: "14기 활동 · 싱가포르 해외학술문화탐방",
        description: "싱가포르 국립대학교 학생들과 교류하고 CQT, 연구실 및 연구기관을 방문하며 글로벌 과학 네트워크를 넓혔습니다.",
      },
      {
        year: "NOW",
        title: "Connect Science, Illuminate the World",
        description: "매년 새로운 구성원이 합류해 약 20명의 학생이 학술·교류·사회공헌 프로그램을 스스로 기획하고 실행하는 전통을 이어가고 있습니다.",
      },
    ],
    source: "서울대학교 자연과학대학 GLEAP 공식 소개와 기존 GLEAP 홈페이지의 공개 기록을 바탕으로 정리했습니다.",
  },
  en: {
    eyebrow: "Our History",
    title: "History",
    lede: "From our first step in 2012 to today, this is the story of GLEAP connecting science and sharing it with society.",
    present: "Present",
    entries: [
      {
        year: "2012",
        title: "GLEAP founded · First cohort begins",
        description: "GLEAP began as an officially recognized undergraduate honor society of SNU's College of Natural Sciences. Fourteen members in the first cohort and nineteen in the second built its early foundation.",
      },
      {
        year: "2014",
        title: "Natural Science Concert launched",
        description: "GLEAP began its signature outreach program, with members preparing accessible natural-science lectures for high-school students.",
      },
      {
        year: "2020",
        title: "Monthly GLEAP launched",
        description: "The monthly academic series began translating intriguing scientific topics into approachable card-news stories for the public.",
      },
      {
        year: "2023",
        title: "Three program pillars strengthened",
        description: "Seminars and journal clubs, student-organization exchanges, and youth science mentoring became a more connected academic, exchange, and social-contribution program.",
      },
      {
        year: "2025",
        title: "14th cohort · Singapore field study",
        description: "Members expanded GLEAP's global network through exchanges with NUS students and visits to CQT and other leading research environments in Singapore.",
      },
      {
        year: "NOW",
        title: "Connect Science, Illuminate the World",
        description: "New members join every year, continuing a student-led tradition in which roughly twenty active members plan and run GLEAP's academic, exchange, and service programs.",
      },
    ],
    source: "Compiled from the official SNU College of Natural Sciences GLEAP profile and public records from GLEAP's previous website.",
  },
} as const;

export const schedulePageContent = {
  ko: {
    eyebrow: "A Year at GLEAP",
    title: "연간 일정",
    lede: "달력의 날짜보다 활동의 흐름이 먼저 보이도록, GLEAP의 한 해를 여덟 장면으로 정리했습니다.",
    recurringTitle: "한 해 내내 이어지는 활동",
    recurring: ["정기 회의", "학술 세미나", "저널클럽", "월간 GLEAP"],
    entries: [
      { months: "01—02", season: "Winter", title: "해외학술문화탐방 · 연간 기획", description: "해외 대학과 연구기관을 방문하고, 새 학기의 프로그램과 팀별 운영 계획을 준비합니다.", tone: "exchange" },
      { months: "03", season: "Spring", title: "신입회원 선발 · 오리엔테이션", description: "자연과학대학 학부생 가운데 새로운 기수를 선발하고, 선후배가 함께 활동 방향과 문화를 공유합니다.", tone: "primary" },
      { months: "04—05", season: "Spring", title: "학술 활동 · 지역 멘토링 시작", description: "학술 세미나와 저널클럽을 본격 운영하고, GLEAMING 등 청소년 과학 멘토링을 시작합니다.", tone: "academic" },
      { months: "05—06", season: "Early Summer", title: "국내 학생단체 교류", description: "공우(STEM), KPF, 티:움(TI:um) 등 이공계 학생단체와 융합 세미나와 교류 프로그램을 진행합니다.", tone: "exchange" },
      { months: "07—08", season: "Summer", title: "자연과학콘서트", description: "서울과 지역의 고등학생에게 자연과학의 다양한 분야를 소개하는 공개 강연과 토크 프로그램을 엽니다.", tone: "social" },
      { months: "09—10", season: "Autumn", title: "2학기 학술·사회공헌 프로젝트", description: "팀별 프로젝트를 이어가며 학술 콘텐츠를 발행하고, 멘토링과 교류 프로그램의 결과를 축적합니다.", tone: "academic" },
      { months: "11", season: "Late Autumn", title: "GLEAP의 밤", description: "수료한 선배를 초청해 연구와 진로 이야기를 듣고 현재 구성원과 Alumni의 네트워크를 잇습니다.", tone: "exchange" },
      { months: "12", season: "Winter", title: "연간 결산 · 인수인계", description: "한 해의 활동을 기록하고 다음 운영진과 팀에 경험을 전하며 새로운 사이클을 준비합니다.", tone: "primary" },
    ],
  },
  en: {
    eyebrow: "A Year at GLEAP",
    title: "Annual Schedule",
    lede: "Eight scenes show the rhythm of a GLEAP year more clearly than a conventional calendar.",
    recurringTitle: "Programs running throughout the year",
    recurring: ["Regular meetings", "Academic seminars", "Journal club", "Monthly GLEAP"],
    entries: [
      { months: "01—02", season: "Winter", title: "Overseas field study · Annual planning", description: "Members visit universities and research institutes abroad while each team prepares its programs for the new academic year.", tone: "exchange" },
      { months: "03", season: "Spring", title: "New-member selection · Orientation", description: "A new cohort is selected from the College of Natural Sciences and begins by sharing GLEAP's direction and culture with senior members.", tone: "primary" },
      { months: "04—05", season: "Spring", title: "Academic programs · Youth mentoring begins", description: "Seminars and journal clubs move into full rhythm, alongside science mentoring programs such as GLEAMING.", tone: "academic" },
      { months: "05—06", season: "Early Summer", title: "Domestic student exchanges", description: "GLEAP works with science and engineering groups such as STEM, KPF, and TI:um through joint seminars and exchange programs.", tone: "exchange" },
      { months: "07—08", season: "Summer", title: "Natural Science Concert", description: "Public lectures and conversations introduce high-school students in Seoul and other regions to the breadth of natural science.", tone: "social" },
      { months: "09—10", season: "Autumn", title: "Second-semester academic and outreach projects", description: "Teams continue their projects, publish academic content, and build on the outcomes of mentoring and exchange programs.", tone: "academic" },
      { months: "11", season: "Late Autumn", title: "Night of GLEAP", description: "Alumni return to share research and career stories, strengthening the network between past and present members.", tone: "exchange" },
      { months: "12", season: "Winter", title: "Annual review · Handover", description: "Members document the year's work, pass experience to the next leadership team, and prepare for a new cycle.", tone: "primary" },
    ],
  },
} as const;

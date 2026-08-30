import type { LocalizedText } from "@/lib/localized-text";

export type ActivityCategory = {
  id: string;
  title: LocalizedText;
  programs: { name: LocalizedText; description?: LocalizedText }[];
};

// 기존 Wix 사이트(snucnsgleap.wixsite.com/mysite)의 활동 소개 페이지 내용을 옮겨 옴.
// 프로그램 이름/설명은 매년 크게 안 바뀌는 구조라 여기 둠 — 그 해의 실제 진행 내용은 소식(게시판) 쪽에 쌓을 것.
export const activityCategories: ActivityCategory[] = [
  {
    id: "social",
    title: { ko: "사회 공헌", en: "Social Impact" },
    programs: [
      {
        name: { ko: "톡톡멘토링", en: "Ttok-Ttok Mentoring" },
        description: {
          ko: "톡톡멘토링은 관악구청과 함께 1년 단위로 진행되는 프로젝트로, 관악구 고등학생들에게 다양한 교육 프로그램을 제공하는 것을 목표로 하고 있습니다. 2024년에는 전자기유도 실험과 아이오딘 시계반응 실험을 직접 수행한 후 활동지를 작성하였으며, 발표 주제 선정부터 내용 구성, 발표 후 피드백까지 함께하며 발표 역량을 늘릴 수 있도록 하였습니다.",
          en: "Ttok-Ttok Mentoring is a year-long project run with the Gwanak-gu Office to provide local high school students with hands-on science programs. In 2024, students carried out electromagnetic induction and iodine clock reaction experiments and wrote up their findings, while GLEAP members mentored them through choosing a presentation topic, structuring the content, and refining it with feedback.",
        },
      },
      {
        name: { ko: "자연과학콘서트", en: "Natural Science Concert" },
        description: {
          ko: "GLEAP은 고등학생들의 자연과학에 대한 관심을 불러일으키기 위해 매년 자연과학 콘서트를 개최하고 있습니다. GLEAP 회원들은 자연과학의 모든 분야들(수리과학, 통계학, 물리학, 천문학, 화학, 생명과학, 지구환경과학)을 모두 아우를 수 있는 흥미로운 주제들을 직접 선정하여 강연을 진행합니다.",
          en: "GLEAP hosts a Natural Science Concert every year to spark high school students' curiosity about the natural sciences. Members choose engaging topics spanning every field of natural science — mathematics, statistics, physics, astronomy, chemistry, biology, and earth & environmental science — and deliver the lectures themselves.",
        },
      },
    ],
  },
  {
    id: "academic",
    title: { ko: "학술", en: "Academic" },
    programs: [
      {
        name: { ko: "학술 세미나", en: "Academic Seminar" },
        description: {
          ko: "GLEAP 구성원은 누구나 매월 마지막 정기 회의 이후 열리는 학술 세미나를 통해 본인이 전문성을 갖춘 주제를 약 30분 동안 발표할 수 있습니다. 본인의 전공과 상관없이 자신의 관심 분야에 대해 발표할 수 있으며, 발표가 끝난 후 약 5분 정도의 활발한 질의 응답 시간을 가집니다. 이와 같이 학술세미나는 발표자와 청자 모두에게 본인이 몸담고 있는 분야에서 전문성을 기르고, 그와 동시에 다른 분야에 대한 통찰을 얻을 기회를 제공합니다.",
          en: "At the academic seminar held after the last regular meeting of each month, any GLEAP member can give a roughly 30-minute talk on a subject they know well — regardless of their own major — followed by about five minutes of lively Q&A. The seminar lets speakers deepen their expertise in their own field while giving everyone else a window into fields outside their own.",
        },
      },
      {
        name: { ko: "월간 글립", en: "Monthly GLEAP" },
        description: {
          ko: "GLEAP은 흥미로운 자연과학 이야기를 전하기 위하여 매월 1일에 GLEAP 홈페이지와 인스타그램에 월간 글립을 게시하고 있습니다. 저자는 본인이 소개하고 싶은 자연과학 관련 주제를 선정하여 카드뉴스를 제작하며, 다른 회원들의 피드백을 통하여 대중의 눈높이를 맞춘 후 마침내 세상 밖으로 출간됩니다. 월간 글립은 대중에게 신비로운 자연과학 이야기를 쉽고 재미있게 풀어내는 매체로써 과학의 대중화를 이끌고 있습니다.",
          en: "On the first of every month, GLEAP publishes Monthly GLEAP on its website and Instagram to share an interesting natural science story with the public. A member picks a topic they want to introduce and turns it into card-news content, refining it with feedback from other members until it's ready for a general audience. Monthly GLEAP is GLEAP's way of making the wonders of natural science accessible and fun for everyone.",
        },
      },
    ],
  },
  {
    id: "exchange",
    title: { ko: "교류", en: "Exchange" },
    programs: [
      {
        name: { ko: "국내 학생 단체 교류", en: "Domestic Student Organization Exchange" },
        description: {
          ko: "GLEAP은 매년 국내 학생 단체들과 교류 활동을 진행하고 있습니다. 교류 활동에서는 전공관련 학술 세미나를 진행하고, 과학적 이슈를 주제로 토론하는 시간을 가집니다. GLEAP과 교류하는 단체로 서울대학교 공과대학 우수학생센터 공우(STEM)가 있습니다. 학술 세미나 및 과학 토론과 더불어, GLEAP과 공우는 각자 진행하던 세미나를 융합하여 협업 학술 세미나를 진행합니다. 또한 GLEAP은 KAIST 총장장학생 단체 KPF와 매년 교류 행사인 사이사이 캠프를 진행하고 있습니다. 사이사이는 '사회에 공헌하는 이공계 학생들의 사소한 이노베이션'의 줄임말로, 사이사이 캠프는 젊은 과학도들이 모여서 사회적 이슈들을 함께 논의하고 발표할 수 있는 기회를 제공합니다.",
          en: "GLEAP exchanges with other domestic student organizations every year, holding major-related academic seminars and discussions on scientific issues. One long-running partner is STEM, the outstanding student center of SNU's College of Engineering — beyond joint seminars and debates, GLEAP and STEM combine their respective seminar series into a collaborative session. GLEAP also runs the annual Saisai Camp with KPF, KAIST's presidential scholarship society. \"Saisai\" is short for a Korean phrase meaning small innovations by science and engineering students who give back to society, and the camp brings young scientists together to discuss and present on social issues.",
        },
      },
      {
        name: { ko: "해외학술문화탐방", en: "Overseas Academic & Cultural Exploration" },
        description: {
          ko: "GLEAP은 국내 여러 학생 단체와의 교류를 넘어서 해외 학생 단체와도 교류하고 있습니다. 2025년 해외학술문화탐방은 싱가포르에서 진행되었습니다. 탐방 일정 중 A*STAR(Agency for Science, Technology and Research)를 방문하여 진행 중인 연구와 연구 환경에 대해 살펴보았습니다. 또한 싱가포르 국립대학(National University of Singapore)의 자연과학대학 소속 단체인 SPS(Special Program in Science) 학생들과 의견을 나누는 시간을 가졌으며, 함께 여러 연구실을 둘러보았습니다.",
          en: "Beyond its domestic partners, GLEAP also exchanges with student organizations abroad. The 2025 Overseas Academic & Cultural Exploration trip went to Singapore, where members visited A*STAR (the Agency for Science, Technology and Research) to learn about ongoing research and lab environments, and met students from SPS (Special Program in Science) at the National University of Singapore for discussions and lab tours.",
        },
      },
      {
        name: { ko: "글립의 밤", en: "Night of GLEAP" },
        description: {
          ko: "글립의 밤은 GLEAP 구성원으로 활동하였던 Alumni와 현재 활동하고 있는 구성원 사이의 교류를 촉진하기 위해 매 학기 열리는 홈커밍 행사입니다. GLEAP은 매년 새로운 회원을 모집하고 한 기수가 2년 동안 활동하므로, Alumni와 교류할 수 있는 기회가 적습니다. 이를 보완하기 위해 글립의 밤을 통해 Alumni와 현재 구성원 간의 교류의 장을 제공하고 있습니다. 레크리에이션 활동을 통해 구성원끼리 친목을 다지고, 진로·학술 강연과 선후배 Q&A 시간을 통해 진로나 연구에 대해 서로 궁금한 점을 질문하고 답하는 시간을 가집니다.",
          en: "Night of GLEAP is a homecoming event held every semester to bring together current members and alumni. Since GLEAP recruits new members each year and each cohort stays active for two years, there are few natural chances to connect with alumni — Night of GLEAP fills that gap. Members bond through recreational activities and get to ask alumni about careers and research during career and academic talks and a Q&A session between senior and junior members.",
        },
      },
    ],
  },
];

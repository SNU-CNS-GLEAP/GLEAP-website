export const legalDocumentKeys = [
  "privacy",
  "terms",
  "email-rejection",
  "copyright",
  "member-consent",
] as const;

export type LegalDocumentKey = (typeof legalDocumentKeys)[number];
export type LegalLocale = "ko" | "en";

type LegalBlock =
  | { type: "paragraph"; text: string }
  | { type: "callout"; text: string }
  | { type: "list"; items: string[] }
  | { type: "table"; headers: string[]; rows: string[][] };

export type LegalDocument = {
  title: string;
  eyebrow: string;
  summary: string;
  effectiveDate: string;
  status: string;
  sections: { heading: string; blocks: LegalBlock[] }[];
  references?: { label: string; url: string }[];
  related?: LegalDocumentKey[];
};

const CONTACT_EMAIL = "snucnsgleap@gmail.com";
const EFFECTIVE_DATE_KO = "2026년 8월 30일";
const EFFECTIVE_DATE_EN = "August 30, 2026";

const ko: Record<LegalDocumentKey, LegalDocument> = {
  privacy: {
    title: "개인정보처리방침",
    eyebrow: "Privacy Policy",
    summary:
      "서울대학교 자연과학대학 GLEAP은 홈페이지 이용자의 개인정보를 필요한 범위에서만 처리하고 안전하게 보호하기 위해 다음과 같이 개인정보처리방침을 공개합니다.",
    effectiveDate: EFFECTIVE_DATE_KO,
    status: "베타 운영본 · 실제 처리 구조가 변경되면 본 방침도 함께 개정합니다.",
    sections: [
      {
        heading: "1. 개인정보처리자와 담당부서",
        blocks: [
          { type: "paragraph", text: "운영주체: 서울대학교 자연과학대학 GLEAP" },
          {
            type: "paragraph",
            text: `개인정보 보호업무 및 고충처리 담당부서: GLEAP 운영진 · 이메일: ${CONTACT_EMAIL}`,
          },
          {
            type: "callout",
            text: "개인정보 보호책임자의 성명 또는 담당부서·연락처가 변경되면 이 항목을 우선 갱신합니다.",
          },
        ],
      },
      {
        heading: "2. 처리하는 개인정보, 목적과 보유기간",
        blocks: [
          {
            type: "table",
            headers: ["구분", "처리 항목", "목적", "보유기간"],
            rows: [
              [
                "공개 구성원 정보",
                "이름, 기수, 학과, 직책, 사진, 동의하여 공개한 이메일·외부 링크",
                "구성원 소개와 GLEAP 활동 안내",
                "동의한 공개기간 또는 동의 철회·게시 종료 시까지",
              ],
              [
                "회원 승인·계정",
                "이름, 이메일, 암호화된 비밀번호, 승인 상태·권한, 가입·수정 시각",
                "회원 확인, 로그인, 접근권한 관리",
                "회원 탈퇴 또는 승인 종료 시까지. 관계 법령상 보존 의무가 있으면 해당 기간",
              ],
              [
                "회원 프로필·활동",
                "기수, 소개, 관심 분야, 선택 입력한 Instagram·GitHub 주소, 글·댓글·반응",
                "회원 디렉터리와 커뮤니티 제공",
                "회원이 삭제하거나 계정을 탈퇴할 때까지",
              ],
              [
                "인증·보안 기록",
                "세션 토큰, IP 주소, 브라우저·기기 정보(User-Agent), 접속·갱신 시각",
                "로그인 유지, 부정 이용 방지, 보안 사고 대응",
                "세션 만료 또는 계정 삭제 시까지",
              ],
              [
                "운영 활동기록",
                "회원 식별값, 수행한 관리 동작, 대상 유형·식별값, 처리 시각",
                "권한 변경과 운영 조치 확인",
                "기록 생성 후 1년을 원칙으로 하며 운영진이 정기적으로 삭제",
              ],
              [
                "이메일 문의",
                "보낸 사람 이메일, 문의 내용과 첨부파일, 답변 기록",
                "문의 접수·답변과 분쟁 대응",
                "문의 종결 후 1년 또는 삭제 요청 시까지. 법적 보존 필요 시 해당 기간",
              ],
            ],
          },
          {
            type: "paragraph",
            text: "비밀번호 원문은 보관하지 않으며 인증 시스템이 단방향 암호화한 값만 저장합니다. 선택 항목은 입력하지 않아도 기본 회원 기능을 이용할 수 있습니다.",
          },
        ],
      },
      {
        heading: "3. 처리 근거와 수집 방법",
        blocks: [
          {
            type: "list",
            items: [
              "회원 서비스 제공과 계정 관리에 필요한 정보는 회원가입·로그인·프로필 작성 과정에서 직접 받습니다.",
              "구성원 공개 정보와 행사 사진은 당사자의 동의 또는 적법한 이용 권한을 확인한 뒤 게시합니다.",
              "로그인 세션과 보안 기록은 서비스 이용 과정에서 자동으로 생성될 수 있습니다.",
              "필수 항목의 처리를 거부할 수 있으나, 이 경우 로그인 또는 회원 전용 기능을 제공하기 어려울 수 있습니다.",
            ],
          },
        ],
      },
      {
        heading: "4. 제3자 제공",
        blocks: [
          {
            type: "paragraph",
            text: "GLEAP은 정보주체의 별도 동의가 있거나 법령에 근거가 있는 경우를 제외하고 개인정보를 제3자에게 제공하지 않습니다. 제공이 필요해지면 제공받는 자, 목적, 항목, 보유기간과 거부권을 사전에 알립니다.",
          },
        ],
      },
      {
        heading: "5. 처리업무 위탁과 클라우드 서비스",
        blocks: [
          {
            type: "table",
            headers: ["수탁자", "업무", "처리 범위"],
            rows: [
              ["Vercel Inc.", "웹 호스팅·배포·보안 및 서버 로그, 관리자 이미지 저장 기능", "서비스 요청 정보, 접속·오류 로그, 업로드 이미지"],
              ["Neon, Inc.", "PostgreSQL 데이터베이스 호스팅", "회원 계정·프로필·커뮤니티·운영 기록"],
            ],
          },
          {
            type: "paragraph",
            text: "인증 기능은 GLEAP 서버에서 Better Auth 소프트웨어로 처리하고 계정·세션 정보는 위 Neon 데이터베이스에 저장합니다. 현재 프로덕션에는 별도의 이메일 발송 서비스가 연결되어 있지 않습니다. Gmail 또는 Resend 등을 연결하기 전 본 방침의 수탁자와 국외 이전 내용을 먼저 갱신합니다.",
          },
        ],
      },
      {
        heading: "6. 국외 이전",
        blocks: [
          {
            type: "paragraph",
            text: "Vercel과 Neon은 해외 사업자가 제공하는 글로벌 클라우드 서비스이므로 서비스 운영 과정에서 개인정보가 암호화된 통신망을 통해 국외 서버에서 처리될 수 있습니다. 이전되는 항목은 위 위탁 범위와 같고, 이전 시점·방법은 서비스 이용 시 네트워크 전송, 보유기간은 위 제2항의 기간 또는 각 서비스 계약 종료 시까지입니다.",
          },
          {
            type: "callout",
            text: "실제 데이터 저장 국가·리전과 개인정보 보호법상 국외 이전 근거는 Vercel·Neon 운영 콘솔 및 계약 조건을 운영진이 최종 확인해야 합니다. 리전이나 수탁자가 변경되면 변경 전에 본 방침을 개정하고 필요한 고지·동의 절차를 진행합니다.",
          },
        ],
      },
      {
        heading: "7. 쿠키, 세션과 분석 도구",
        blocks: [
          {
            type: "list",
            items: [
              "관리자 인증에는 필수 쿠키 gleap_session을, 회원 인증에는 로그인 세션 쿠키를 사용합니다.",
              "필수 쿠키는 로그인 상태 유지와 보안을 위해 사용되며 브라우저 설정에서 차단하면 로그인 기능을 이용할 수 없습니다.",
              "현재 코드에는 광고 쿠키나 제3자 행동분석 도구가 설치되어 있지 않습니다.",
              "Vercel은 안정성·보안을 위한 플랫폼 접속 및 오류 로그를 처리할 수 있습니다.",
            ],
          },
        ],
      },
      {
        heading: "8. 정보주체의 권리와 행사 방법",
        blocks: [
          {
            type: "paragraph",
            text: `본인 또는 적법한 대리인은 ${CONTACT_EMAIL}로 개인정보 열람, 정정, 삭제, 처리정지, 동의 철회 또는 계정 탈퇴를 요청할 수 있습니다. 요청 시 본인 확인에 필요한 최소한의 정보를 요구할 수 있으며, GLEAP은 관계 법령이 정한 절차에 따라 지체 없이 처리하고 결과를 안내합니다.`,
          },
          {
            type: "paragraph",
            text: "공개된 이름·사진·이메일 등의 삭제를 요청하면 공개 페이지에서는 우선 비공개하고, 백업이나 캐시에는 기술적으로 필요한 짧은 기간 동안 남을 수 있습니다.",
          },
        ],
      },
      {
        heading: "9. 파기와 안전성 확보조치",
        blocks: [
          {
            type: "list",
            items: [
              "보유기간이 끝나거나 목적이 달성된 개인정보는 복구하기 어려운 방법으로 지체 없이 삭제합니다.",
              "계정·권한을 최소 인원에게만 부여하고 관리자·회원 영역을 분리합니다.",
              "통신구간 암호화(HTTPS), 비밀번호 단방향 암호화, 세션 쿠키 보호, 접근기록 점검을 적용합니다.",
              "출력물이나 별도 동의서가 있으면 잠금장치가 있는 장소에 보관하고 보유기간 종료 후 파쇄합니다.",
            ],
          },
        ],
      },
      {
        heading: "10. 피해 구제와 문의",
        blocks: [
          {
            type: "list",
            items: [
              `GLEAP 개인정보 담당: ${CONTACT_EMAIL}`,
              "개인정보침해 신고센터: 국번 없이 118",
              "개인정보분쟁조정위원회: 1833-6972",
            ],
          },
        ],
      },
      {
        heading: "11. 시행일과 개정 이력",
        blocks: [
          { type: "paragraph", text: `최초 시행일: ${EFFECTIVE_DATE_KO}` },
          { type: "paragraph", text: `개정 이력: ${EFFECTIVE_DATE_KO} 베타 운영본 제정` },
          {
            type: "paragraph",
            text: "중요한 변경이 있으면 시행 전에 홈페이지를 통해 알리고, 이전 버전은 운영진에게 요청하면 확인할 수 있도록 관리합니다.",
          },
        ],
      },
    ],
    references: [
      {
        label: "개인정보 보호법 제30조",
        url: "https://www.law.go.kr/LSW/lsLinkCommonInfo.do?chrClsCd=010202&lsJoLnkSeq=1025127653",
      },
      {
        label: "개인정보보호위원회 개인정보 처리방침 작성지침(2026.4. 개정)",
        url: "https://www.pipc.go.kr/np/cop/bbs/selectBoardArticle.do?bbsId=BS217&mCode=D010030000&nttId=12018",
      },
    ],
    related: ["member-consent", "terms"],
  },
  terms: {
    title: "이용약관",
    eyebrow: "Terms of Use",
    summary: "GLEAP 공식 홈페이지와 회원 공간의 이용 조건, 회원의 책임 및 운영 기준을 안내합니다.",
    effectiveDate: EFFECTIVE_DATE_KO,
    status: "베타 운영본",
    sections: [
      {
        heading: "1. 목적과 적용범위",
        blocks: [
          {
            type: "paragraph",
            text: "이 약관은 서울대학교 자연과학대학 GLEAP이 운영하는 공식 홈페이지와 회원 전용 서비스의 이용에 관한 권리·의무 및 운영 기준을 정합니다.",
          },
        ],
      },
      {
        heading: "2. 회원가입과 계정",
        blocks: [
          {
            type: "list",
            items: [
              "회원 공간은 운영진이 승인한 GLEAP 구성원만 가입·이용할 수 있습니다.",
              "회원은 정확한 정보를 제공하고 비밀번호와 계정을 안전하게 관리해야 합니다.",
              "계정 양도·공유, 타인 사칭 또는 승인되지 않은 접근은 금지됩니다.",
              "회원은 프로필에서 선택 정보를 수정하고 운영진에게 탈퇴를 요청할 수 있습니다.",
            ],
          },
        ],
      },
      {
        heading: "3. 서비스 이용과 금지행위",
        blocks: [
          {
            type: "list",
            items: [
              "법령, 타인의 권리, GLEAP의 운영 목적을 침해하는 행위",
              "개인정보·비공개 자료를 권한 없이 수집·공개·전달하는 행위",
              "악성코드, 자동화 공격, 무단 크롤링 등 서비스 안정성을 해치는 행위",
              "허위정보, 모욕·차별·괴롭힘, 불법 또는 권리침해 콘텐츠를 게시하는 행위",
            ],
          },
          {
            type: "paragraph",
            text: "운영진은 위반 콘텐츠를 임시 비공개 또는 삭제하고, 필요한 경우 계정 이용을 제한할 수 있습니다. 긴급하지 않은 경우에는 사유와 이의제기 방법을 안내합니다.",
          },
        ],
      },
      {
        heading: "4. 게시물과 지식재산권",
        blocks: [
          {
            type: "paragraph",
            text: "회원이 작성한 게시물의 권리는 원칙적으로 작성자에게 있습니다. 회원은 서비스 운영·표시·백업에 필요한 범위에서 GLEAP이 게시물을 이용하는 것을 허락합니다. 제3자의 사진, 글, 로고 등을 게시할 때에는 필요한 권리와 동의를 직접 확인해야 합니다.",
          },
        ],
      },
      {
        heading: "5. 서비스 변경·중단과 책임",
        blocks: [
          {
            type: "paragraph",
            text: "GLEAP은 보안, 점검, 운영 여건에 따라 서비스의 일부를 변경하거나 중단할 수 있으며 가능한 경우 사전에 알립니다. GLEAP은 고의 또는 중대한 과실이 없는 한 천재지변, 외부 서비스 장애, 회원의 귀책사유로 발생한 손해에 대해 법령이 허용하는 범위에서 책임을 제한합니다.",
          },
        ],
      },
      {
        heading: "6. 탈퇴와 이용제한",
        blocks: [
          {
            type: "paragraph",
            text: `탈퇴, 계정 삭제 또는 이용제한에 관한 요청과 이의제기는 ${CONTACT_EMAIL}로 접수합니다. 계정 삭제 후에도 법령상 보관해야 하는 정보와 이미 다른 회원에게 공유된 게시물 일부는 필요한 범위에서 보관될 수 있습니다.`,
          },
        ],
      },
      {
        heading: "7. 약관의 변경과 준거",
        blocks: [
          { type: "paragraph", text: `시행일: ${EFFECTIVE_DATE_KO}` },
          {
            type: "paragraph",
            text: "약관을 변경할 때에는 시행일과 변경 이유를 홈페이지에 알립니다. 이 약관은 대한민국 법령을 따르며 분쟁이 발생하면 당사자 간 협의를 우선합니다.",
          },
        ],
      },
    ],
    related: ["privacy", "copyright"],
  },
  "email-rejection": {
    title: "이메일 무단수집 거부",
    eyebrow: "Email Collection Policy",
    summary: "GLEAP 홈페이지에 공개된 이메일 주소의 무단 수집과 영리 목적 이용을 거부합니다.",
    effectiveDate: EFFECTIVE_DATE_KO,
    status: "안내문",
    sections: [
      {
        heading: "이메일 주소 이용 안내",
        blocks: [
          {
            type: "paragraph",
            text: "이 홈페이지에 게시된 이메일 주소를 이메일 수집 프로그램이나 그 밖의 기술적 장치를 사용하여 운영진의 사전 동의 없이 수집하는 행위를 거부합니다.",
          },
          {
            type: "list",
            items: [
              "공개된 이메일을 광고성 정보 전송, 판매, 명단 작성 등 본래 공개 목적과 다른 용도로 이용하지 마세요.",
              "구성원 개인 이메일은 구성원 소개와 정당한 연락 목적의 범위에서만 이용해야 합니다.",
              "무단 수집·이용으로 타인의 권리를 침해하면 관련 법령에 따른 책임이 발생할 수 있습니다.",
            ],
          },
          { type: "paragraph", text: `문의: ${CONTACT_EMAIL}` },
        ],
      },
    ],
    related: ["privacy", "terms"],
  },
  copyright: {
    title: "저작권 안내",
    eyebrow: "Copyright Notice",
    summary: "GLEAP 홈페이지의 글, 사진, 로고와 기타 콘텐츠를 이용할 때 확인해야 할 권리와 허용 범위를 안내합니다.",
    effectiveDate: EFFECTIVE_DATE_KO,
    status: "베타 운영본",
    sections: [
      {
        heading: "1. 권리의 귀속",
        blocks: [
          {
            type: "paragraph",
            text: "GLEAP이 직접 제작한 문구·편집물·디자인의 권리는 GLEAP 또는 해당 제작자에게 있습니다. © 2026 GLEAP 표시는 권리 안내를 위한 것이며, 제3자가 만든 사진·글·로고의 권리가 자동으로 GLEAP에 이전된다는 뜻은 아닙니다.",
          },
        ],
      },
      {
        heading: "2. 사진과 인물 이미지",
        blocks: [
          {
            type: "list",
            items: [
              "사진 게시 전 촬영자의 저작권 이용허락과 촬영된 사람의 공개 동의를 각각 확인합니다.",
              "미성년자가 식별되는 사진은 촬영·게시 목적과 공개 범위를 설명하고 필요한 경우 법정대리인의 동의를 받습니다.",
              "행사 참여 동의가 모든 홍보·재가공 이용을 자동으로 허락하는 것은 아니므로 매체, 기간, 편집 범위를 구체적으로 기록합니다.",
              "삭제 또는 이용중단 요청은 운영진 이메일로 접수합니다.",
            ],
          },
        ],
      },
      {
        heading: "3. 로고, 상표와 폰트",
        blocks: [
          {
            type: "paragraph",
            text: "GLEAP 및 서울대학교 관련 로고·명칭은 각 권리자의 기준에 따라 사용해야 하며, 공식 제휴나 승인을 오인하게 하는 방식으로 사용할 수 없습니다. 사이트는 Pretendard 폰트를 사용하며 배포본에 포함된 라이선스 조건을 준수합니다.",
          },
        ],
      },
      {
        heading: "4. 콘텐츠 이용",
        blocks: [
          {
            type: "paragraph",
            text: "개인적 열람과 출처를 밝힌 링크 공유 외에 복제, 재배포, 수정, 상업적 이용 또는 데이터셋 제작을 하려면 사전에 허락을 받아야 합니다. 개별 콘텐츠에 별도 라이선스나 출처가 표시된 경우에는 그 조건이 우선합니다.",
          },
          { type: "paragraph", text: `이용허락·권리침해 신고: ${CONTACT_EMAIL}` },
        ],
      },
      {
        heading: "5. 운영 기록 권장사항",
        blocks: [
          {
            type: "list",
            items: [
              "파일명, 촬영자·제작자, 촬영일·제작일, 권리자 연락처",
              "허락받은 매체, 용도, 지역, 기간, 편집 가능 범위",
              "사진 속 인물의 동의 여부와 미성년자 법정대리인 동의 여부",
              "폰트·아이콘·외부 자료의 라이선스 원문 또는 구매 증빙",
            ],
          },
        ],
      },
    ],
    references: [
      {
        label: "한국저작권위원회 저작권 상담·FAQ",
        url: "https://www.copyright.or.kr/customer-center/faq/list.do",
      },
    ],
    related: ["member-consent", "terms"],
  },
  "member-consent": {
    title: "구성원 정보·사진 공개 동의서",
    eyebrow: "Operational Consent Form",
    summary: "구성원 소개와 행사 사진을 공식 홈페이지에 게시하기 전에 사용하는 베타 운영용 동의 양식입니다. 이 페이지 자체는 정보를 전송하거나 저장하지 않습니다.",
    effectiveDate: EFFECTIVE_DATE_KO,
    status: "운영용 양식 · 출력하거나 문서로 복제해 서명본을 별도 보관하세요.",
    sections: [
      {
        heading: "1. 공개 대상자",
        blocks: [
          {
            type: "list",
            items: [
              "성명: ____________________",
              "기수·소속: ____________________",
              "연락 이메일: ____________________",
              "만 14세 미만 또는 별도 보호가 필요한 미성년자인 경우 법정대리인: ____________________",
            ],
          },
        ],
      },
      {
        heading: "2. 동의하는 공개 항목",
        blocks: [
          {
            type: "list",
            items: [
              "□ 이름  □ 사진  □ 학과·전공  □ 기수  □ 직책",
              "□ 이메일  □ SNS·개인 링크  □ 활동·수상·소개 문구",
              "□ 행사 단체사진  □ 행사 영상  □ 기타: ____________________",
            ],
          },
        ],
      },
      {
        heading: "3. 공개 목적·매체·기간",
        blocks: [
          {
            type: "list",
            items: [
              "목적: GLEAP 구성원 및 공식 활동 소개, 행사 기록과 홍보",
              "매체: GLEAP 공식 홈페이지 및 해당 홈페이지의 소셜 미디어 미리보기",
              "기간: □ 재임·활동 기간  □ 졸업·임기 종료 후 ____년  □ 철회 시까지  □ 별도 기간: __________",
              "공개 범위: 인터넷 이용자 누구나 열람 가능하며 검색엔진·캐시에 일시적으로 남을 수 있음",
            ],
          },
        ],
      },
      {
        heading: "4. 사진 권리 확인",
        blocks: [
          {
            type: "list",
            items: [
              "□ 촬영자 또는 저작권자로부터 홈페이지 게시·편집 허락을 받았습니다.",
              "□ 사진에 식별되는 인물에게 공개 목적·매체·기간을 알렸습니다.",
              "□ 미성년자가 포함된 경우 필요한 법정대리인 동의를 확인했습니다.",
              "촬영자·권리자 및 허락 근거: ________________________________",
            ],
          },
        ],
      },
      {
        heading: "5. 동의 철회",
        blocks: [
          {
            type: "paragraph",
            text: `동의는 선택 사항이며 ${CONTACT_EMAIL}로 언제든 철회하거나 공개 범위 변경을 요청할 수 있습니다. 철회 전까지의 적법한 이용에는 영향을 주지 않으며, 철회 후 GLEAP은 공개 페이지에서 해당 정보를 지체 없이 내립니다. 검색엔진 캐시나 제3자의 적법한 보관본은 반영에 시간이 걸릴 수 있습니다.`,
          },
        ],
      },
      {
        heading: "6. 서명",
        blocks: [
          {
            type: "paragraph",
            text: "위 내용을 이해했으며 선택한 항목의 공개에 동의합니다.",
          },
          {
            type: "list",
            items: [
              "동의일: ______년 ____월 ____일",
              "본인 성명·서명: ________________________________",
              "법정대리인 성명·서명(해당 시): ________________________________",
              "GLEAP 확인자: ________________________________",
            ],
          },
        ],
      },
    ],
    related: ["privacy", "copyright"],
  },
};

const en: Record<LegalDocumentKey, LegalDocument> = {
  privacy: {
    title: "Privacy Policy",
    eyebrow: "Privacy Policy",
    summary: "SNU College of Natural Sciences GLEAP processes personal information only to the extent necessary to operate its website and member services. This policy explains how that information is handled and protected.",
    effectiveDate: EFFECTIVE_DATE_EN,
    status: "Beta policy · Updated whenever the actual processing structure changes.",
    sections: [
      {
        heading: "1. Controller and privacy contact",
        blocks: [
          { type: "paragraph", text: "Operator: SNU College of Natural Sciences GLEAP" },
          { type: "paragraph", text: `Privacy and grievance contact: GLEAP Operations · ${CONTACT_EMAIL}` },
          { type: "callout", text: "This section will be updated first whenever the name of the privacy officer or the responsible team and contact details change." },
        ],
      },
      {
        heading: "2. Information, purposes and retention",
        blocks: [
          {
            type: "table",
            headers: ["Category", "Information", "Purpose", "Retention"],
            rows: [
              ["Public member profile", "Name, cohort, department, role, photo, consented email and links", "Introduce members and activities", "For the consented publication period or until withdrawal"],
              ["Account and approval", "Name, email, hashed password, approval status and role, sign-up and update timestamps", "Member verification, sign-in and access control", "Until account deletion or membership approval ends; longer only when retention is required by law"],
              ["Member profile and community", "Bio, interests, optional social links, posts, comments and reactions", "Member directory and community", "Until deleted by the member or account deletion"],
              ["Session and security", "Session token, IP address, User-Agent, access and update timestamps", "Authentication, security and abuse prevention", "Until session expiry or account deletion"],
              ["Operational activity", "Member identifier, administrative action, target type and identifier, timestamp", "Review access changes and operational actions", "Normally one year from creation, followed by periodic deletion by the operators"],
              ["Email inquiries", "Sender email, inquiry, attachments and reply history", "Receive and answer inquiries and respond to disputes", "One year after resolution or until an earlier deletion request; longer only when legally required"],
            ],
          },
          { type: "paragraph", text: "Plain-text passwords are not stored; the authentication system retains only one-way hashed values. Optional fields are not required to use the core member functions." },
        ],
      },
      {
        heading: "3. Sources and legal basis",
        blocks: [
          { type: "list", items: ["Information needed for member services and account management is provided directly during sign-up, sign-in and profile editing.", "Public member information and event photos are posted only after the data subject's consent or another valid permission has been confirmed.", "Sign-in sessions and security records may be created automatically while the service is used.", "You may decline to provide required information, but GLEAP may then be unable to provide sign-in or member-only functions."] },
        ],
      },
      {
        heading: "4. Third-party disclosure",
        blocks: [
          { type: "paragraph", text: "GLEAP does not provide personal information to third parties unless the data subject has separately consented or disclosure is permitted by law. If disclosure becomes necessary, GLEAP will provide advance notice of the recipient, purpose, information involved, retention period and the right to refuse." },
        ],
      },
      {
        heading: "5. Processors and cloud services",
        blocks: [
          { type: "table", headers: ["Provider", "Service", "Scope"], rows: [["Vercel Inc.", "Hosting, deployment, security and server logs; administrator image storage when enabled", "Request data, access/error logs and uploaded images"], ["Neon, Inc.", "PostgreSQL database hosting", "Accounts, profiles, community and operational records"]] },
          { type: "paragraph", text: "Authentication is handled on GLEAP servers using Better Auth software, while account and session information is stored in the Neon database described above. No separate email delivery provider is currently connected to production. Before Gmail, Resend or another provider is activated, the processor and international-transfer sections of this policy will be updated." },
        ],
      },
      {
        heading: "6. International processing",
        blocks: [
          { type: "paragraph", text: "Vercel and Neon are global cloud providers based outside Korea. During service operation, the information described in the processor table may therefore be transmitted over encrypted networks and processed on overseas servers. Transfer occurs continuously over the network while the service is used, and retention lasts for the periods stated in Section 2 or until the applicable service contract ends." },
          { type: "callout", text: "The operators must confirm the actual data-storage country and region, as well as the legal basis for international transfer under Korean privacy law, in the Vercel and Neon consoles and contracts. Before a region or processor changes, this policy will be revised and any required notice or consent process will be completed." },
        ],
      },
      {
        heading: "7. Cookies and analytics",
        blocks: [
          { type: "list", items: ["An essential gleap_session cookie is used for administrator authentication, and an essential member session cookie is used for member sign-in.", "Blocking essential cookies may prevent sign-in.", "The current code does not include advertising cookies or third-party behavioral analytics.", "Vercel may process platform access and error logs for security and reliability."] },
        ],
      },
      {
        heading: "8. Your rights",
        blocks: [
          { type: "paragraph", text: `You or your lawful representative may request access, correction, deletion, restriction of processing, withdrawal of consent or account deletion at ${CONTACT_EMAIL}. GLEAP may request the minimum information needed to verify identity and will process the request without undue delay in accordance with applicable law.` },
          { type: "paragraph", text: "When removal of a publicly displayed name, photograph or email address is requested, GLEAP will first remove it from the public page. The information may remain in backups or caches for a short period when technically necessary." },
        ],
      },
      {
        heading: "9. Deletion and safeguards",
        blocks: [
          { type: "list", items: ["Personal information is deleted without undue delay and in a manner that makes recovery difficult when its purpose has been achieved or its retention period ends.", "Account and administrative privileges are limited to the minimum number of people, and the administrator and member areas are separated.", "GLEAP uses HTTPS, one-way password hashing, protected session cookies and access-record reviews.", "Printed documents and separate consent forms, if any, are kept in a locked location and shredded when their retention period ends."] },
        ],
      },
      {
        heading: "10. Remedies and inquiries",
        blocks: [
          { type: "list", items: [`GLEAP privacy contact: ${CONTACT_EMAIL}`, "Privacy Infringement Report Center: 118 (without an area code in Korea)", "Personal Information Dispute Mediation Committee: 1833-6972"] },
        ],
      },
      {
        heading: "11. Effective date and revision history",
        blocks: [
          { type: "paragraph", text: `First effective date: ${EFFECTIVE_DATE_EN}` },
          { type: "paragraph", text: `Revision history: Beta policy adopted on ${EFFECTIVE_DATE_EN}` },
          { type: "paragraph", text: "Material changes will be announced on the website before they take effect. Previous versions will be retained by the operators and made available upon request." },
        ],
      },
    ],
    references: ko.privacy.references,
    related: ["member-consent", "terms"],
  },
  terms: {
    title: "Terms of Use",
    eyebrow: "Terms of Use",
    summary: "These terms explain the conditions for using the GLEAP public website and member-only services.",
    effectiveDate: EFFECTIVE_DATE_EN,
    status: "Beta terms",
    sections: [
      { heading: "1. Purpose and scope", blocks: [{ type: "paragraph", text: "These terms set out the rights, responsibilities and operating standards that apply to the official website and member-only services operated by SNU College of Natural Sciences GLEAP." }] },
      { heading: "2. Membership and accounts", blocks: [{ type: "list", items: ["Only GLEAP members approved by the operators may register for and use the member area.", "Members must provide accurate information and keep their passwords and accounts secure.", "Account transfers or sharing, impersonation and unauthorized access are prohibited.", "Members may edit optional profile information and request account withdrawal from the operators."] }] },
      { heading: "3. Service use and prohibited conduct", blocks: [{ type: "list", items: ["Conduct that violates law, another person's rights or GLEAP's operating purpose", "Collecting, publishing or forwarding personal information or non-public material without authorization", "Malware, automated attacks, unauthorized scraping or other conduct that harms service stability", "Posting false, insulting, discriminatory, harassing, unlawful or rights-infringing content"] }, { type: "paragraph", text: "The operators may temporarily hide or remove violating content and, where necessary, restrict an account. Unless the matter is urgent, the reason and a way to raise an objection will be provided." }] },
      { heading: "4. Posts and intellectual property", blocks: [{ type: "paragraph", text: "Members generally retain the rights in the content they create. Members grant GLEAP permission to use that content only to the extent needed to operate, display and back up the service. Before posting another person's photograph, writing, logo or other material, the member must confirm that all necessary rights and consents have been secured." }] },
      { heading: "5. Changes, suspension and liability", blocks: [{ type: "paragraph", text: "GLEAP may change or suspend part of the service for security, maintenance or operational reasons and will provide advance notice when practical. To the extent permitted by law, GLEAP limits its liability for loss caused by natural disasters, failures of external services or circumstances attributable to the member, unless GLEAP acted intentionally or with gross negligence." }] },
      { heading: "6. Withdrawal and restrictions", blocks: [{ type: "paragraph", text: `Requests and objections concerning withdrawal, account deletion or restrictions may be sent to ${CONTACT_EMAIL}. Even after account deletion, information that must be retained by law and limited portions of posts already shared with other members may be kept where necessary.` }] },
      { heading: "7. Changes to the terms and governing law", blocks: [{ type: "paragraph", text: `Effective date: ${EFFECTIVE_DATE_EN}` }, { type: "paragraph", text: "When these terms change, the effective date and reason for the change will be announced on the website. These terms are governed by the laws of the Republic of Korea, and the parties will first seek to resolve any dispute through good-faith discussion." }] },
    ],
    related: ["privacy", "copyright"],
  },
  "email-rejection": {
    title: "No Unauthorized Email Collection",
    eyebrow: "Email Collection Policy",
    summary: "Email addresses published on this website may not be collected or reused without authorization.",
    effectiveDate: EFFECTIVE_DATE_EN,
    status: "Notice",
    sections: [
      { heading: "Email address use", blocks: [{ type: "paragraph", text: "Do not collect email addresses displayed on this website using automated programs or other technical means without prior permission from GLEAP." }, { type: "list", items: ["Do not use published addresses for advertising, resale or list building.", "Use personal member addresses only for legitimate contact consistent with their publication purpose.", "Unauthorized collection or use may result in liability under applicable law."] }, { type: "paragraph", text: `Contact: ${CONTACT_EMAIL}` }] },
    ],
    related: ["privacy", "terms"],
  },
  copyright: {
    title: "Copyright Notice",
    eyebrow: "Copyright Notice",
    summary: "This notice explains rights and permitted use of text, photographs, logos and other material on the GLEAP website.",
    effectiveDate: EFFECTIVE_DATE_EN,
    status: "Beta notice",
    sections: [
      { heading: "1. Ownership", blocks: [{ type: "paragraph", text: "Rights in GLEAP-created writing, editing and design belong to GLEAP or the relevant creator. The © 2026 GLEAP notice does not transfer rights in third-party photographs, writing or logos to GLEAP." }] },
      { heading: "2. Photographs and images of people", blocks: [{ type: "list", items: ["Before a photograph is posted, confirm both the photographer's copyright permission and the depicted person's consent to publication.", "When an identifiable minor appears, explain the purpose, publication scope and duration and obtain the legal guardian's consent when required.", "Consent to participate in an event does not automatically authorize every promotional or derivative use, so the medium, duration and permitted editing must be recorded specifically.", "Requests to remove material or stop its use may be sent to the operators' email address."] }] },
      { heading: "3. Logos, trademarks and fonts", blocks: [{ type: "paragraph", text: "GLEAP and Seoul National University names and logos must be used in accordance with the respective rights holders' rules and may not be used in a way that falsely suggests an official affiliation or endorsement. The website uses Pretendard and follows the license included with its distribution." }] },
      { heading: "4. Use of content", blocks: [{ type: "paragraph", text: "Apart from personal viewing and sharing attributed links, advance permission is required to reproduce, redistribute, modify or commercially use the content, or to create a dataset from it. If a specific item displays a separate license or source notice, that notice takes precedence." }, { type: "paragraph", text: `Permission requests and infringement reports: ${CONTACT_EMAIL}` }] },
      { heading: "5. Recommended rights records", blocks: [{ type: "list", items: ["File name, photographer or creator, date of capture or creation, and rights holder contact", "Authorized media, purpose, territory, duration and editing scope", "Consent status of people shown and, for minors, the legal guardian's consent status", "The original license or purchase record for fonts, icons and external material"] }] },
    ],
    references: ko.copyright.references,
    related: ["member-consent", "terms"],
  },
  "member-consent": {
    title: "Member Information & Photo Consent Form",
    eyebrow: "Operational Consent Form",
    summary: "A beta form for confirming publication permission before member profiles and event photos are posted. This page itself does not submit or store information.",
    effectiveDate: EFFECTIVE_DATE_EN,
    status: "Operational template · Print or copy this form and store signed records separately.",
    sections: [
      { heading: "1. Person", blocks: [{ type: "list", items: ["Name: ____________________", "Cohort / affiliation: ____________________", "Contact email: ____________________", "Guardian, if required: ____________________"] }] },
      { heading: "2. Information you consent to publish", blocks: [{ type: "list", items: ["□ Name  □ Photo  □ Department / major  □ Cohort  □ Role", "□ Email  □ Social or personal links  □ Activity, award or introduction text", "□ Event group photo  □ Event video  □ Other: ____________________"] }] },
      { heading: "3. Purpose, medium and duration", blocks: [{ type: "list", items: ["Purpose: introduce GLEAP members and official activities, preserve event records and support promotion", "Medium: the GLEAP official website and social-media preview cards generated from that website", "Duration: □ active term  □ ____ years after graduation or term  □ until withdrawal  □ other: __________", "Publication scope: publicly accessible to internet users and may temporarily remain in search-engine results and caches"] }] },
      { heading: "4. Photograph rights confirmation", blocks: [{ type: "list", items: ["□ Permission to publish and edit the photograph on the website has been obtained from the photographer or copyright owner.", "□ Identifiable people in the photograph were informed of the purpose, medium and duration.", "□ Any required legal guardian consent for minors has been confirmed.", "Photographer or rights holder and basis of permission: ________________________________"] }] },
      { heading: "5. Withdrawal", blocks: [{ type: "paragraph", text: `Consent is optional. You may withdraw it or request a change to the publication scope at any time by emailing ${CONTACT_EMAIL}. Withdrawal does not affect lawful use that occurred before it, and GLEAP will remove the information from the public page without undue delay. Search-engine caches and lawful copies held by third parties may take additional time to update.` }] },
      { heading: "6. Signature", blocks: [{ type: "paragraph", text: "I have read and understood the information above and consent to publication of the items I selected." }, { type: "list", items: ["Date of consent: ____ / ____ / ______", "Member name and signature: ________________________________", "Legal guardian name and signature, if applicable: ________________________________", "Verified by GLEAP: ________________________________"] }] },
    ],
    related: ["privacy", "copyright"],
  },
};

export function getLegalDocument(locale: string, key: LegalDocumentKey) {
  return (locale === "en" ? en : ko)[key];
}

export function isLegalDocumentKey(value: string): value is LegalDocumentKey {
  return legalDocumentKeys.includes(value as LegalDocumentKey);
}

export function getLegalTitle(locale: string, key: LegalDocumentKey) {
  return getLegalDocument(locale, key).title;
}

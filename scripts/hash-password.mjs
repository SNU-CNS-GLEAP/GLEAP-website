// 관리자(글 작성) 비밀번호의 bcrypt 해시를 만든다.
//
// 이 사이트의 관리자 계정은 DB에 없다 — `ADMIN_PASSWORD_HASH` 환경변수에 들어있는
// 해시 하나가 계정의 전부다(CLAUDE.md "관리자 인증" 절). 그래서 비밀번호 교체 =
// 이 해시를 새로 만들어 환경변수를 바꾸는 것이고, 그 해시를 만드는 게 이 스크립트다.
//
// 사용법:
//   npm run admin:hash
//
// 비밀번호는 화면에 찍히지 않고, 파일로도 저장되지 않는다. 명령줄 인자로도 받지
// 않는다 — 인자로 주면 셸 히스토리(.bash_history 등)와 실행 중인 프로세스 목록에
// 그대로 남기 때문이다. 오직 이 프롬프트에 직접 입력하는 방법만 있다.

import bcrypt from "bcryptjs";

// bcrypt 비용 계수. 값을 1 올리면 해시 계산 시간이 2배가 된다. 12면 서버에서
// 한 번 검증하는 데 수백 ms 수준으로, 로그인 폼에는 체감이 없고 무차별 대입에는
// 충분히 비싸다. 이 값을 바꿔도 기존 해시는 그대로 동작한다 — bcrypt 해시 문자열
// 안에 자기 비용 계수가 들어있어서 `compare()`가 알아서 읽는다.
const COST = 12;

// 관리자 비밀번호는 사이트 운영 전체를 여는 단 하나의 자격증명이고, 자주 입력하는
// 것도 아니다. 길이를 짧게 할 이유가 없어서 최소치를 넉넉히 잡았다.
const MIN_LENGTH = 12;

/** 입력을 화면에 표시하지 않고 한 줄 읽는다. */
function readHidden(prompt) {
  return new Promise((resolve, reject) => {
    const { stdin, stdout } = process;

    if (!stdin.isTTY) {
      reject(
        new Error(
          "터미널에서 직접 실행해야 합니다. (비밀번호를 가려서 입력받으려면 TTY가 필요함)",
        ),
      );
      return;
    }

    stdout.write(prompt);
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");

    let value = "";

    const finish = (callback) => {
      stdin.setRawMode(false);
      stdin.pause();
      stdin.removeListener("data", onData);
      stdout.write("\n");
      callback();
    };

    // raw 모드에서는 붙여넣기 등으로 여러 글자가 한 번에 들어올 수 있어 청크 단위로 훑는다.
    const onData = (chunk) => {
      for (const char of chunk) {
        if (char === "\r" || char === "\n" || char === "") {
          finish(() => resolve(value));
          return;
        }
        if (char === "") {
          // Ctrl+C
          finish(() => process.exit(130));
          return;
        }
        if (char === "" || char === "\b") {
          value = value.slice(0, -1);
          continue;
        }
        // 그 외 제어문자(화살표 키 등)는 버리고 실제 글자만 받는다.
        if (char >= " ") value += char;
      }
    };

    stdin.on("data", onData);
  });
}

async function main() {
  console.log("");
  console.log("관리자 비밀번호 해시 생성");
  console.log("입력한 비밀번호는 화면에 보이지 않고 어디에도 저장되지 않습니다.");
  console.log("");

  const password = await readHidden("새 비밀번호: ");

  if (password.length < MIN_LENGTH) {
    console.error(`\n[중단] 비밀번호가 너무 짧습니다. 최소 ${MIN_LENGTH}자 이상으로 정하세요.`);
    process.exit(1);
  }

  const confirmation = await readHidden("한 번 더 입력: ");

  if (password !== confirmation) {
    console.error("\n[중단] 두 입력이 서로 다릅니다. 처음부터 다시 실행하세요.");
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, COST);

  // 만들어진 해시가 정말 그 비밀번호로 열리는지 확인하고 넘긴다. 인코딩 문제 등으로
  // 엉뚱한 해시가 나왔는데 그걸 그대로 배포해서 로그인이 막히는 상황을 막기 위함.
  if (!(await bcrypt.compare(password, hash))) {
    console.error("\n[중단] 생성된 해시 검증에 실패했습니다. 배포하지 마세요.");
    process.exit(1);
  }

  console.log("");
  console.log("해시 생성 완료 (검증까지 통과)");
  console.log("");
  console.log("--- Vercel 대시보드에 넣을 값 (ADMIN_PASSWORD_HASH) ---");
  console.log(hash);
  console.log("");
  // CLAUDE.md "환경변수" 절 참고: Next.js가 로컬 .env.local을 읽을 때 dotenv-expand가
  // `$2b`, `$12` 같은 부분을 변수 참조로 오인해 잘라먹는다. 그래서 로컬 파일에 넣을
  // 때만 `$`를 이스케이프해야 한다. Vercel은 값을 직접 주입하므로 해당 없음.
  console.log("--- .env.local에 넣을 값 ($ 이스케이프됨, 로컬 전용) ---");
  console.log(`ADMIN_PASSWORD_HASH="${hash.replaceAll("$", "\\$")}"`);
  console.log("");
  console.log("다음 순서로 적용하세요:");
  console.log("  1. Vercel > 프로젝트 > Settings > Environment Variables에서");
  console.log("     ADMIN_PASSWORD_HASH를 위 첫 번째 값으로 교체 (Production)");
  console.log("  2. Redeploy (환경변수는 재배포해야 반영됩니다)");
  console.log("  3. 배포된 사이트의 /ko/write/login에서 새 비밀번호로 로그인 확인");
  console.log("  4. 팀 볼트(Bitwarden 등)의 비밀번호도 갱신");
  console.log("");
  console.log("이 해시는 비밀이 아니지만(비밀번호를 되돌릴 수 없음) 굳이 공개할 이유도");
  console.log("없습니다. 커밋하지 마세요 — .env.local은 이미 .gitignore에 있습니다.");
  console.log("");
}

main().catch((error) => {
  console.error(`\n오류: ${error.message}`);
  process.exit(1);
});

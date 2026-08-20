"use client";

import { createAuthClient } from "better-auth/react";

// 같은 GLEAP 도메인의 /api/auth 경로를 사용하므로 URL을 브라우저 코드에 따로 넣지 않는다.
export const memberAuthClient = createAuthClient();

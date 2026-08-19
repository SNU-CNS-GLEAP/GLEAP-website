import { memberAuth } from "@/lib/member-auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(memberAuth);

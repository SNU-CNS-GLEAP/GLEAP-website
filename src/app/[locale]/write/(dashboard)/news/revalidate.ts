import { revalidatePath } from "next/cache";
import { routing } from "@/i18n/routing";

export function revalidateNewsPages(postId: number) {
  for (const locale of routing.locales) {
    revalidatePath(`/${locale}`);
    revalidatePath(`/${locale}/news`);
    revalidatePath(`/${locale}/news/${postId}`);
  }

  revalidatePath("/[locale]/activities/[category]", "page");
}

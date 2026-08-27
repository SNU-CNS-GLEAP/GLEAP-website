import { PostEditor } from "./PostEditor";
import { CsrfField } from "@/components/CsrfField";

type Props = {
  action: (formData: FormData) => void;
  types: string[];
  submitLabel: string;
  errorMessage?: string;
  defaultValues?: {
    type?: string;
    titleKo?: string;
    titleEn?: string;
    bodyKo?: string;
    bodyEn?: string;
    authorName?: string;
    publishedAt?: string;
  };
};

function todayDateString() {
  return new Date().toISOString().slice(0, 10);
}

export function PostForm({ action, types, submitLabel, errorMessage, defaultValues = {} }: Props) {
  return (
    <>
      {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
      <form action={action} className="flex flex-col gap-6">
        <CsrfField />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium" htmlFor="type">
            분류
          </label>
          <input
            id="type"
            name="type"
            list="post-types"
            required
            defaultValue={defaultValues.type}
            placeholder="예: 공지사항"
            className="w-fit rounded border border-border px-3 py-2 text-sm"
          />
          <datalist id="post-types">
            {types.map((t) => (
              <option key={t} value={t} />
            ))}
          </datalist>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium" htmlFor="title_ko">
            제목 (한국어)
          </label>
          <input
            id="title_ko"
            name="title_ko"
            required
            defaultValue={defaultValues.titleKo}
            className="rounded border border-border px-3 py-2 text-sm"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium" htmlFor="title_en">
            제목 (English, 선택)
          </label>
          <input
            id="title_en"
            name="title_en"
            defaultValue={defaultValues.titleEn}
            className="rounded border border-border px-3 py-2 text-sm"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">본문 (한국어)</label>
          <PostEditor name="body_ko" defaultValue={defaultValues.bodyKo} />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">본문 (English, 선택)</label>
          <PostEditor name="body_en" defaultValue={defaultValues.bodyEn} />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium" htmlFor="author_name">
            작성자 표시명 (선택)
          </label>
          <input
            id="author_name"
            name="author_name"
            defaultValue={defaultValues.authorName}
            className="w-fit rounded border border-border px-3 py-2 text-sm"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium" htmlFor="published_at">
            게시일
          </label>
          <input
            id="published_at"
            name="published_at"
            type="date"
            required
            defaultValue={defaultValues.publishedAt ?? todayDateString()}
            className="w-fit rounded border border-border px-3 py-2 text-sm"
          />
        </div>

        <button
          type="submit"
          className="w-fit rounded bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          {submitLabel}
        </button>
      </form>
    </>
  );
}

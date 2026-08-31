"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useEditor, useEditorState, EditorContent, type Editor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Image as TiptapImage } from "@tiptap/extension-image";
import { Placeholder } from "@tiptap/extension-placeholder";
import { Markdown } from "@tiptap/markdown";
import { parseImageSrc, withImageWidth } from "@/lib/image-width";

// 허용 확장은 CLAUDE.md "에디터 / 본문 저장 형식" 절의 결정을 그대로 따름:
// 문단·제목(H2~H4)·목록·강조(굵게/기울임)·링크·이미지·인용문만 허용. 코드/수평선/밑줄/취소선은
// 폰트·색상·정렬류는 아니지만 문서에 명시된 허용 목록 밖이라 의도적으로 뺐음
// (필요해지면 이 컴포넌트와 CLAUDE.md를 같이 갱신할 것).

// 자유 드래그 리사이즈(TiptapImage의 resize 옵션)는 켜지 않음: Markdown에는 크기를 담을 문법이
// 없어서 폭을 %로만 다루고(비율 고정, 높이는 auto), Blob URL의 ?w= 쿼리에 실어 저장한다.
// 저장/공개 렌더링 쪽은 src/lib/image-width.ts + news/[id]/page.tsx를 같이 볼 것.
const ResizableImage = TiptapImage.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      widthPercent: {
        default: null,
        parseHTML: (element: HTMLElement) => {
          const value = element.getAttribute("data-width-percent");
          return value ? Number(value) : null;
        },
        renderHTML: (attributes: { widthPercent?: number | null }) => {
          if (!attributes.widthPercent) return {};
          return {
            "data-width-percent": attributes.widthPercent,
            style: `width: ${attributes.widthPercent}%; height: auto;`,
          };
        },
      },
    };
  },
  parseMarkdown: (token, helpers) => {
    const { src, widthPercent } = parseImageSrc(token.href ?? "");
    return helpers.createNode("image", {
      src,
      alt: token.text,
      title: token.title,
      widthPercent,
    });
  },
  renderMarkdown: (node) => {
    const alt = node.attrs?.alt ?? "";
    const title = node.attrs?.title ?? "";
    const src = withImageWidth(node.attrs?.src ?? "", node.attrs?.widthPercent);
    return title ? `![${alt}](${src} "${title}")` : `![${alt}](${src})`;
  },
});

type Props = {
  name: string;
  defaultValue?: string;
  placeholder?: string;
};

export function PostEditor({ name, defaultValue = "", placeholder }: Props) {
  const t = useTranslations("AdminArea");
  const [markdown, setMarkdown] = useState(defaultValue);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        code: false,
        codeBlock: false,
        horizontalRule: false,
        strike: false,
        underline: false,
        link: {
          openOnClick: false,
          autolink: true,
          defaultProtocol: "https",
          HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
        },
      }),
      ResizableImage,
      Placeholder.configure({ placeholder: placeholder ?? t("editorPlaceholder") }),
      Markdown,
    ],
    content: defaultValue,
    contentType: "markdown",
    onUpdate: ({ editor }) => {
      setMarkdown(editor.getMarkdown());
    },
    editorProps: {
      attributes: {
        class:
          "min-h-[300px] rounded-b border border-t-0 border-border px-3 py-2 text-sm leading-relaxed focus:outline-none [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-primary [&_a]:underline [&_img]:max-w-full [&_img]:rounded [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:text-base [&_h3]:font-semibold [&_h4]:font-semibold [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:text-muted",
      },
    },
  });

  if (!editor) return null;

  return (
    <div className="flex flex-col">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
      <input type="hidden" name={name} value={markdown} readOnly />
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const t = useTranslations("AdminArea");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  // isActive()/getAttributes()는 그 순간의 스냅샷이라, 여기서 직접 읽으면 "커서 이동/이미지
  // 선택"처럼 문서 내용은 안 바뀌고 선택 상태만 바뀌는 경우엔 리렌더가 안 일어나 버튼이
  // 갱신되지 않는다(예: 이미지를 다시 클릭해도 폭 % 버튼이 안 뜨던 버그). useEditorState는
  // 선택 변경을 포함한 모든 트랜잭션을 구독해서 값이 바뀔 때만 리렌더시켜준다.
  const toolbarState = useEditorState({
    editor,
    selector: ({ editor }) => ({
      isHeading2: editor.isActive("heading", { level: 2 }),
      isHeading3: editor.isActive("heading", { level: 3 }),
      isHeading4: editor.isActive("heading", { level: 4 }),
      isBold: editor.isActive("bold"),
      isItalic: editor.isActive("italic"),
      isBulletList: editor.isActive("bulletList"),
      isOrderedList: editor.isActive("orderedList"),
      isBlockquote: editor.isActive("blockquote"),
      isLink: editor.isActive("link"),
      isImage: editor.isActive("image"),
      imageWidthPercent: (editor.getAttributes("image").widthPercent as number | null) ?? 100,
    }),
  });

  function promptLink() {
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt(t("linkPrompt"), previousUrl ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/write/upload", { method: "POST", body: formData });
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: t("uploadFailed") }));
        window.alert(t("uploadFailedDetail", { error: error ?? res.statusText }));
        return;
      }
      const { url } = (await res.json()) as { url: string };
      editor.chain().focus().setImage({ src: url }).run();
    } catch {
      window.alert(t("uploadFailedDetail", { error: t("networkError") }));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-1 rounded-t border border-border bg-surface p-1">
      <ToolbarButton active={toolbarState.isHeading2} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
        {t("heading2")}
      </ToolbarButton>
      <ToolbarButton active={toolbarState.isHeading3} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
        {t("heading3")}
      </ToolbarButton>
      <ToolbarButton active={toolbarState.isHeading4} onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}>
        {t("heading4")}
      </ToolbarButton>
      <Divider />
      <ToolbarButton active={toolbarState.isBold} onClick={() => editor.chain().focus().toggleBold().run()}>
        {t("bold")}
      </ToolbarButton>
      <ToolbarButton active={toolbarState.isItalic} onClick={() => editor.chain().focus().toggleItalic().run()}>
        {t("italic")}
      </ToolbarButton>
      <Divider />
      <ToolbarButton active={toolbarState.isBulletList} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        {t("bulletList")}
      </ToolbarButton>
      <ToolbarButton active={toolbarState.isOrderedList} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        {t("orderedList")}
      </ToolbarButton>
      <ToolbarButton active={toolbarState.isBlockquote} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        {t("blockquote")}
      </ToolbarButton>
      <Divider />
      <ToolbarButton active={toolbarState.isLink} onClick={promptLink}>
        {t("link")}
      </ToolbarButton>
      <ToolbarButton onClick={() => fileInputRef.current?.click()} disabled={uploading}>
        {uploading ? t("uploading") : t("image")}
      </ToolbarButton>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelected}
      />
      {toolbarState.isImage && (
        <>
          <Divider />
          <span className="self-center px-1 text-xs text-muted">{t("selectedImageWidth")}</span>
          {[25, 50, 75, 100].map((pct) => (
            <ToolbarButton
              key={pct}
              active={toolbarState.imageWidthPercent === pct}
              onClick={() =>
                editor
                  .chain()
                  .focus()
                  .updateAttributes("image", { widthPercent: pct === 100 ? null : pct })
                  .run()
              }
            >
              {pct}%
            </ToolbarButton>
          ))}
        </>
      )}
    </div>
  );
}

function ToolbarButton({
  children,
  onClick,
  active,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded px-2 py-1 text-xs font-medium disabled:opacity-50 ${
        active ? "bg-primary text-white" : "text-foreground hover:bg-background"
      }`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="mx-1 w-px bg-border" />;
}

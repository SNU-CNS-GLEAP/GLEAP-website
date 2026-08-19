"use client";

import { useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Image as TiptapImage } from "@tiptap/extension-image";
import { Placeholder } from "@tiptap/extension-placeholder";
import { Markdown } from "@tiptap/markdown";

// 허용 확장은 CLAUDE.md "에디터 / 본문 저장 형식" 절의 결정을 그대로 따름:
// 문단·제목(H2~H4)·목록·강조(굵게/기울임)·링크·이미지·인용문만 허용. 코드/수평선/밑줄/취소선은
// 폰트·색상·정렬류는 아니지만 문서에 명시된 허용 목록 밖이라 의도적으로 뺐음
// (필요해지면 이 컴포넌트와 CLAUDE.md를 같이 갱신할 것).
type Props = {
  name: string;
  defaultValue?: string;
  placeholder?: string;
};

export function PostEditor({ name, defaultValue = "", placeholder = "내용을 입력하세요..." }: Props) {
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
      TiptapImage,
      Placeholder.configure({ placeholder }),
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
  function promptLink() {
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("링크 URL", previousUrl ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  function promptImage() {
    const url = window.prompt("이미지 URL");
    if (!url) return;
    editor.chain().focus().setImage({ src: url }).run();
  }

  return (
    <div className="flex flex-wrap gap-1 rounded-t border border-border bg-surface p-1">
      <ToolbarButton active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
        제목1
      </ToolbarButton>
      <ToolbarButton active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
        제목2
      </ToolbarButton>
      <ToolbarButton active={editor.isActive("heading", { level: 4 })} onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}>
        제목3
      </ToolbarButton>
      <Divider />
      <ToolbarButton active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
        굵게
      </ToolbarButton>
      <ToolbarButton active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
        기울임
      </ToolbarButton>
      <Divider />
      <ToolbarButton active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        목록
      </ToolbarButton>
      <ToolbarButton active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        번호 목록
      </ToolbarButton>
      <ToolbarButton active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        인용문
      </ToolbarButton>
      <Divider />
      <ToolbarButton active={editor.isActive("link")} onClick={promptLink}>
        링크
      </ToolbarButton>
      <ToolbarButton onClick={promptImage}>이미지</ToolbarButton>
    </div>
  );
}

function ToolbarButton({
  children,
  onClick,
  active,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded px-2 py-1 text-xs font-medium ${
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

import { useEffect } from 'react';
import { EditorContent, JSONContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { cn } from '@/lib/utils';

import './style.css';

interface EditorViewerProps {
  content: JSONContent | null | undefined;
  className?: string;
}

/**
 * 포스트 내용을 뷰어 모드로 표시하는 컴포넌트
 * @param content - 표시할 포스트 내용
 * @param className - 뷰어 영역에 적용할 추가 스타일
 * @returns 포스트 내용을 뷰어 모드로 표시하는 컴포넌트
 */
export function Viewer({ content, className }: EditorViewerProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit
    ],
    content: content ?? { type: 'doc', content: [] },
    // 읽기 전용 모드
    editable: false,
    editorProps: {
      attributes: {
        class: 'editor-content editor-content--viewer',
      },
    }
  });

  // 콘텐츠 변경 시 에디터 상태 업데이트
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    const nextContent = content ?? { type: 'doc', content: [] };
    editor.commands.setContent(nextContent, { emitUpdate: false });
  }, [editor, content]);

  // 에디터 컴포넌트 소멸 시 리소스 해제
  useEffect(() => {
    return () => {
      editor?.destroy();
    };
  }, [editor]);

  // 에디터 컴포넌트가 소멸되었거나 초기화되지 않은 경우 null 반환
  if (!editor) return null;

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col overflow-hidden w-full", className)}>
      <EditorContent editor={editor} className="editor-content editor-content--viewer" />
    </div>
  );
}
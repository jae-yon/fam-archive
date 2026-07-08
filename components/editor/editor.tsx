"use client";

import { cn } from '@/lib/utils';
import { useEffect } from 'react';
import StarterKit from '@tiptap/starter-kit';
import { EditorContent, JSONContent, useEditor } from '@tiptap/react';

import { Toolbar } from '@/components/editor/toolbar';

import './style.css';

interface EditorProps {
  content?: JSONContent;
  onUpdate?: (content: JSONContent, contentText: string) => void;
  className?: string;
}


export function Editor({ content, onUpdate, className }: EditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit
    ],
    content: content ?? { type: 'doc', content: [] },
    // 콘텐츠 변경 시 콜백 함수 호출
    onUpdate: ({ editor }) => {
      if (onUpdate) {
        try {
          // codeBlock 등 일부 노드가 DOM 참조를 포함할 수 있어 Server Action 전달 전 직렬화
          const json = JSON.parse(JSON.stringify(editor.getJSON()));
          const text = editor.getText();
          onUpdate(json, text);
        } catch (error) {
          console.error('Editor update failed:', error);
        }
      }
    },
    editorProps: {
      attributes: {
        class: 'text-sm font-medium text-gray-800',
      },
      handleKeyDown: (view, event) => {
        // Tab 키 처리
        if (event.key === 'Tab') {
          const { state } = view;
          const { $from } = state.selection;
          
          // 리스트 항목 내부에 있는지 확인
          let isInListItem = false;
          for (let depth = $from.depth; depth > 0; depth--) {
            const node = $from.node(depth);
            if (node.type.name === 'listItem') {
              isInListItem = true;
              break;
            }
          }
          
          // 리스트 항목 내부에 있으면 TipTap의 기본 동작 허용 (들여쓰기/내어쓰기)
          if (isInListItem) {
            // 기본 동작 허용
            return false;
          }
          
          // 코드블럭 내부에 있는지 확인
          let isInCodeBlock = false;
          for (let depth = $from.depth; depth > 0; depth--) {
            const node = $from.node(depth);
            if (node.type.name === 'codeBlock') {
              isInCodeBlock = true;
              break;
            }
          }
          
          // 코드블럭 내부에 있으면 공백 삽입
          if (isInCodeBlock) {
            event.preventDefault();
            const { dispatch } = view;
            const { selection } = state;
            const tr = state.tr.insertText('  ', selection.from, selection.to);
            dispatch(tr);
            return true;
          }
          
          // 일반 텍스트에서는 공백 2개 삽입 (기본 동작 방지)
          event.preventDefault();
          const { dispatch } = view;
          const { selection } = state;
          const tr = state.tr.insertText('  ', selection.from, selection.to);
          dispatch(tr);
          return true;
        }
        
        // 다른 키는 기본 동작 허용
        return false;
      }
    }
  });

  useEffect(() => {
    if (!editor || editor.isDestroyed) return;

    if (editor.isFocused) return;

    const newContent = content ?? { type: 'doc', content: [] };

    const editorContent = editor.getJSON();

    if (JSON.stringify(editorContent) !== JSON.stringify(newContent)) {
      queueMicrotask(() => {
        editor.commands.setContent(newContent, {
          emitUpdate: false,
        });
      });
    }
  }, [editor, content]);

  useEffect(() => {
    return () => {
      editor?.destroy();
    };
  }, [editor]);

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col overflow-hidden w-full", className)}>
      <Toolbar editor={editor} />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <EditorContent editor={editor} className="editor-content" />
      </div>
    </div>
  );
}
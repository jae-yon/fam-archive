import { useCallback, useEffect, useState } from 'react';
import { Editor } from '@tiptap/react';
import { BoldIcon, CodeIcon, ItalicIcon, MinusIcon, QuoteIcon, SquareCodeIcon, StrikethroughIcon, UnderlineIcon } from 'lucide-react';

interface ToolBarProps {
  editor: Editor | null;
}

export function Toolbar({ editor }: ToolBarProps) {
  const [, forceUpdate] = useState({});

  useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      forceUpdate({});
    };

    editor.on('selectionUpdate', handleUpdate);
    editor.on('transaction', handleUpdate);
    editor.on('focus', handleUpdate);
    editor.on('blur', handleUpdate);

    return () => {
      editor.off('selectionUpdate', handleUpdate);
      editor.off('transaction', handleUpdate);
      editor.off('focus', handleUpdate);
      editor.off('blur', handleUpdate);
    };
  }, [editor]);

  const toggleBold = useCallback(() => {
    editor?.chain().focus().toggleBold().run();
  }, [editor]);

  const toggleItalic = useCallback(() => {
    editor?.chain().focus().toggleItalic().run();
  }, [editor]);

  const toggleUnderline = useCallback(() => {
    editor?.chain().focus().toggleUnderline().run();
  }, [editor]);

  const toggleStrike = useCallback(() => {
    editor?.chain().focus().toggleStrike().run();
  }, [editor]);

  const toggleBlockquote = useCallback(() => {
    editor?.chain().focus().toggleBlockquote().run();
  }, [editor]);

  const insertHorizontalRule = useCallback(() => {
    editor?.chain().focus().setHorizontalRule().run();
  }, [editor]);

  const toggleCode = useCallback(() => {
    editor?.chain().focus().toggleCode().run();
  }, [editor]);

  const toggleCodeBlock = useCallback(() => {
    editor?.chain().focus().toggleCodeBlock().run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="flex flex-wrap md:flex-nowrap gap-1 p-2">
      {/* Bold */}
      <button 
        onClick={toggleBold} title='Bold'
        className={
          `p-2 rounded-lg transiton-all duration-200 ease-in-out
          ${editor.isActive('bold') ? 'bg-zinc-800 text-zinc-100 hover:bg-zinc-800 hover:text-zinc-100' : 'bg-zinc-100 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'}`
        }
      >
        <BoldIcon className='w-4 h-4 stroke-[2.5]' />
      </button>

      {/* Italic */}
      <button 
        onClick={toggleItalic} title='Italic'
        className={
          `p-2 rounded-lg transiton-all duration-200 ease-in-out
          ${editor.isActive('italic') ? 'bg-zinc-800 text-zinc-100 hover:bg-zinc-800 hover:text-zinc-100' : 'bg-zinc-100 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'}`
        }
      >
        <ItalicIcon className='w-4 h-4 stroke-[2.5]' />
      </button>

      {/* Underline */}
      <button 
        onClick={toggleUnderline} title='Underline'
        className={
          `p-2 rounded-lg transiton-all duration-200 ease-in-out
          ${editor.isActive('underline') ? 'bg-zinc-800 text-zinc-100 hover:bg-zinc-800 hover:text-zinc-100' : 'bg-zinc-100 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'}`
        }
      >
        <UnderlineIcon className='w-4 h-4 stroke-[2.5]' />
      </button>

      {/* Strike */}
      <button 
        onClick={toggleStrike} title='Strike'
        className={
          `p-2 rounded-lg transiton-all duration-200 ease-in-out
          ${editor.isActive('strike') ? 'bg-zinc-800 text-zinc-100 hover:bg-zinc-800 hover:text-zinc-100' : 'bg-zinc-100 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'}`
        }
      >
        <StrikethroughIcon className='w-4 h-4 stroke-[2.5]' />
      </button>

      {/* Blockquote */}
      <button 
        onClick={toggleBlockquote} title='Blockquote'
        className={
          `p-2 rounded-lg transiton-all duration-200 ease-in-out
          ${editor.isActive('blockquote') ? 'bg-zinc-800 text-zinc-100 hover:bg-zinc-800 hover:text-zinc-100' : 'bg-zinc-100 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'}`
        }
      >
        <QuoteIcon className='w-4 h-4 stroke-[2.5]' />
      </button>

      {/* Horizontal Rule */}
      <button 
        onClick={insertHorizontalRule} title='Horizontal Rule'
        className={
          `p-2 rounded-lg transiton-all duration-200 ease-in-out
          ${editor.isActive('horizontalRule') ? 'bg-zinc-800 text-zinc-100 hover:bg-zinc-800 hover:text-zinc-100' : 'bg-zinc-100 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'}`
        }
      >
        <MinusIcon className='w-4 h-4 stroke-[2.5]' />
      </button>

      {/* Inline Code */}
      <button 
        onClick={toggleCode} title='Inline Code'
        className={
          `p-2 rounded-lg transiton-all duration-200 ease-in-out
          ${editor.isActive('code') ? 'bg-zinc-800 text-zinc-100 hover:bg-zinc-800 hover:text-zinc-100' : 'bg-zinc-100 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'}`
        }
      >
        <CodeIcon className='w-4 h-4 stroke-[2.5]' />
      </button>

      {/* Code Block */}
      <button 
        onClick={toggleCodeBlock} title='Code Block'
        className={
          `p-2 rounded-lg transiton-all duration-200 ease-in-out
          ${editor.isActive('codeBlock') ? 'bg-zinc-800 text-zinc-100 hover:bg-zinc-800 hover:text-zinc-100' : 'bg-zinc-100 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'}`  
        }
      >
        <SquareCodeIcon className='w-4 h-4 stroke-[2.5]' />
      </button>
    </div>
  );
}
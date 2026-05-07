import React from 'react';
import { type BlockComponentProps } from '../blockTypes';

interface CodeContent { language: string; code: string }

const LANGUAGES = ['javascript', 'typescript', 'python', 'html', 'css', 'json', 'bash', 'sql'];

export function CodeBlock({ content, focused, onChange }: BlockComponentProps<CodeContent>) {
  const { language, code } = content;

  return (
    <div className="w-full rounded-lg overflow-hidden border border-border bg-zinc-950">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800">
        <select
          value={language}
          onChange={e => onChange({ language: e.target.value })}
          className="text-[11px] text-zinc-400 bg-transparent outline-none border-0 cursor-pointer capitalize"
        >
          {LANGUAGES.map(l => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
        <div className="flex gap-1.5">
          <div className="size-2.5 rounded-full bg-zinc-700" />
          <div className="size-2.5 rounded-full bg-zinc-700" />
          <div className="size-2.5 rounded-full bg-zinc-700" />
        </div>
      </div>

      {/* Code textarea */}
      <textarea
        value={code}
        onChange={e => onChange({ code: e.target.value })}
        placeholder={`// ${language} code…`}
        spellCheck={false}
        rows={Math.max(4, code.split('\n').length + 1)}
        className="w-full bg-transparent text-[13px] font-mono text-zinc-300 px-4 py-3 outline-none resize-none leading-relaxed placeholder:text-zinc-600"
      />
    </div>
  );
}

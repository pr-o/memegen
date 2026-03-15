'use client';

import { exportAsPng } from '@/hooks/useStageRef';
import { useEditorStore } from '@/hooks/useEditorStore';

export default function GNB() {
  const { selectLayer } = useEditorStore();

  function handleFinish() {
    selectLayer(null);
    setTimeout(() => exportAsPng('meme.png'), 0);
  }

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-[#2a2a2a] bg-[#1a1a1a] px-4">
      <span className="text-base font-bold tracking-wide text-foreground">
        Meme Generator
      </span>
      <button
        onClick={handleFinish}
        className="rounded-md bg-[#3b82f6] px-5 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-[#2563eb]"
      >
        Finish
      </button>
    </header>
  );
}

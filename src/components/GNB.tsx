'use client';

import Link from 'next/link';
import { exportAsPng, getCanvasDataUrl } from '@/hooks/useStageRef';
import { useEditorStore } from '@/hooks/useEditorStore';

export default function GNB() {
  const { selectLayer, selectedTemplate } = useEditorStore();

  async function handleFinish() {
    selectLayer(null);
    // Give Konva a tick to deselect the transformer before capturing
    await new Promise((r) => setTimeout(r, 0));

    const dataUrl = getCanvasDataUrl();
    if (dataUrl) {
      // Save to gallery in the background
      fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dataUrl,
          templateId: selectedTemplate?.id ?? null,
        }),
      }).catch(() => {/* ignore save errors */});
    }

    exportAsPng('meme.png');
  }

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-[#2a2a2a] bg-[#1a1a1a] px-4">
      <Link href="/" className="text-base font-bold tracking-wide text-foreground hover:text-[#3b82f6] transition-colors">
        Meme Generator
      </Link>
      <button
        onClick={handleFinish}
        className="rounded-md bg-[#3b82f6] px-5 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-[#2563eb]"
      >
        Finish
      </button>
    </header>
  );
}

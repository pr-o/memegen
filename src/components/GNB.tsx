'use client';

import { useState } from 'react';
import Link from 'next/link';
import { exportAsPng, getCanvasDataUrl } from '@/hooks/useStageRef';
import { useEditorStore } from '@/hooks/useEditorStore';
import ShareDialog from '@/components/ShareDialog';

export default function GNB() {
  const { selectLayer, selectedTemplate } = useEditorStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingDataUrl, setPendingDataUrl] = useState<string | null>(null);

  async function handleFinish() {
    selectLayer(null);
    await new Promise((r) => setTimeout(r, 0));

    const dataUrl = getCanvasDataUrl();
    if (!dataUrl) return;

    // Download immediately with template ID suffix if available
    const suffix = selectedTemplate?.id ? `-${selectedTemplate.id}` : '';
    exportAsPng(`meme${suffix}.jpg`);

    // Save to local gallery in the background
    fetch('/api/gallery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dataUrl,
        templateId: selectedTemplate?.id ?? null,
      }),
    }).catch(() => {/* ignore */});

    // Then ask about uploading to cloud
    setPendingDataUrl(dataUrl);
    setDialogOpen(true);
  }

  function handleClose() {
    setDialogOpen(false);
    setPendingDataUrl(null);
  }

  return (
    <>
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

      <ShareDialog
        open={dialogOpen}
        dataUrl={pendingDataUrl}
        onClose={handleClose}
      />
    </>
  );
}

'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { exportAsPng, getCanvasDataUrl } from '@/hooks/useStageRef';
import { useEditorStore } from '@/hooks/useEditorStore';

// ShareDialog statically pulls in firebase/storage + firebase/firestore (hundreds
// of KB) plus the radix Dialog. It's only ever shown after clicking "Finish", so
// keep it out of the synchronous /create bundle and only load its chunk once the
// dialog is first opened.
const ShareDialog = dynamic(() => import('@/components/ShareDialog'), {
  ssr: false,
});

export default function GNB() {
  const { selectLayer, selectedTemplate } = useEditorStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMounted, setDialogMounted] = useState(false);
  const [pendingDataUrl, setPendingDataUrl] = useState<string | null>(null);

  async function handleFinish() {
    selectLayer(null);
    await new Promise((r) => setTimeout(r, 0));

    const dataUrl = getCanvasDataUrl();
    if (!dataUrl) return;

    // Download immediately with template ID suffix if available
    const suffix = selectedTemplate?.id ? `-${selectedTemplate.id}` : '';
    exportAsPng(`meme${suffix}.jpg`);

    // Ask about uploading to cloud — mount the dialog (and load its chunk) lazily
    setPendingDataUrl(dataUrl);
    setDialogMounted(true);
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

      {dialogMounted && (
        <ShareDialog
          open={dialogOpen}
          dataUrl={pendingDataUrl}
          onClose={handleClose}
        />
      )}
    </>
  );
}

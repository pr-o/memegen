'use client';

import { useState } from 'react';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { storage, db } from '@/lib/firebase';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ShareDialogProps {
  open: boolean;
  dataUrl: string | null;
  onClose: () => void;
}

type State = 'idle' | 'uploading' | 'done' | 'error';

export default function ShareDialog({ open, dataUrl, onClose }: ShareDialogProps) {
  const [state, setState] = useState<State>('idle');
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleYes() {
    if (!dataUrl) return;
    setState('uploading');

    try {
      const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
      const storageRef = ref(storage, `memes/${id}.png`);
      await uploadString(storageRef, dataUrl, 'data_url');
      const url = await getDownloadURL(storageRef);
      await addDoc(collection(db, 'memes'), {
        url,
        storagePath: `memes/${id}.png`,
        createdAt: serverTimestamp(),
      });
      setShareUrl(url);
      setState('done');
    } catch {
      setState('error');
    }
  }

  async function handleCopy() {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) handleClose();
  }

  function handleClose() {
    onClose();
    setState('idle');
    setShareUrl(null);
    setCopied(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="border-[#2a2a2a] bg-[#1a1a1a] text-foreground sm:max-w-md">
        {state === 'idle' && (
          <>
            <DialogHeader>
              <DialogTitle>Share your meme?</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Upload to the cloud and get a shareable link.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={handleClose}
                className="border-[#2a2a2a] hover:bg-[#2a2a2a]">
                No
              </Button>
              <Button onClick={handleYes}
                className="bg-[#3b82f6] text-white hover:bg-[#2563eb]">
                Yes, upload &amp; share
              </Button>
            </DialogFooter>
          </>
        )}

        {state === 'uploading' && (
          <DialogHeader>
            <DialogTitle>Uploading…</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Sending your meme to the cloud.
            </DialogDescription>
          </DialogHeader>
        )}

        {state === 'done' && shareUrl && (
          <>
            <DialogHeader>
              <DialogTitle>Meme uploaded!</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Copy the link below to share it.
              </DialogDescription>
            </DialogHeader>
            <div className="rounded-md border border-[#2a2a2a] bg-[#111] px-3 py-2 text-xs text-muted-foreground">
              <span className="break-all">{shareUrl}</span>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button onClick={handleCopy}
                className="bg-[#3b82f6] text-white hover:bg-[#2563eb]">
                {copied ? 'Copied!' : 'Copy link'}
              </Button>
              <Button variant="outline" onClick={handleClose}
                className="border-[#2a2a2a] hover:bg-[#2a2a2a]">
                Close
              </Button>
            </DialogFooter>
          </>
        )}

        {state === 'error' && (
          <>
            <DialogHeader>
              <DialogTitle>Upload failed</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Something went wrong. Please try again.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={handleClose}
                className="border-[#2a2a2a] hover:bg-[#2a2a2a]">
                Close
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

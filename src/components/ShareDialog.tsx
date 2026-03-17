'use client';

import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { storage, db } from '@/lib/firebase';
import { toast } from 'sonner';
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

async function uploadAndShare(dataUrl: string) {
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const storageRef = ref(storage, `memes/${id}.png`);
  await uploadString(storageRef, dataUrl, 'data_url');
  const url = await getDownloadURL(storageRef);
  await addDoc(collection(db, 'memes'), {
    url,
    storagePath: `memes/${id}.png`,
    createdAt: serverTimestamp(),
  });
  return url;
}

export default function ShareDialog({ open, dataUrl, onClose }: ShareDialogProps) {
  async function handleYes() {
    if (!dataUrl) return;
    onClose();

    const toastId = toast.loading('Uploading your meme…');

    try {
      const url = await uploadAndShare(dataUrl);
      toast.success('Meme uploaded!', {
        id: toastId,
        duration: Infinity,
        action: {
          label: 'Copy link',
          onClick: () => navigator.clipboard.writeText(url),
        },
      });
    } catch {
      toast.error('Upload failed. Please try again.', { id: toastId });
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="border-[#2a2a2a] bg-[#1a1a1a] text-foreground sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share your meme?</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Upload to the cloud and get a shareable link.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-[#2a2a2a] hover:bg-[#2a2a2a]"
          >
            No
          </Button>
          <Button
            onClick={handleYes}
            className="bg-[#3b82f6] text-white hover:bg-[#2563eb]"
          >
            Yes, upload &amp; share
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

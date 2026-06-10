'use client';

import dynamic from 'next/dynamic';
import { Spinner } from '@/components/ui/spinner';

const CenterPane = dynamic(() => import('./CenterPane'), {
  ssr: false,
  loading: () => (
    <main className="flex min-h-0 flex-1 flex-col items-center justify-center rounded-xl bg-[#1a1a1a]">
      <Spinner className="h-8 w-8" />
    </main>
  ),
});

export default CenterPane;

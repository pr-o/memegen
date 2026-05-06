'use client';

import dynamic from 'next/dynamic';

const CenterPane = dynamic(() => import('./CenterPane'), {
  ssr: false,
  loading: () => (
    <main className="flex min-h-0 flex-1 flex-col items-center rounded-xl bg-[#1a1a1a]" />
  ),
});

export default CenterPane;

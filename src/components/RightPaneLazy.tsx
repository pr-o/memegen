'use client';

import dynamic from 'next/dynamic';

// RightPane's LayersCard pulls in @dnd-kit and PropertiesCard pulls in react-color.
// Neither is needed for the initial /create view (no layers, no selection yet), so
// keep the whole panel out of the synchronous hydration path and load it async.
const RightPane = dynamic(() => import('./RightPane'), {
  ssr: false,
  loading: () => (
    <>
      <div className="h-32 rounded-xl bg-[#1a1a1a]" />
      <div className="min-h-0 flex-1 rounded-xl bg-[#1a1a1a]" />
    </>
  ),
});

export default RightPane;

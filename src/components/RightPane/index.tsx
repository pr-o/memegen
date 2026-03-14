'use client';

import LayersCard from './LayersCard';
import PropertiesCard from './PropertiesCard';

export default function RightPane() {
  return (
    <aside className="flex w-[260px] shrink-0 flex-col overflow-hidden rounded-xl bg-[#1a1a1a]">
      <LayersCard />
      <div className="border-t border-[#2a2a2a]">
        <PropertiesCard />
      </div>
    </aside>
  );
}

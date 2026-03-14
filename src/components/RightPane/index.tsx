'use client';

import LayersCard from './LayersCard';
import PropertiesCard from './PropertiesCard';

export default function RightPane() {
  return (
    <aside className="flex h-full w-[280px] shrink-0 flex-col overflow-y-auto border-l border-[#2a2a2a] bg-[#1a1a1a]">
      {/* Finish button — implemented in Step 13 */}
      <div className="shrink-0 border-b border-[#2a2a2a] p-3">
        <button className="w-full rounded-md bg-[#3b82f6] py-2 text-sm font-semibold text-white hover:bg-[#2563eb] transition-colors">
          Finish
        </button>
      </div>

      <LayersCard />

      <div className="border-t border-[#2a2a2a]">
        <PropertiesCard />
      </div>
    </aside>
  );
}

'use client';

import LayersCard from './LayersCard';
import PropertiesCard from './PropertiesCard';
import { exportAsPng } from '@/hooks/useStageRef';
import { useEditorStore } from '@/hooks/useEditorStore';

export default function RightPane() {
  const { selectLayer } = useEditorStore();

  function handleFinish() {
    // Deselect so Transformer is detached before export
    selectLayer(null);
    // Export on next tick to let React flush the deselect
    setTimeout(() => exportAsPng('meme.png'), 0);
  }

  return (
    <aside className="flex h-full w-[280px] shrink-0 flex-col overflow-y-auto border-l border-[#2a2a2a] bg-[#1a1a1a]">
      <div className="shrink-0 border-b border-[#2a2a2a] p-3">
        <button
          onClick={handleFinish}
          className="w-full rounded-md bg-[#3b82f6] py-2 text-sm font-semibold text-white hover:bg-[#2563eb] transition-colors"
        >
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

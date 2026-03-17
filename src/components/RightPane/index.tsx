'use client';

import LayersCard from './LayersCard';
import PropertiesCard from './PropertiesCard';

export default function RightPane() {
  return (
    <>
      {/* Card 1: layers list */}
      <div className="overflow-hidden rounded-xl bg-[#1a1a1a]">
        <LayersCard />
      </div>

      {/* Card 2: properties */}
      <div className="overflow-hidden rounded-xl bg-[#1a1a1a]">
        <PropertiesCard />
      </div>
    </>
  );
}

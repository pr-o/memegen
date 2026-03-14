import LeftPane from '@/components/LeftPane';
import CenterPane from '@/components/CenterPane';
import RightPane from '@/components/RightPane';
import KeyboardHandler from '@/components/KeyboardHandler';
import GNB from '@/components/GNB';

export default function Home() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#111]">
      <GNB />
      {/* min-w so 3-column layout scrolls horizontally on narrow viewports */}
      <div className="flex min-h-0 min-w-[720px] flex-1 gap-3 overflow-x-auto p-3">
        <KeyboardHandler />
        <LeftPane />
        <CenterPane />
        <RightPane />
      </div>
    </div>
  );
}

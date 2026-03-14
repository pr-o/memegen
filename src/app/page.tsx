import LeftPane from '@/components/LeftPane';
import CenterPane from '@/components/CenterPane';
import RightPane from '@/components/RightPane';
import KeyboardHandler from '@/components/KeyboardHandler';

export default function Home() {
  return (
    // min-w ensures 3-column layout scrolls horizontally on narrow viewports
    <div className="flex h-screen w-screen overflow-x-auto bg-[#111]">
      <div className="flex h-full min-w-[840px] flex-1">
        <KeyboardHandler />
        <LeftPane />
        <CenterPane />
        <RightPane />
      </div>
    </div>
  );
}

import LeftPane from '@/components/LeftPane';
import CenterPane from '@/components/CenterPane';
import RightPane from '@/components/RightPane';

export default function Home() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#111]">
      <LeftPane />
      <CenterPane />
      <RightPane />
    </div>
  );
}

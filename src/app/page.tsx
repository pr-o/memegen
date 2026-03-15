import LeftPane from "@/components/LeftPane";
import CenterPane from "@/components/CenterPane";
import RightPane from "@/components/RightPane";
import KeyboardHandler from "@/components/KeyboardHandler";
import GNB from "@/components/GNB";

export default function Home() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#111]">
      <GNB />
      <KeyboardHandler />
      <div className="container mx-auto flex min-h-0 flex-1 flex-col px-2">
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="grid min-h-0 min-w-180 flex-1 grid-cols-12 gap-6 gap-y-2 overflow-x-auto px-6 pb-6 pt-2">
            <div className="col-span-3 flex min-h-0 flex-col space-y-6">
              <LeftPane />
            </div>
            <div className="col-span-5 flex min-h-0 flex-col">
              <CenterPane />
            </div>
            <div className="col-span-4 flex min-h-0 w-full flex-col gap-4">
              <RightPane />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

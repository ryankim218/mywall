import { ProfileHeader } from "@/components/wall/ProfileHeader";
import { WallFeed } from "@/components/wall/WallFeed";

export default function Home() {
  return (
    <main className="mx-auto min-h-screen max-w-[760px] px-3 py-5 sm:px-5 sm:py-8">
      <ProfileHeader />
      <div className="mt-3 border border-[#bac8df] bg-white">
        <WallFeed />
      </div>
      <footer className="px-2 py-4 text-center text-xs text-[#667797]">
        My Wall
      </footer>
      </main>
  );
}

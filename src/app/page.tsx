"use client";

import { ProfileHeader } from "@/components/wall/ProfileHeader";
import { WallFeed } from "@/components/wall/WallFeed";

export default function Home() {
  return (
    <main className="mx-auto grid min-h-screen max-w-[1100px] grid-cols-1 content-start gap-4 px-3 py-5 sm:px-5 sm:py-8 lg:grid-cols-[280px_minmax(0,1fr)]">
      <ProfileHeader />
      <div className="min-w-0 border border-[#bac8df] bg-white">
        <WallFeed />
      </div>
      <footer className="px-2 py-4 text-center text-xs text-[#667797] lg:col-span-2">
        My Wall
      </footer>
    </main>
  );
}

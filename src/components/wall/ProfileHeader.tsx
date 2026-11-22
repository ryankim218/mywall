"use client";

import Image from "next/image";
import profilePhoto from "../../../public/profile-photo.jpg";

export function ProfileHeader() {
  return (
    <header className="overflow-hidden border border-[#bac8df] bg-white">
      <div className="h-8 border-b border-[#6d84b4] bg-[#3b5998] px-3 py-1.5 text-[13px] font-bold text-white">
        Ryan Kim
      </div>
      <div className="flex items-start gap-4 px-4 py-5">
        <div className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden border border-[#8fa4c7] bg-[#edf2fa]">
          <Image
            src={profilePhoto}
            alt="Profile"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="min-w-0 pt-1">
          <h1 className="text-xl font-bold text-[#1a3a6b]">Ryan Kim</h1>
          <p className="mt-1 text-sm text-[#555]">A friend of the internet</p>
          <p className="mt-3 text-xs text-[#777]">San Francisco, California</p>
        </div>
      </div>
    </header>
  );
}

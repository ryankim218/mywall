"use client";

import Image from "next/image";
import profilePhoto from "../../../public/profile-photo.jpg";

export function ProfileHeader() {
  return (
    <div className="overflow-hidden border border-[#bac8df] bg-white">
      <div className="flex flex-row lg:flex-col items-start gap-4 px-4 py-5">
        <div className="grid w-32 h-32 lg:w-auto lg:h-auto shrink-0 place-items-center overflow-hidden border border-[#8fa4c7] bg-[#edf2fa]">
          <Image
            src={profilePhoto}
            alt="Profile"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="min-w-0 pt-1">
          <h1 className="text-xl font-bold text-[#1a3a6b]">Ryan Kim</h1>
          <p className="mt-1 text-sm text-[#555]">Software Engineer</p>
          <p className="mt-3 text-xs text-[#777]">
            Negros Occidental, Philippines
          </p>
        </div>
      </div>
    </div>
  );
}

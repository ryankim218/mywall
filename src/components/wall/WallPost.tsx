import Image from "next/image";
import profilePhoto from "../../../public/profile-photo.jpg";
import type { Post } from "@/types/post";

export function WallPost({ post }: { post: Post }) {
  const formattedDate = new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(post.created_at));

  return (
    <article className="border-b border-[#d8dfeb] px-4 py-4 last:border-b-0">
      <div className="flex gap-3">
        <Image
          src={profilePhoto}
          alt=""
          width={36}
          height={36}
          className="h-9 w-9 shrink-0 border border-[#aebbd1] bg-[#edf2fa] object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-[#3b5998]">{post.user_name}</p>
          <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-5 text-[#222]">
            {post.message}
          </p>
          {post.photo_url && (
            <Image
              src={post.photo_url}
              alt={`Photo shared by ${post.user_name}`}
              width={400}
              height={200}
              unoptimized
              className="mt-3 h-auto max-h-[480px] max-w-full object-contain"
            />
          )}
          <time
            dateTime={post.created_at}
            className="mt-2 block text-xs text-[#777]"
          >
            {formattedDate}
          </time>
        </div>
      </div>
    </article>
  );
}

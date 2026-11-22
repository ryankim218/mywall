"use client";

import { useCallback, useEffect, useState } from "react";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import type { Post } from "@/types/post";
import { createPost, getLatestPosts } from "@/lib/supabase/posts";
import { supabase } from "@/lib/supabase/client";
import { WallComposer } from "./WallComposer";
import { WallPost } from "./WallPost";

function sortAndLimit(posts: Post[]) {
  return [...posts]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .slice(0, 50);
}

export function WallFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setPosts(await getLatestPosts(50));
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not load posts. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function fetchInitialPosts() {
      try {
        const latestPosts = await getLatestPosts(50);
        if (active) setPosts(latestPosts);
      } catch (caughtError) {
        if (!active) return;
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Could not load posts. Please try again.",
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    void fetchInitialPosts();

    const channel = supabase
      .channel("wall-posts")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "posts" },
        (payload: RealtimePostgresChangesPayload<Post>) => {
          if (!payload.new || typeof payload.new !== "object") return;
          const newPost = payload.new as Post;
          setPosts((current) =>
            sortAndLimit(
              current.some((post) => post.id === newPost.id)
                ? current
                : [newPost, ...current],
            ),
          );
        },
      )
      .subscribe();

    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, [loadPosts]);

  async function handleSubmit(message: string) {
    const post = await createPost(message);
    setPosts((current) =>
      sortAndLimit(
        current.some((item) => item.id === post.id)
          ? current
          : [post, ...current],
      ),
    );
  }

  return (
    <section aria-label="Wall">
      <div className="border-b border-[#6d84b4] bg-[#dfe5ef] px-4 py-2">
        <h2 className="text-sm font-bold text-[#1a3a6b]">Wall</h2>
      </div>
      <WallComposer onSubmit={handleSubmit} />

      {loading ? (
        <p className="px-4 py-8 text-center text-sm text-[#667797]" role="status">
          Loading wall posts...
        </p>
      ) : error ? (
        <div className="px-4 py-8 text-center" role="alert">
          <p className="text-sm text-[#a40000]">{error}</p>
          <button
            type="button"
            onClick={() => void loadPosts()}
            className="mt-3 border border-[#29447e] bg-white px-3 py-1.5 text-xs font-bold text-[#29447e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#29447e]"
          >
            Try again
          </button>
        </div>
      ) : posts.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-[#667797]">
          No posts yet. Be the first to write on the wall.
        </p>
      ) : (
        <div>
          {posts.map((post) => (
            <WallPost key={post.id} post={post} />
          ))}
        </div>
      )}
    </section>
  );
}

import type { Post } from "@/types/post";
import { supabase } from "./client";

export async function getLatestPosts(limit = 50): Promise<Post[]> {
  const { data, error } = await supabase
    .from("posts")
    .select("id, user_name, message, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error("Could not load posts. Please try again.");
  }

  return data ?? [];
}

export async function createPost(message: string): Promise<Post> {
  const trimmedMessage = message.trim();

  if (!trimmedMessage) {
    throw new Error("Please write a message before sharing.");
  }

  if (trimmedMessage.length > 280) {
    throw new Error("Messages can be at most 280 characters.");
  }

  const { data, error } = await supabase
    .from("posts")
    .insert({
      user_name: "Ryan Kim",
      message: trimmedMessage,
    })
    .select("id, user_name, message, created_at")
    .single();

  if (error) {
    throw new Error("Your post could not be shared. Please try again.");
  }

  return data;
}

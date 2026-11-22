import type { Post } from "@/types/post";
import { supabase } from "./client";

const photoBucket = "wall-photos";
const allowedPhotoTypes = ["image/jpeg", "image/png", "image/webp"];
const maxPhotoSize = 5 * 1024 * 1024;

export async function getLatestPosts(limit = 50): Promise<Post[]> {
  const { data, error } = await supabase
    .from("posts")
    .select("id, user_name, message, photo_url, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error("Could not load posts. Please try again.");
  }

  return data ?? [];
}

export async function uploadPostPhoto(file: File): Promise<string> {
  if (!allowedPhotoTypes.includes(file.type) || file.size === 0) {
    throw new Error("Choose a non-empty JPEG, PNG, or WebP image.");
  }

  if (file.size > maxPhotoSize) {
    throw new Error("Post photos must be 5 MB or smaller.");
  }

  const photoPath = `posts/${crypto.randomUUID()}`;
  const { error } = await supabase.storage
    .from(photoBucket)
    .upload(photoPath, file, {
      cacheControl: "3600",
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    console.error("Failed to upload wall post photo to Supabase Storage.", {
      bucket: photoBucket,
      path: photoPath,
      error,
    });
    throw new Error("The photo could not be uploaded. Please try again.");
  }

  return supabase.storage.from(photoBucket).getPublicUrl(photoPath).data.publicUrl;
}

export async function createPost(
  message: string,
  photoUrl?: string,
): Promise<Post> {
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
      photo_url: photoUrl ?? null,
    })
    .select("id, user_name, message, photo_url, created_at")
    .single();

  if (error) {
    console.error("Failed to save wall post.", {
      hasPhoto: Boolean(photoUrl),
      error,
    });
    throw new Error("Your post could not be shared. Please try again.");
  }

  return data;
}

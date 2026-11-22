"use client";

import { useState } from "react";

type WallComposerProps = {
  onSubmit: (message: string, photo?: File) => Promise<void>;
};

const maxPhotoSize = 5 * 1024 * 1024;
const allowedPhotoTypes = ["image/jpeg", "image/png", "image/webp"];

export function WallComposer({ onSubmit }: WallComposerProps) {
  const [message, setMessage] = useState("");
  const [photo, setPhoto] = useState<File | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const trimmedMessage = message.trim();
  const tooLong = message.length > 280;
  const disabled = !trimmedMessage || tooLong || submitting;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (disabled) return;

    setSubmitting(true);
    setError("");
    try {
      await onSubmit(trimmedMessage, photo);
      setMessage("");
      setPhoto(undefined);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Your post could not be shared. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function handlePhotoSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!allowedPhotoTypes.includes(file.type) || file.size === 0) {
      setError("Choose a non-empty JPEG, PNG, or WebP image.");
      return;
    }

    if (file.size > maxPhotoSize) {
      setError("Post photos must be 5 MB or smaller.");
      return;
    }

    setError("");
    setPhoto(file);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-b border-[#bac8df] bg-[#f7f9fc] px-4 py-3"
    >
      <label htmlFor="wall-message" className="block text-sm font-bold text-[#1a3a6b]">
        Share on Ryan&apos;s Wall
      </label>
      <textarea
        id="wall-message"
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        rows={3}
        maxLength={300}
        placeholder="Write something..."
        className="mt-2 block w-full resize-y rounded-none border border-[#bdc7d8] bg-white px-2 py-2 text-sm outline-none focus:border-[#5b74a8] focus:ring-2 focus:ring-[#d7e0f1]"
        aria-describedby="wall-message-status"
      />
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <label className="cursor-pointer border border-[#bdc7d8] bg-white px-3 py-1.5 text-xs font-bold text-[#29447e] hover:bg-[#edf2fa] focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#29447e]">
          Add photo
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handlePhotoSelect}
            disabled={submitting}
            className="sr-only"
          />
        </label>
        {photo && (
          <span className="flex items-center gap-2 text-xs text-[#555]">
            {photo.name}
            <button
              type="button"
              onClick={() => setPhoto(undefined)}
              disabled={submitting}
              className="font-bold text-[#29447e] underline disabled:opacity-50"
            >
              Remove
            </button>
          </span>
        )}
      </div>
      <div className="mt-2 flex items-center justify-between gap-3">
        <p
          id="wall-message-status"
          className={`text-xs ${tooLong ? "font-bold text-[#a40000]" : "text-[#777]"}`}
          role={error ? "alert" : undefined}
        >
          {error || (tooLong ? "Maximum 280 characters" : `${message.length} / 280`)}
        </p>
        <button
          type="submit"
          disabled={disabled}
          className="min-w-[68px] border border-[#29447e] bg-[#3b5998] px-3 py-1.5 text-xs font-bold text-white enabled:hover:bg-[#4b67a1] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#29447e]"
        >
          {submitting ? "Sharing..." : "Share"}
        </button>
      </div>
    </form>
  );
}

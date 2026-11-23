"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type WallComposerProps = {
  onSubmit: (message: string, photo?: File) => Promise<void>;
};

const maxPhotoSize = 5 * 1024 * 1024;
const allowedPhotoTypes = ["image/jpeg", "image/png", "image/webp"];

export function WallComposer({ onSubmit }: WallComposerProps) {
  const [message, setMessage] = useState("");
  const [photo, setPhoto] = useState<{
    file: File;
    previewUrl: string;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const trimmedMessage = message.trim();
  const tooLong = message.length > 280;
  const disabled = !trimmedMessage || tooLong || submitting;

  useEffect(() => {
    if (photo) return () => URL.revokeObjectURL(photo.previewUrl);
  }, [photo]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (disabled) return;

    setSubmitting(true);
    setError("");
    try {
      await onSubmit(trimmedMessage, photo?.file);
      setMessage("");
      setPhoto(null);
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
    setPhoto({ file, previewUrl: URL.createObjectURL(file) });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-b border-[#bac8df] bg-[#f7f9fc] px-4 py-3"
    >
      <label
        htmlFor="wall-message"
        className="block text-sm font-bold text-[#1a3a6b]"
      >
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
      <div className="mt-3">
        <div className="flex flex-wrap items-center gap-3">
          <label
            htmlFor="wall-photo"
            className="inline-flex cursor-pointer items-center gap-2 border border-[#bdc7d8] bg-white px-3 py-2 text-xs font-bold text-[#29447e] hover:bg-[#edf2fa] focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#29447e]"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              fill="none"
              className="h-4 w-4"
            >
              <rect
                x="2.5"
                y="3.5"
                width="15"
                height="13"
                rx="1"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <circle cx="7" cy="8" r="1.5" fill="currentColor" />
              <path
                d="m3.5 14 4-4 3 3 2-2 4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
            Add photo
          </label>
          <input
            id="wall-photo"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handlePhotoSelect}
            disabled={submitting}
            className="sr-only"
          />
          <p className="text-xs text-[#777]">
            Optional · JPEG, PNG, or WebP · Max 5 MB
          </p>
        </div>
        {photo && (
          <div className="mt-3 flex max-w-xs items-center gap-3 border border-[#d8dfeb] bg-white p-2">
            <Image
              src={photo.previewUrl}
              alt={`Preview of ${photo.file.name}`}
              width={96}
              height={72}
              unoptimized
              className="h-[72px] w-24 shrink-0 border border-[#e2e7ef] bg-[#f7f9fc] object-contain"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-[#444]">
                {photo.file.name}
              </p>
              <p className="mt-1 text-xs text-[#777]">
                {(photo.file.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPhoto(null)}
              disabled={submitting}
              aria-label="Remove attached photo"
              className="shrink-0 px-2 py-1 text-xs font-bold text-[#29447e] underline disabled:opacity-50"
            >
              Remove
            </button>
          </div>
        )}
      </div>
      <div className="mt-2 flex items-center justify-between gap-3">
        <p
          id="wall-message-status"
          className={`text-xs ${tooLong ? "font-bold text-[#a40000]" : "text-[#777]"}`}
          role={error ? "alert" : undefined}
        >
          {error ||
            (tooLong ? "Maximum 280 characters" : `${message.length} / 280`)}
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

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "My Wall",
  description: "A nostalgic profile wall for public messages",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Backboard Travel-Bot",
  description: "AI-powered travel assistant with persistent memory",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
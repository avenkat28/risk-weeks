import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RiskWeeks",
  description: "Find your semester's danger weeks before they happen.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}

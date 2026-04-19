import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CommuniGate — Decentralized Community Identity Platform",
  description:
    "Issue non-transferable Identity Passports (SBTs) and Event Badges for your community. Powered by Web3, verified on-chain.",
  keywords: ["Web3", "SBT", "Soulbound Token", "Community", "NFT", "Event Badge", "ERC-1155"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistMono.variable} h-full antialiased dark`}>
      <body className="min-h-full flex flex-col relative text-muted-foreground">
        <div className="grain-overlay" />
        <div className="relative z-0 flex flex-col flex-1">
          {children}
        </div>
      </body>
    </html>
  );
}

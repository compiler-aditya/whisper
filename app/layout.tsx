import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Whisper — Everything Has A Voice",
  description:
    "Point your camera at anything. It speaks. Every object gets a unique AI voice matched to its material, personality, and context.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Whisper",
  },
  openGraph: {
    title: "Whisper — Everything Has A Voice",
    description: "Point your camera at anything. It speaks.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Whisper — Everything Has A Voice",
    description: "Point your camera at anything. It speaks.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#000000",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="h-full bg-black text-white font-sans overflow-hidden">
        {children}
      </body>
    </html>
  );
}

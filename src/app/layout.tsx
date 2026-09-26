import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import SmoothScroll from "@/components/system/SmoothScroll";
import ScrollMotion from "@/components/system/ScrollMotion";
import ViewportProvider from "@/components/system/ViewportProvider";
import "lenis/dist/lenis.css";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Anirudh Shashikumar — Engineering the Next Era of Intelligence",
  description:
    "I build systems across AI, vision, software, and the physical world. Portfolio of Anirudh Shashikumar — Computer Science Engineering.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <ViewportProvider>
          <SmoothScroll>
            <ScrollMotion>{children}</ScrollMotion>
          </SmoothScroll>
        </ViewportProvider>
      </body>
    </html>
  );
}

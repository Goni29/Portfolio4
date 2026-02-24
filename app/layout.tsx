import type { Metadata } from "next";
import { Manrope, Noto_Sans_KR, Noto_Serif_KR, Playfair_Display } from "next/font/google";
import { StoreProvider } from "@/components/providers/store-provider";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const notoSansKr = Noto_Sans_KR({
  subsets: ["korean", "latin"],
  variable: "--font-noto-sans-kr",
});

const notoSerifKr = Noto_Serif_KR({
  subsets: ["korean", "latin"],
  variable: "--font-noto-serif-kr",
});

export const metadata: Metadata = {
  title: "Portfolio | 하이엔드 뷰티 커머스",
  description: "정제된 스킨케어 리추얼을 제안하는 Portfolio 뷰티 커머스입니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <meta charSet="utf-8" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
      </head>
      <body className={`${manrope.variable} ${playfair.variable} ${notoSansKr.variable} ${notoSerifKr.variable} antialiased smart-wrap`}>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}

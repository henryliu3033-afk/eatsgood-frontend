import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EATSGOOD — 台灣味覺社交平台",
  description: "強推必吃品項，100 人推薦觸發全城熱議。",
};

const themeScript = `
  try {
    let isDark = localStorage.getItem('eatsgood-theme') === 'dark' ||
                (!('eatsgood-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) document.documentElement.classList.add('dark');
  } catch (_) {}
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW" className={`${geist.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        {/* App Router 裡 beforeInteractive 不支援，用原生 script */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full bg-bg text-ink transition-colors duration-300">
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
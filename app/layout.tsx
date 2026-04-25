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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW" className={`${geist.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full bg-bg text-ink transition-colors duration-300">
        {/* 阻斷渲染的腳本，解決深色模式閃爍 FOUC */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try {
                let isDark = localStorage.getItem('eatsgood-theme') === 'dark' ||
                            (!('eatsgood-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
                if (isDark) document.documentElement.classList.add('dark');
              } catch (_) {}
            `,
          }}
        />
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

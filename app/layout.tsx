import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
  display: "swap",
});


export const metadata: Metadata = {
  title: "IELTS Writing AI Evaluator | Chấm Bài Chuẩn Khảo Thí IDP & BC",
  description: "Nền tảng luyện thi và chấm bài IELTS Writing tích hợp AI chuẩn Band Descriptors, phân tích lỗi tương tác trực tiếp và nâng cấp câu Band 8.5.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased min-h-screen bg-white dark:bg-zinc-950 text-zinc-950 dark:text-zinc-50`}
      >
        {children}
      </body>
    </html>
  );
}

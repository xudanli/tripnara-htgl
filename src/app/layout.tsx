import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TripNara 管理后台",
  description: "TripNara 后台管理系统",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}

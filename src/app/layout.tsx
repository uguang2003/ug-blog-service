// src/app/layout.tsx

import type { Metadata } from 'next';
import './globals.css'; // 确保你有一个全局样式文件，如果没有可以先注释掉这行

// 这是设置网站元数据（比如标题和描述）的地方
export const metadata: Metadata = {
  title: '我的 Next.js 博客',
  description: '一个使用 Next.js 和 Prisma 构建的博客',
};

// RootLayout 组件接收一个 children prop
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // 这里就是缺失的 <html> 标签
    <html lang="zh-CN"> 
      {/* 这里就是缺失的 <body> 标签 */}
      <body>
        {/* {children} 就代表了你的页面内容（比如 page.tsx） */}
        {children}
      </body>
    </html>
  );
}

/**
 * @description: 后台路由组的根布局。提供 ToastProvider；登录页绕过 AdminShell 与 AuthGuard。
 * @author: UG - 一个斗码大陆苦逼的三段码之气的少年，并没有神秘戒指中码老的帮助，但总有一天，我会成为斗码大陆中码帝一样的存在。三十年河东，三十年河西，莫欺少年穷。
 * @date: 2026-04-25
 */
'use client';
import * as React from 'react';
import { usePathname } from 'next/navigation';
import { ToastProvider } from '@/components/ui/toast';
import { AdminShell } from '@/components/admin/AdminShell';
import { AuthGuard } from '@/components/admin/AuthGuard';
import { ConfirmProvider } from '@/components/admin/ConfirmDialog';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  return (
    <ToastProvider>
      <ConfirmProvider>
        {isLoginPage ? (
          children
        ) : (
          <AuthGuard>
            <AdminShell>{children}</AdminShell>
          </AuthGuard>
        )}
      </ConfirmProvider>
    </ToastProvider>
  );
}

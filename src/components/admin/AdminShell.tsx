/**
 * @description: 后台总框架。左侧导航、顶部用户菜单、主区内容插槽。
 * @author: UG - 一个斗码大陆苦逼的三段码之气的少年，并没有神秘戒指中码老的帮助，但总有一天，我会成为斗码大陆中码帝一样的存在。三十年河东，三十年河西，莫欺少年穷。
 * @date: 2026-04-25
 */
'use client';
import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  FolderKanban,
  ImageIcon,
  MessageSquare,
  MessageCircle,
  LogOut,
  Menu,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { clearAuth, getUser, type AdminUser } from '@/lib/admin-auth';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}
const NAV: NavItem[] = [
  { label: '仪表盘', href: '/admin', icon: LayoutDashboard },
  { label: '博客管理', href: '/admin/blogs', icon: FileText },
  { label: '分类管理', href: '/admin/types', icon: FolderKanban },
  { label: '相册管理', href: '/admin/pictures', icon: ImageIcon },
  { label: '评论管理', href: '/admin/comments', icon: MessageSquare },
  { label: '留言管理', href: '/admin/messages', icon: MessageCircle },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUserState] = React.useState<AdminUser | null>(null);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    setUserState(getUser());
  }, []);

  const onLogout = () => {
    clearAuth();
    router.replace('/admin/login');
  };

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 侧栏 */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 transform border-r border-slate-800 bg-slate-900 text-slate-200 transition-transform lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 items-center border-b border-slate-800 px-6">
          <span className="text-xl font-semibold tracking-wide text-teal-400">UG666</span>
          <span className="ml-2 text-sm text-slate-400">管理后台</span>
        </div>
        <nav className="flex flex-col gap-1 p-3">
          {NAV.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                isActive(href)
                  ? 'bg-teal-600/20 text-teal-300'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white',
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* 主区 */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-8">
          <button
            className="rounded-md p-2 text-slate-700 hover:bg-slate-100 lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="切换侧栏"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            {user?.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatar}
                alt={user.nickname ?? user.username}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-600 text-sm font-medium text-white">
                {(user?.nickname ?? user?.username ?? 'U').slice(0, 1)}
              </div>
            )}
            <div className="hidden text-sm sm:block">
              <div className="font-medium text-slate-900">
                {user?.nickname ?? user?.username ?? '未登录'}
              </div>
              <div className="text-xs text-slate-500">
                {user?.type === 1 ? '管理员' : '普通用户'}
              </div>
            </div>
            <button
              onClick={onLogout}
              className="ml-2 inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">退出</span>
            </button>
          </div>
        </header>

        <main className="p-4 lg:p-8">{children}</main>
      </div>

      {/* 移动端遮罩 */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </div>
  );
}

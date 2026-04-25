/**
 * @description: 极简 Toast 系统。基于 React context + portal 自定义实现，避免引入 toast 库。
 *               用法：const { show } = useToast(); show({ type: 'success', message: 'OK' });
 * @author: UG - 一个斗码大陆苦逼的三段码之气的少年，并没有神秘戒指中码老的帮助，但总有一天，我会成为斗码大陆中码帝一样的存在。三十年河东，三十年河西，莫欺少年穷。
 * @date: 2026-04-25
 */
'use client';
import * as React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/cn';

type ToastType = 'success' | 'error' | 'info';
interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}
interface ToastContextValue {
  show: (toast: { type?: ToastType; message: string }) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<ToastItem[]>([]);
  const idRef = React.useRef(0);

  const remove = React.useCallback((id: number) => {
    setItems((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const show: ToastContextValue['show'] = React.useCallback(
    ({ type = 'info', message }) => {
      const id = ++idRef.current;
      setItems((prev) => [...prev, { id, type, message }]);
      window.setTimeout(() => remove(id), 3500);
    },
    [remove],
  );

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="pointer-events-none fixed top-4 right-4 z-[100] flex flex-col gap-2">
        {items.map((t) => (
          <div
            key={t.id}
            className={cn(
              'pointer-events-auto flex w-80 items-start gap-3 rounded-md border bg-white px-4 py-3 shadow-lg',
              t.type === 'success' && 'border-emerald-200',
              t.type === 'error' && 'border-red-200',
              t.type === 'info' && 'border-slate-200',
            )}
          >
            {t.type === 'success' && <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />}
            {t.type === 'error' && <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />}
            {t.type === 'info' && <Info className="h-5 w-5 text-sky-600 shrink-0" />}
            <p className="flex-1 text-sm text-slate-700">{t.message}</p>
            <button
              onClick={() => remove(t.id)}
              className="text-slate-400 hover:text-slate-600"
              aria-label="关闭"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error('useToast 必须在 ToastProvider 内使用');
  return ctx;
}

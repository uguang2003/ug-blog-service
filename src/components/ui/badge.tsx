/**
 * @description: 状态徽标。
 * @author: UG - 一个斗码大陆苦逼的三段码之气的少年，并没有神秘戒指中码老的帮助，但总有一天，我会成为斗码大陆中码帝一样的存在。三十年河东，三十年河西，莫欺少年穷。
 * @date: 2026-04-25
 */
import * as React from 'react';
import { cn } from '@/lib/cn';

type Tone = 'teal' | 'olive' | 'slate' | 'amber' | 'red' | 'green' | 'blue';

const toneClass: Record<Tone, string> = {
  teal: 'bg-teal-100 text-teal-800 ring-teal-200',
  olive: 'bg-lime-100 text-lime-800 ring-lime-200',
  slate: 'bg-slate-100 text-slate-700 ring-slate-200',
  amber: 'bg-amber-100 text-amber-800 ring-amber-200',
  red: 'bg-red-100 text-red-700 ring-red-200',
  green: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
  blue: 'bg-sky-100 text-sky-800 ring-sky-200',
};

export function Badge({
  className,
  tone = 'slate',
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
        toneClass[tone],
        className,
      )}
      {...props}
    />
  );
}

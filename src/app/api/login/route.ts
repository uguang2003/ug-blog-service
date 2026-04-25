/**
 * @description: 用户登录接口。bcrypt 校验，登录成功若发现旧 MD5 哈希则静默升级到 bcrypt。
 * @author: UG - 一个斗码大陆苦逼的三段码之气的少年，并没有神秘戒指中码老的帮助，但总有一天，我会成为斗码大陆中码帝一样的存在。三十年河东，三十年河西，莫欺少年穷。
 * @date: 2026-04-25
 */
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateToken, hashPassword, verifyPassword } from '@/lib/auth';

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ error: '用户名和密码不能为空' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return NextResponse.json({ error: '用户名或密码错误' }, { status: 401 });
    }

    const { matched, needsRehash } = await verifyPassword(password, user.password);
    if (!matched) {
      return NextResponse.json({ error: '用户名或密码错误' }, { status: 401 });
    }

    if (needsRehash) {
      const newHash = await hashPassword(password);
      await prisma.user.update({
        where: { id: user.id },
        data: { password: newHash, updateTime: new Date() },
      });
    }

    const token = generateToken({
      userId: Number(user.id),
      username: user.username!,
      type: user.type ?? 0,
    });

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        avatar: user.avatar,
        type: user.type,
      },
    });
  } catch (error) {
    console.error('登录失败:', error);
    return NextResponse.json({ error: '登录失败' }, { status: 500 });
  }
};

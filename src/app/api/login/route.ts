import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateToken, hashPassword } from '@/lib/auth';

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ error: '用户名和密码不能为空' }, { status: 400 });
    }

    const hashedPassword = hashPassword(password);

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user || user.password !== hashedPassword) {
      return NextResponse.json({ error: '用户名或密码错误' }, { status: 401 });
    }

    const token = generateToken({
      userId: Number(user.id),
      username: user.username!,
      type: user.type || 0,
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

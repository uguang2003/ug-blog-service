import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        nickname: true,
        email: true,
        avatar: true,
        type: true,
        createTime: true,
        updateTime: true,
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('获取用户失败:', error);
    return NextResponse.json({ error: '获取失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, nickname, email, avatar, type } = body;

    const newUser = await prisma.user.create({
      data: {
        username,
        password,
        nickname,
        email,
        avatar,
        type,
        createTime: new Date(),
        updateTime: new Date(),
      },
      select: {
        id: true,
        username: true,
        nickname: true,
        email: true,
        avatar: true,
        type: true,
        createTime: true,
        updateTime: true,
      },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('创建用户失败:', error);
    return NextResponse.json({ error: '创建失败' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        nickname: true,
        email: true,
        avatar: true,
        type: true,
        createTime: true,
        updateTime: true,
        blogs: {
          select: {
            id: true,
            title: true,
            createTime: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('获取用户失败:', error);
    return NextResponse.json({ error: '获取失败' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const { nickname, email, avatar, type } = body;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        nickname,
        email,
        avatar,
        type,
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

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('更新用户失败:', error);
    return NextResponse.json({ error: '更新失败' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除用户失败:', error);
    return NextResponse.json({ error: '删除失败' }, { status: 500 });
  }
}

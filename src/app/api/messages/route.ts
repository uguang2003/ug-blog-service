import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parentMessageId = searchParams.get('parentMessageId');

    let where: any = {};

    if (parentMessageId) {
      where.parentMessageId = parseInt(parentMessageId);
    } else {
      where.parentMessageId = null; // 获取顶级留言
    }

    const messages = await prisma.message.findMany({
      where,
      include: {
        replies: {
          include: {
            replies: true,
          },
        },
      },
      orderBy: { createTime: 'desc' },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('获取留言失败:', error);
    return NextResponse.json({ error: '获取失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      nickname,
      email,
      content,
      avatar,
      parentMessageId,
      adminMessage = false,
    } = body;

    const newMessage = await prisma.message.create({
      data: {
        nickname,
        email,
        content,
        avatar,
        parentMessageId: parentMessageId ? parseInt(parentMessageId) : null,
        adminMessage,
        createTime: new Date(),
      },
      include: {
        parentMessage: true,
      },
    });

    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    console.error('创建留言失败:', error);
    return NextResponse.json({ error: '创建失败' }, { status: 500 });
  }
}

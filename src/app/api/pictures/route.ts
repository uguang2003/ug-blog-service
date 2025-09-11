import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const pictures = await prisma.picture.findMany({
      orderBy: { id: 'desc' },
    });

    return NextResponse.json(pictures);
  } catch (error) {
    console.error('获取图片失败:', error);
    return NextResponse.json({ error: '获取失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pictureName, pictureTime, pictureAddress, pictureDescription } = body;

    const newPicture = await prisma.picture.create({
      data: {
        pictureName,
        pictureTime,
        pictureAddress,
        pictureDescription,
      },
    });

    return NextResponse.json(newPicture, { status: 201 });
  } catch (error) {
    console.error('创建图片失败:', error);
    return NextResponse.json({ error: '创建失败' }, { status: 500 });
  }
}

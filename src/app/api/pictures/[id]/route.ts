import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    const picture = await prisma.picture.findUnique({
      where: { id },
    });

    if (!picture) {
      return NextResponse.json({ error: '图片不存在' }, { status: 404 });
    }

    return NextResponse.json(picture);
  } catch (error) {
    console.error('获取图片失败:', error);
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
    const { pictureName, pictureTime, pictureAddress, pictureDescription } = body;

    const updatedPicture = await prisma.picture.update({
      where: { id },
      data: {
        pictureName,
        pictureTime,
        pictureAddress,
        pictureDescription,
      },
    });

    return NextResponse.json(updatedPicture);
  } catch (error) {
    console.error('更新图片失败:', error);
    return NextResponse.json({ error: '更新失败' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    await prisma.picture.delete({
      where: { id },
    });

    return NextResponse.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除图片失败:', error);
    return NextResponse.json({ error: '删除失败' }, { status: 500 });
  }
}

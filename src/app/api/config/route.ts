import { NextResponse } from 'next/server';

/**
 * 获取应用配置信息
 * 这个 API 路由会在运行时读取环境变量
 */
export async function GET() {
  return NextResponse.json({
    baseUrl: process.env.NEXT_PUBLIC_WEB_BASE_URL || '',
  });
}

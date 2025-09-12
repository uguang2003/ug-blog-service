import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // 设置CORS头
  const response = NextResponse.next()

  // 允许所有域名访问（开发环境），生产环境请替换为具体域名
  response.headers.set('Access-Control-Allow-Origin', '*')

  // 允许的HTTP方法
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')

  // 允许的请求头
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  // 处理预检请求（OPTIONS）
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: response.headers
    })
  }

  return response
}

// 只对API路由应用此中间件
export const config = {
  matcher: '/api/:path*',
}
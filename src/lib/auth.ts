import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'UG666';

export interface AuthUser {
  userId: number;
  username: string;
  type: number;
}

type ApiHandler<T extends Record<string, string> = Record<string, string>> = (request: NextRequest, context: { params: Promise<T> }) => Promise<NextResponse | Response>;

interface ExtendedRequest extends NextRequest {
  user?: AuthUser;
}

export function verifyToken(request: NextRequest): AuthUser | null {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;

    return decoded;
  } catch {
    return null;
  }
}

export function generateToken(user: AuthUser): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '24h' });
}

export function hashPassword(password: string): string {
  return crypto.createHash('md5').update(password).digest('hex');
}

export function requireAuth<T extends Record<string, string> = Record<string, string>>(handler: ApiHandler<T>) {
  return async (request: NextRequest, context: { params: Promise<T> }) => {
    const user = verifyToken(request);

    if (!user) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    // 将用户信息添加到请求中
    (request as ExtendedRequest).user = user;

    return handler(request, context);
  };
}

export function requireAdmin<T extends Record<string, string> = Record<string, string>>(handler: ApiHandler<T>) {
  return async (request: NextRequest, context: { params: Promise<T> }) => {
    const user = verifyToken(request);

    if (!user) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    // 检查是否为管理员（假设type=1为管理员）
    if (user.type !== 1) {
      return NextResponse.json({ error: '需要管理员权限' }, { status: 403 });
    }

    (request as ExtendedRequest).user = user;

    return handler(request, context);
  };
}

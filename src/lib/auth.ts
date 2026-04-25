/**
 * @description: 鉴权与密码工具。JWT 签发/校验、密码哈希（bcrypt，兼容旧 MD5）。
 * @author: UG - 一个斗码大陆苦逼的三段码之气的少年，并没有神秘戒指中码老的帮助，但总有一天，我会成为斗码大陆中码帝一样的存在。三十年河东，三十年河西，莫欺少年穷。
 * @date: 2026-04-25
 */
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('环境变量 JWT_SECRET 未设置');
}

const BCRYPT_ROUNDS = 10;

export interface AuthUser {
  userId: number;
  username: string;
  type: number;
}

type ApiHandler<T extends Record<string, string> = Record<string, string>> = (
  request: NextRequest,
  context: { params: Promise<T> },
) => Promise<NextResponse | Response>;

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
    const decoded = jwt.verify(token, JWT_SECRET!) as AuthUser;
    return decoded;
  } catch {
    return null;
  }
}

export function generateToken(user: AuthUser): string {
  return jwt.sign(user, JWT_SECRET!, { expiresIn: '24h' });
}

/** 用 bcrypt 计算哈希，新密码统一走这里 */
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

/** 旧库密码用的是裸 MD5，迁移期需要兼容验证 */
function md5(plain: string): string {
  return crypto.createHash('md5').update(plain).digest('hex');
}

/**
 * 校验密码。返回值：
 *  - matched=true 表示密码正确
 *  - needsRehash=true 表示当前使用的是旧 MD5 哈希，调用方应在登录后用 hashPassword 重写存储
 */
export async function verifyPassword(
  plain: string,
  stored: string | null | undefined,
): Promise<{ matched: boolean; needsRehash: boolean }> {
  if (!stored) return { matched: false, needsRehash: false };
  // bcrypt 哈希以 $2a$ / $2b$ / $2y$ 开头
  if (stored.startsWith('$2')) {
    const ok = await bcrypt.compare(plain, stored);
    return { matched: ok, needsRehash: false };
  }
  // 兜底：32 位十六进制视为 MD5
  if (/^[a-f0-9]{32}$/i.test(stored) && md5(plain) === stored.toLowerCase()) {
    return { matched: true, needsRehash: true };
  }
  return { matched: false, needsRehash: false };
}

export function requireAuth<T extends Record<string, string> = Record<string, string>>(
  handler: ApiHandler<T>,
) {
  return async (request: NextRequest, context: { params: Promise<T> }) => {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }
    (request as ExtendedRequest).user = user;
    return handler(request, context);
  };
}

export function requireAdmin<T extends Record<string, string> = Record<string, string>>(
  handler: ApiHandler<T>,
) {
  return async (request: NextRequest, context: { params: Promise<T> }) => {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }
    if (user.type !== 1) {
      return NextResponse.json({ error: '需要管理员权限' }, { status: 403 });
    }
    (request as ExtendedRequest).user = user;
    return handler(request, context);
  };
}

// src/lib/prisma.ts
import { PrismaClient } from '../generated/prisma';

declare global {
  var prisma: PrismaClient | undefined;
}

const prisma =
  global.prisma ||
  new PrismaClient({
    log: ['query'], // 在控制台打印执行的 SQL 查询
  });

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export default prisma;

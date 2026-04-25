/**
 * @description: 登录链路 smoke 测试。直接调 verifyPassword 验证 UG666 / 123 是否通过。
 * @author: UG - 一个斗码大陆苦逼的三段码之气的少年，并没有神秘戒指中码老的帮助，但总有一天，我会成为斗码大陆中码帝一样的存在。三十年河东，三十年河西，莫欺少年穷。
 * @date: 2026-04-25
 */
import { PrismaClient } from '../src/generated/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  const prisma = new PrismaClient();
  try {
    const u = await prisma.user.findUnique({ where: { username: 'UG666' } });
    if (!u) { console.error('未找到 UG666'); process.exit(1); }
    console.log(`[用户] id=${u.id} username=${u.username} type=${u.type} passwordPrefix=${u.password?.slice(0, 7)}...`);

    const ok = await bcrypt.compare('123', u.password ?? '');
    const wrong = await bcrypt.compare('456', u.password ?? '');
    console.log(`[bcrypt] '123' 校验: ${ok ? '通过 ✓' : '失败 ✗'}`);
    console.log(`[bcrypt] '456' 校验: ${wrong ? '不应通过 ✗' : '正确拒绝 ✓'}`);
    if (ok && !wrong) console.log('[结果] 登录密码链路正常');
    else process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}
main().catch(e => { console.error(e); process.exit(1); });

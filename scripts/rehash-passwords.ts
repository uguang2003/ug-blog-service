/**
 * @description: 一次性脚本：把所有用户的旧 MD5 密码升级为 bcrypt。
 *               已迁移的旧库里 UG666 的密码是 MD5("123")，运行后改为 bcrypt("123")。
 *               用法：npx tsx scripts/rehash-passwords.ts
 * @author: UG - 一个斗码大陆苦逼的三段码之气的少年，并没有神秘戒指中码老的帮助，但总有一天，我会成为斗码大陆中码帝一样的存在。三十年河东，三十年河西，莫欺少年穷。
 * @date: 2026-04-25
 */
import { PrismaClient } from '../src/generated/prisma';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';

const KNOWN_MD5_PLAINS: Record<string, string> = {
  '202cb962ac59075b964b07152d234b70': '123', // MD5("123")
};

function md5(s: string) {
  return crypto.createHash('md5').update(s).digest('hex');
}

async function main() {
  const prisma = new PrismaClient();
  try {
    const users = await prisma.user.findMany();
    let upgraded = 0;
    for (const u of users) {
      const stored = u.password ?? '';
      if (stored.startsWith('$2')) continue; // 已是 bcrypt
      if (!/^[a-f0-9]{32}$/i.test(stored)) {
        console.warn(`[警告] 用户 ${u.username} 密码格式不识别，跳过`);
        continue;
      }
      const plain = KNOWN_MD5_PLAINS[stored.toLowerCase()];
      if (!plain) {
        console.warn(`[警告] 用户 ${u.username} 的 MD5 未在已知字典里，跳过；下次该用户登录会自动升级`);
        continue;
      }
      // 双重确认 hash 匹配
      if (md5(plain) !== stored.toLowerCase()) {
        console.warn(`[警告] 用户 ${u.username} 的 MD5 与已知明文不一致，跳过`);
        continue;
      }
      const newHash = await bcrypt.hash(plain, 10);
      await prisma.user.update({
        where: { id: u.id },
        data: { password: newHash, updateTime: new Date() },
      });
      upgraded++;
      console.log(`[完成] ${u.username} 升级到 bcrypt`);
    }
    console.log(`[小结] 升级用户数: ${upgraded} / 总用户数: ${users.length}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => { console.error(e); process.exit(1); });

/**
 * @description: 数据迁移结果校验。统计每张表行数、ID 区间、序列下一值，并抽样若干记录。
 * @author: UG - 一个斗码大陆苦逼的三段码之气的少年，并没有神秘戒指中码老的帮助，但总有一天，我会成为斗码大陆中码帝一样的存在。三十年河东，三十年河西，莫欺少年穷。
 * @date: 2026-04-25
 */
import { PrismaClient } from '../src/generated/prisma';

async function main() {
  const prisma = new PrismaClient();
  try {
    const counts = {
      User: await prisma.user.count(),
      Type: await prisma.type.count(),
      Blog: await prisma.blog.count(),
      Comment: await prisma.comment.count(),
      Message: await prisma.message.count(),
      Picture: await prisma.picture.count(),
    };
    console.log('[行数]', counts);

    const ranges = await prisma.$queryRawUnsafe<{ table: string; min: number; max: number }[]>(`
      SELECT 'User'    AS "table", MIN(id)::int AS min, MAX(id)::int AS max FROM "User"
      UNION ALL SELECT 'Type',    MIN(id)::int, MAX(id)::int FROM "Type"
      UNION ALL SELECT 'Blog',    MIN(id)::int, MAX(id)::int FROM "Blog"
      UNION ALL SELECT 'Comment', MIN(id)::int, MAX(id)::int FROM "Comment"
      UNION ALL SELECT 'Message', MIN(id)::int, MAX(id)::int FROM "Message"
      UNION ALL SELECT 'Picture', MIN(id)::int, MAX(id)::int FROM "Picture"
    `);
    console.log('[ID 区间]', ranges);

    const seqs = await prisma.$queryRawUnsafe<{ seq: string; last_value: bigint; is_called: boolean }[]>(`
      SELECT 'User_id_seq'    AS seq, last_value, is_called FROM "User_id_seq"
      UNION ALL SELECT 'Type_id_seq',    last_value, is_called FROM "Type_id_seq"
      UNION ALL SELECT 'Blog_id_seq',    last_value, is_called FROM "Blog_id_seq"
      UNION ALL SELECT 'Comment_id_seq', last_value, is_called FROM "Comment_id_seq"
      UNION ALL SELECT 'Message_id_seq', last_value, is_called FROM "Message_id_seq"
      UNION ALL SELECT 'Picture_id_seq', last_value, is_called FROM "Picture_id_seq"
    `);
    console.log('[序列]', seqs.map(r => ({ ...r, last_value: Number(r.last_value) })));

    // 抽样
    const blog = await prisma.blog.findFirst({ orderBy: { id: 'asc' }, include: { type: true, user: { select: { username: true, nickname: true } } } });
    console.log('[抽样 Blog]', blog && { id: blog.id, title: blog.title, type: blog.type?.name, user: blog.user, contentLen: blog.content?.length, views: blog.views });

    const comment = await prisma.comment.findMany({ take: 3, orderBy: { id: 'asc' } });
    console.log('[抽样 Comment]', comment);

  } finally {
    await prisma.$disconnect();
  }
}

main().catch(e => { console.error(e); process.exit(1); });

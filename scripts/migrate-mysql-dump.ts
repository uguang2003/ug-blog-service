/**
 * @description: MySQL dump → PostgreSQL 数据迁移脚本
 *               解析 mysqldump 格式的 INSERT INTO ... VALUES (...)，
 *               转换字段名 snake_case → camelCase、bit(1) → boolean、datetime → Date，
 *               按依赖顺序灌入 Prisma 数据库，最后重置 SERIAL 序列。
 *
 *               用法（PowerShell / bash 均可）：
 *                 npx tsx scripts/migrate-mysql-dump.ts --dry-run
 *                 npx tsx scripts/migrate-mysql-dump.ts --execute
 *               可选环境变量：
 *                 MYSQL_DUMP_PATH  指定 SQL 文件路径
 *                 TRUNCATE_FIRST   "1" 时执行前会 TRUNCATE 所有目标表
 * @author: UG - 一个斗码大陆苦逼的三段码之气的少年，并没有神秘戒指中码老的帮助，但总有一天，我会成为斗码大陆中码帝一样的存在。三十年河东，三十年河西，莫欺少年穷。
 * @date: 2026-04-25
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { PrismaClient } from '../src/generated/prisma';

const DEFAULT_DUMP =
  'D:/UG/Desktop/myblogplus_2026-04-25_01-30-02_mysql_data.sql';
const DUMP_PATH = process.env.MYSQL_DUMP_PATH ?? DEFAULT_DUMP;
const DRY_RUN = !process.argv.includes('--execute');
const TRUNCATE_FIRST = process.env.TRUNCATE_FIRST === '1';

type Cell = string | number | boolean | Date | null;
type Row = Cell[];

// ---------- MySQL VALUES 解析器 ----------

function decodeEscape(ch: string): string {
  switch (ch) {
    case 'n': return '\n';
    case 'r': return '\r';
    case 't': return '\t';
    case '0': return '\0';
    case 'Z': return '\x1a';
    case 'b': return '\b';
    case '\\': return '\\';
    case "'": return "'";
    case '"': return '"';
    default: return ch;
  }
}

function commitCell(type: 'str' | 'raw' | 'none', value: string): Cell {
  if (type === 'none') {
    throw new Error('遇到空 cell');
  }
  if (type === 'str') return value;
  const t = value.trim();
  if (t === 'NULL' || t === 'null') return null;
  if (t === '0x00') return false;
  if (t === '0x01') return true;
  if (/^-?\d+$/.test(t)) return parseInt(t, 10);
  if (/^-?\d*\.\d+$/.test(t)) return parseFloat(t);
  return t;
}

/** 解析 INSERT INTO ... VALUES (...),(...),(...); 返回所有行 */
function parseInsertValues(input: string, fromIndex: number): Row[] {
  const rows: Row[] = [];
  let i = fromIndex;
  // 找到第一个 '('
  while (i < input.length && input[i] !== '(') i++;

  while (i < input.length && input[i] === '(') {
    i++;
    const row: Row = [];
    let pendingType: 'str' | 'raw' | 'none' = 'none';
    let pendingValue = '';
    let inStr = false;

    while (i < input.length) {
      const c = input[i];
      if (inStr) {
        if (c === '\\') {
          pendingValue += decodeEscape(input[i + 1] ?? '');
          i += 2;
          continue;
        }
        if (c === "'") {
          if (input[i + 1] === "'") {
            pendingValue += "'";
            i += 2;
            continue;
          }
          inStr = false;
          i++;
          continue;
        }
        pendingValue += c;
        i++;
        continue;
      }

      // 顶层
      if (c === "'") {
        if (pendingType === 'none') {
          pendingType = 'str';
          pendingValue = '';
          inStr = true;
          i++;
          continue;
        }
        throw new Error(`字符串起始位置异常 @${i}`);
      }
      if (c === ',') {
        row.push(commitCell(pendingType, pendingValue));
        pendingType = 'none';
        pendingValue = '';
        i++;
        continue;
      }
      if (c === ')') {
        row.push(commitCell(pendingType, pendingValue));
        pendingType = 'none';
        pendingValue = '';
        rows.push(row);
        i++;
        break;
      }
      if (/\s/.test(c)) {
        i++;
        continue;
      }
      if (pendingType === 'none') {
        pendingType = 'raw';
        pendingValue = c;
      } else if (pendingType === 'raw') {
        pendingValue += c;
      } else {
        throw new Error(`字符串后跟 raw 字符 @${i}`);
      }
      i++;
    }

    while (i < input.length && /\s/.test(input[i])) i++;
    if (input[i] === ',') {
      i++;
      continue;
    }
    break;
  }

  return rows;
}

/** 抽取整个文件中某张 MySQL 表的所有数据行 */
function extractTableRows(sql: string, mysqlTableName: string): Row[] {
  const marker = `INSERT INTO \`${mysqlTableName}\` VALUES`;
  const idx = sql.indexOf(marker);
  if (idx === -1) {
    console.warn(`[警告] 未找到 ${mysqlTableName} 的 INSERT，跳过`);
    return [];
  }
  return parseInsertValues(sql, idx + marker.length);
}

// ---------- 类型转换辅助 ----------

/** MySQL datetime 字符串 → Date（按 +08:00 处理） */
function toDateBeijing(s: Cell): Date | null {
  if (s === null || s === undefined) return null;
  if (typeof s !== 'string') return null;
  // '2022-05-14 11:04:42' → '2022-05-14T11:04:42+08:00'
  return new Date(s.replace(' ', 'T') + '+08:00');
}

function asString(s: Cell): string | null {
  if (s === null || s === undefined) return null;
  return String(s);
}

function asInt(s: Cell): number | null {
  if (s === null || s === undefined) return null;
  if (typeof s === 'number') return s;
  const n = parseInt(String(s), 10);
  return Number.isNaN(n) ? null : n;
}

function asBool(s: Cell, fallback = false): boolean {
  if (typeof s === 'boolean') return s;
  if (s === null || s === undefined) return fallback;
  return Boolean(s);
}

// ---------- 行 → Prisma data 映射 ----------

// MySQL 列顺序（按 dump 中 CREATE TABLE 顺序）
const COL_USER = ['id', 'avatar', 'create_time', 'email', 'nickname', 'password', 'type', 'update_time', 'username'] as const;
const COL_TYPE = ['id', 'name'] as const;
const COL_BLOG = ['id', 'appreciation', 'commentabled', 'content', 'create_time', 'description', 'first_picture', 'flag', 'published', 'recommend', 'share_statement', 'title', 'update_time', 'views', 'type_id', 'user_id', 'comment_count'] as const;
const COL_COMMENT = ['id', 'nickname', 'email', 'content', 'avatar', 'create_time', 'blog_id', 'parent_comment_id', 'admin_comment'] as const;
const COL_MESSAGE = ['id', 'nickname', 'email', 'content', 'avatar', 'create_time', 'parent_message_id', 'admin_message'] as const;
const COL_PICTURE = ['id', 'pictureaddress', 'picturedescription', 'picturename', 'picturetime'] as const;

function rowToObject<T extends readonly string[]>(cols: T, row: Row): Record<T[number], Cell> {
  if (row.length !== cols.length) {
    throw new Error(`列数不匹配：期望 ${cols.length}，实际 ${row.length}：${JSON.stringify(row).slice(0, 200)}`);
  }
  const obj: Record<string, Cell> = {};
  cols.forEach((k, idx) => { obj[k] = row[idx]; });
  return obj as Record<T[number], Cell>;
}

// ---------- 主流程 ----------

async function main() {
  console.log(`[信息] dump 文件: ${DUMP_PATH}`);
  console.log(`[信息] 模式: ${DRY_RUN ? 'DRY-RUN（仅打印，不写库）' : 'EXECUTE（真正写库）'}`);

  const sqlPath = resolve(DUMP_PATH);
  const sql = readFileSync(sqlPath, 'utf8');

  // 1. 解析所有表
  const userRows = extractTableRows(sql, 't_user').map(r => rowToObject(COL_USER, r));
  const typeRows = extractTableRows(sql, 't_type').map(r => rowToObject(COL_TYPE, r));
  const blogRows = extractTableRows(sql, 't_blog').map(r => rowToObject(COL_BLOG, r));
  const commentRows = extractTableRows(sql, 't_comment').map(r => rowToObject(COL_COMMENT, r));
  const messageRows = extractTableRows(sql, 't_message').map(r => rowToObject(COL_MESSAGE, r));
  const pictureRows = extractTableRows(sql, 't_picture').map(r => rowToObject(COL_PICTURE, r));

  console.log(`[解析] User=${userRows.length} Type=${typeRows.length} Blog=${blogRows.length} Comment=${commentRows.length} Message=${messageRows.length} Picture=${pictureRows.length}`);

  // 2. 转换为 Prisma data
  const users = userRows.map(r => ({
    id: asInt(r.id)!,
    avatar: asString(r.avatar),
    createTime: toDateBeijing(r.create_time),
    email: asString(r.email),
    nickname: asString(r.nickname),
    password: asString(r.password),
    type: asInt(r.type),
    updateTime: toDateBeijing(r.update_time),
    username: asString(r.username),
  }));
  const types = typeRows.map(r => ({
    id: asInt(r.id)!,
    name: asString(r.name) ?? '',
  }));
  const blogs = blogRows.map(r => ({
    id: asInt(r.id)!,
    appreciation: asBool(r.appreciation),
    commentabled: asBool(r.commentabled),
    content: asString(r.content),
    createTime: toDateBeijing(r.create_time),
    description: asString(r.description),
    firstPicture: asString(r.first_picture),
    flag: asString(r.flag),
    published: asBool(r.published),
    recommend: asBool(r.recommend),
    shareStatement: asBool(r.share_statement),
    title: asString(r.title),
    updateTime: toDateBeijing(r.update_time),
    views: asInt(r.views),
    typeId: asInt(r.type_id),
    userId: asInt(r.user_id),
    commentCount: asInt(r.comment_count),
  }));
  const comments = commentRows.map(r => ({
    id: asInt(r.id)!,
    nickname: asString(r.nickname),
    email: asString(r.email),
    content: asString(r.content),
    avatar: asString(r.avatar),
    createTime: toDateBeijing(r.create_time),
    blogId: asInt(r.blog_id),
    parentCommentId: asInt(r.parent_comment_id),
    adminComment: asBool(r.admin_comment),
  }));
  const messages = messageRows.map(r => ({
    id: asInt(r.id)!,
    nickname: asString(r.nickname),
    email: asString(r.email),
    content: asString(r.content),
    avatar: asString(r.avatar),
    createTime: toDateBeijing(r.create_time),
    parentMessageId: asInt(r.parent_message_id),
    adminMessage: asBool(r.admin_message),
  }));
  const pictures = pictureRows.map(r => ({
    id: asInt(r.id)!,
    pictureAddress: asString(r.pictureaddress),
    pictureDescription: asString(r.picturedescription),
    pictureName: asString(r.picturename),
    pictureTime: asString(r.picturetime),
  }));

  // 清洗孤儿外键（旧库可能存在父记录被删，但子记录仍然引用的情况）
  const userIds = new Set(users.map(u => u.id));
  const typeIds = new Set(types.map(t => t.id));
  const blogIds = new Set(blogs.map(b => b.id));
  const commentIds = new Set(comments.map(c => c.id));
  const messageIds = new Set(messages.map(m => m.id));
  let orphan = 0;
  for (const b of blogs) {
    if (b.typeId !== null && !typeIds.has(b.typeId)) { b.typeId = null; orphan++; }
    if (b.userId !== null && !userIds.has(b.userId)) { b.userId = null; orphan++; }
  }
  for (const c of comments) {
    if (c.blogId !== null && !blogIds.has(c.blogId)) { c.blogId = null; orphan++; }
    if (c.parentCommentId !== null && !commentIds.has(c.parentCommentId)) { c.parentCommentId = null; orphan++; }
  }
  for (const m of messages) {
    if (m.parentMessageId !== null && !messageIds.has(m.parentMessageId)) { m.parentMessageId = null; orphan++; }
  }
  console.log(`[清洗] 孤儿外键置 null 数量: ${orphan}`);

  // dry-run 时打印每张表前 2 条样本
  const sample = (arr: unknown[], n = 2) =>
    arr.slice(0, n).map(o => JSON.parse(JSON.stringify(o, (_, v) => (v instanceof Date ? v.toISOString() : v))));
  console.log('[样本] User =', sample(users));
  console.log('[样本] Type =', sample(types, 3));
  console.log('[样本] Blog (前1条 截短 content)=',
    sample(blogs.map(b => ({ ...b, content: b.content?.slice(0, 60) })), 1));
  console.log('[样本] Comment =', sample(comments, 3));
  console.log('[样本] Message =', sample(messages, 2));
  console.log('[样本] Picture =', sample(pictures, 2));

  if (DRY_RUN) {
    console.log('\n[完成] DRY-RUN 结束。如要写库，加 --execute');
    return;
  }

  // 3. 写库
  const prisma = new PrismaClient();
  try {
    if (TRUNCATE_FIRST) {
      console.log('[写库] TRUNCATE_FIRST=1 → 清空所有目标表');
      await prisma.$executeRawUnsafe(
        `TRUNCATE TABLE "Comment", "Message", "Blog", "Type", "User", "Picture" RESTART IDENTITY CASCADE`,
      );
    }

    console.log('[写库] User …');
    await prisma.user.createMany({ data: users, skipDuplicates: true });
    console.log('[写库] Type …');
    await prisma.type.createMany({ data: types, skipDuplicates: true });
    console.log('[写库] Blog …');
    await prisma.blog.createMany({ data: blogs, skipDuplicates: true });
    console.log('[写库] Comment …');
    await prisma.comment.createMany({ data: comments, skipDuplicates: true });
    console.log('[写库] Message …');
    await prisma.message.createMany({ data: messages, skipDuplicates: true });
    console.log('[写库] Picture …');
    await prisma.picture.createMany({ data: pictures, skipDuplicates: true });

    // 4. 重置每张表的 SERIAL sequence
    console.log('[写库] 重置序列 …');
    const seqs: [string, string][] = [
      ['User', 'User_id_seq'],
      ['Type', 'Type_id_seq'],
      ['Blog', 'Blog_id_seq'],
      ['Comment', 'Comment_id_seq'],
      ['Message', 'Message_id_seq'],
      ['Picture', 'Picture_id_seq'],
    ];
    for (const [table, seq] of seqs) {
      await prisma.$executeRawUnsafe(
        `SELECT setval('"public"."${seq}"', COALESCE((SELECT MAX(id) FROM "public"."${table}"), 1), true)`,
      );
    }

    console.log('\n[完成] 数据迁移成功');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error('[错误]', err);
  process.exit(1);
});

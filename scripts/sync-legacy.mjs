/** @description 有快照与隔离验收之后执行的一次性增量迁移，默认只生成计划。 */
import { readFileSync, writeFileSync } from 'node:fs';
import { PrismaClient } from '../src/generated/prisma/index.js';
import { tables, planSync, assertRelations, fingerprint } from './legacy-sync-core.mjs';

const sourcePath = process.env.LEGACY_SOURCE_PATH;
const targetConfig = process.env.LEGACY_TARGET_CONFIG;
const reportPath = process.env.LEGACY_REPORT_PATH;
if (!sourcePath || !targetConfig || !reportPath) throw Error('必须指定源快照、目标连接配置和报告路径');
const source = JSON.parse(readFileSync(sourcePath, 'utf8'));
const { url } = JSON.parse(readFileSync(targetConfig, 'utf8'));
const prisma = new PrismaClient({ datasources: { db: { url } } });
const read = async client => {
  const state = {};
  for (const name of [...tables, 'user']) state[name] = JSON.parse(JSON.stringify(await client[name].findMany({ orderBy: { id: 'asc' } })));
  return state;
};
try {
  const before = await read(prisma), plan = planSync(source, before);
  assertRelations(before);
  const report = { mode: process.argv.includes('--execute') ? 'execute' : 'plan',
    countsBefore: Object.fromEntries(Object.entries(before).map(([t, rows]) => [t, rows.length])),
    operations: plan.operations.map(o => ({ table: o.table, id: o.id, action: o.action, fields: Object.keys(o.data) })),
    conflicts: plan.conflicts, preserved: plan.preserved, orphans: plan.orphans };
  writeFileSync(reportPath, JSON.stringify(report, null, 2));
  if (plan.conflicts.length) throw Error('存在待确认冲突，未执行写入，见报告');
  if (process.argv.includes('--execute')) {
    if (!process.env.LEGACY_VERIFIED_SNAPSHOT) throw Error('执行前必须指定已验证的快照路径');
    readFileSync(process.env.LEGACY_VERIFIED_SNAPSHOT);
    await prisma.$transaction(async tx => {
      // 加锁后重新核对，防止计划到执行之间覆盖新写入。
      await tx.$executeRawUnsafe('LOCK TABLE "Blog", "Type", "Comment", "Message", "Picture", "User" IN SHARE ROW EXCLUSIVE MODE');
      const locked = await read(tx);
      for (const t of [...tables, 'user']) if (JSON.stringify(locked[t]) !== JSON.stringify(before[t])) throw Error('目标数据已变化，请重新核对：' + t);
      for (const operation of plan.operations) {
        const data = { ...operation.data };
        for (const key of ['createTime', 'updateTime']) if (data[key]) data[key] = new Date(data[key]);
        if (operation.action === 'create') await tx[operation.table].create({ data });
        else await tx[operation.table].update({ where: { id: operation.id }, data });
      }
      const after = await read(tx); assertRelations(after);
      const again = planSync(source, after);
      if (again.operations.length || again.conflicts.length) throw Error('重复执行仍有写入或冲突');
      for (const table of tables) {
        const name = table[0].toUpperCase() + table.slice(1);
        await tx.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"${name}"', 'id'), GREATEST(COALESCE((SELECT MAX(id) FROM "${name}"), 1), (SELECT last_value FROM "${name}_id_seq")), true)`);
      }
      // 不含行内容、邮箱或凭据的验收证据。
      report.countsAfter = Object.fromEntries(Object.entries(after).map(([t, rows]) => [t, rows.length]));
      report.idempotent = true;
      report.contentDigests = Object.fromEntries(tables.map(t => [t, fingerprint({ rows: JSON.stringify(after[t]) })]));
      report.credentialsUnchanged = JSON.stringify(before.user) === JSON.stringify(after.user);
    }, { timeout: 60000, maxWait: 15000 });
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
  }
  console.log(JSON.stringify({ mode: report.mode, operations: report.operations.length, conflicts: report.conflicts.length,
    counts: report.countsAfter || report.countsBefore, idempotent: report.idempotent, credentialsUnchanged: report.credentialsUnchanged }));
} catch (error) { console.error('增量核对失败：', error.code || error.message?.split('\n')[0]); process.exitCode = 1; }
finally { await prisma.$disconnect(); }

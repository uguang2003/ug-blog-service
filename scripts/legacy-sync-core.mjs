/** @description 旧 MySQL 博客增量映射、冲突检查与关系核对；不迁移用户凭据。 */
import { createHash } from 'node:crypto';

export const tables = ['type', 'blog', 'comment', 'message', 'picture'];
const sourceTables = { type: 't_type', blog: 't_blog', comment: 't_comment', message: 't_message', picture: 't_picture' };
const pictureKeys = { pictureaddress: 'pictureAddress', picturedescription: 'pictureDescription', picturename: 'pictureName', picturetime: 'pictureTime' };
const booleans = new Set(['appreciation', 'commentabled', 'published', 'recommend', 'shareStatement', 'adminComment', 'adminMessage']);
const stable = value => JSON.stringify(value, Object.keys(value).sort());
export const fingerprint = value => createHash('sha256').update(stable(value)).digest('hex');
export function normalizeSource(source, target) {
  const result = {}, orphans = [];
  for (const table of tables) result[table] = source[sourceTables[table]].map(row => Object.fromEntries(Object.entries(row).map(([key, value]) => {
    const name = pictureKeys[key] || key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    if (name.endsWith('Time') && table !== 'picture' && value) value = new Date(value + '+08:00').toISOString();
    if (booleans.has(name)) value = Boolean(value);
    return [name, value];
  })));
  const sourceUser = new Map(source.t_user.map(u => [u.id, u]));
  for (const blog of result.blog) {
    if (blog.userId === null) continue;
    const old = sourceUser.get(blog.userId), current = target.user.find(u => u.id === blog.userId);
    if (!old || !current || old.nickname !== current.nickname || old.avatar !== current.avatar) throw Error('文章作者映射需要确认：' + blog.id);
  }
  for (const [table, field] of [['comment', 'parentCommentId'], ['message', 'parentMessageId']]) {
    const ids = new Set(result[table].map(r => r.id));
    for (const row of result[table]) if (row[field] !== null && !ids.has(row[field])) {
      orphans.push({ table, id: row.id, field, sourceParent: row[field] }); row[field] = null;
    }
  }
  return { data: result, orphans };
}
export function planSync(source, target) {
  const { data, orphans } = normalizeSource(source, target);
  const operations = [], conflicts = [], preserved = [];
  for (const table of tables) for (const row of data[table]) {
    const existing = target[table].find(r => r.id === row.id);
    if (!existing) {
      const duplicate = target[table].find(r => table === 'picture' ? r.pictureAddress === row.pictureAddress :
        table === 'type' ? r.name === row.name : r.content === row.content && r.createTime === row.createTime);
      if (duplicate) { conflicts.push({ table, id: row.id, reason: '内容对应其他 ID', targetId: duplicate.id }); continue; }
      operations.push({ table, id: row.id, action: 'create', data: row }); continue;
    }
    const changes = Object.keys(row).filter(k => k !== 'id' && row[k] !== existing[k]);
    if (!changes.length) continue;
    const contentChanges = changes.filter(k => !['views', 'commentCount'].includes(k));
    let patch = {};
    if (contentChanges.length) {
      if (table === 'blog' && row.createTime === existing.createTime && row.updateTime > existing.updateTime) {
        patch = Object.fromEntries(contentChanges.map(k => [k, row[k]]));
      } else if (table === 'blog' && row.createTime === existing.createTime && existing.updateTime > row.updateTime) {
        preserved.push({ table, id: row.id, fields: contentChanges, reason: '目标版本更新' });
      } else { conflicts.push({ table, id: row.id, fields: contentChanges, reason: '无法据时间与身份确定优先版本' }); continue; }
    }
    // 两站共享历史基数，不能相加；迁移只抬高旧基数，重复运行不累加。
    if (table === 'blog' && (row.views || 0) > (existing.views || 0)) patch.views = row.views;
    // 评论数以实际关联行计算，不迁入过时的缓存计数。
    if (Object.keys(patch).length) operations.push({ table, id: row.id, action: 'update', before: existing, data: patch });
  }
  return { operations, conflicts, preserved, orphans };
}
export function assertRelations(data) {
  const ids = Object.fromEntries([...tables, 'user'].map(t => [t, new Set(data[t].map(r => r.id))]));
  const edges = [['blog','typeId','type'], ['blog','userId','user'], ['comment','blogId','blog'],
    ['comment','parentCommentId','comment'], ['message','parentMessageId','message']];
  for (const [table, field, parent] of edges) for (const row of data[table]) {
    if (row[field] !== null && !ids[parent].has(row[field])) throw Error(`关系缺失：${table}/${row.id}/${field}`);
    if (parent === table) {
      const seen = new Set([row.id]); let next = row[field];
      while (next !== null) {
        if (seen.has(next)) throw Error('回复关系有环：' + table + '/' + row.id);
        seen.add(next); next = data[table].find(r => r.id === next)[field];
      }
    }
    if (table === 'comment' && field === 'parentCommentId' && row[field] !== null &&
      data.comment.find(c => c.id === row[field]).blogId !== row.blogId) throw Error('跨文章评论关系：' + row.id);
  }
}

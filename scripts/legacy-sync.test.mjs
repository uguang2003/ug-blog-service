/** @description 增量迁移的冲突、重复执行与关系保护验证。 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { planSync, assertRelations } from './legacy-sync-core.mjs';
const source = () => ({ t_user: [], t_type: [], t_blog: [], t_comment: [], t_message: [], t_picture: [] });
const target = () => ({ user: [], type: [], blog: [], comment: [], message: [], picture: [] });
test('照片按 ID 与完整内容新增，重复执行不重复插入', () => {
  const s = source(), t = target(); s.t_picture.push({ id: 170, pictureaddress: 'https://example.test/a.jpg', picturename: '照片' });
  const plan = planSync(s, t); assert.equal(plan.operations.length, 1);
  t.picture.push(plan.operations[0].data); assert.equal(planSync(s, t).operations.length, 0);
});
test('ID 或内容对应其他记录时要求确认', () => {
  const s = source(), t = target(); s.t_picture.push({ id: 170, pictureaddress: 'a', picturename: '新照片' });
  t.picture.push({ id: 170, pictureAddress: 'b', pictureName: '另一张照片' });
  assert.equal(planSync(s, t).conflicts.length, 1);
  t.picture[0].id = 171; t.picture[0].pictureAddress = 'a'; assert.equal(planSync(s, t).conflicts.length, 1);
});
test('北京时间正确映射，保留新库较新正文与较大阅读数', () => {
  const s = source(), t = target(); s.t_blog.push({ id: 1, user_id: null, create_time: '2026-01-01T08:00:00', update_time: '2026-01-01T09:00:00', content: '旧正文', views: 8 });
  t.blog.push({ id: 1, userId: null, createTime: '2026-01-01T00:00:00.000Z', updateTime: '2026-01-01T02:00:00.000Z', content: '新正文', views: 10 });
  const plan = planSync(s, t); assert.equal(plan.conflicts.length, 0); assert.equal(plan.operations.length, 0); assert.equal(plan.preserved.length, 1);
});
test('同一更新时间但正文冲突时不覆盖', () => {
  const s = source(), t = target(); s.t_blog.push({ id: 1, user_id: null, create_time: '2026-01-01T08:00:00', update_time: '2026-01-01T09:00:00', content: '版本甲' });
  t.blog.push({ id: 1, userId: null, createTime: '2026-01-01T00:00:00.000Z', updateTime: '2026-01-01T01:00:00.000Z', content: '版本乙' });
  assert.equal(planSync(s, t).conflicts.length, 1);
});
test('孤儿回复保留为顶层，正常回复关系保留', () => {
  const s = source(), t = target(); s.t_comment.push({ id: 2, parent_comment_id: 1 }, { id: 3, parent_comment_id: 2 });
  const plan = planSync(s, t); assert.equal(plan.orphans.length, 1); assert.equal(plan.operations[0].data.parentCommentId, null); assert.equal(plan.operations[1].data.parentCommentId, 2);
});
test('关系检查拒绝循环与跨文章回复', () => {
  const t = target(); t.blog.push({ id: 1, userId: null, typeId: null }, { id: 2, userId: null, typeId: null });
  t.comment.push({ id: 1, blogId: 1, parentCommentId: 2 }, { id: 2, blogId: 2, parentCommentId: null });
  assert.throws(() => assertRelations(t), /跨文章/);
  t.comment[1].blogId = 1; t.comment[1].parentCommentId = 1; assert.throws(() => assertRelations(t), /有环/);
});

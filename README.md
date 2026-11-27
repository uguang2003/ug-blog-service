# UG Blog Service

一个基于 Next.js 和 Prisma 的博客服务项目，提供博客文章的管理和展示功能。

## 技术栈

- **前端框架**: Next.js 15 (App Router)
- **数据库 ORM**: Prisma 6.14.0
- **数据库**: PostgreSQL
- **认证**: JWT (jsonwebtoken) + bcryptjs
- **语言**: TypeScript 5
- **样式**: Tailwind CSS 4 (通过 PostCSS 配置)
- **代码质量**: ESLint 9
- **包管理**: npm/yarn/pnpm

## 项目结构

```
├── prisma/
│   ├── schema.prisma          # 数据库模式定义
│   └── migrations/            # 数据库迁移文件
├── src/
│   ├── app/
│   │   ├── api/               # API 路由
│   │   │   ├── admin/         # 管理员 API
│   │   │   │   ├── blogs/     # 博客管理
│   │   │   │   ├── pictures/  # 图片管理
│   │   │   │   ├── stats/     # 统计信息
│   │   │   │   └── types/     # 分类管理
│   │   │   ├── blogs/         # 前端博客 API
│   │   │   ├── comments/      # 评论管理
│   │   │   ├── login/         # 用户登录
│   │   │   ├── messages/      # 留言管理
│   │   │   ├── pictures/      # 图片管理
│   │   │   ├── stats/         # 统计信息
│   │   │   └── types/         # 分类管理
│   │   ├── docs/              # API 文档页面
│   │   └── page.tsx           # 首页
│   ├── components/            # React 组件
│   ├── generated/             # Prisma 生成的文件
│   └── lib/                   # 工具库
│       ├── auth.ts            # 认证相关
│       └── prisma.ts          # Prisma 客户端配置
├── public/                    # 静态资源
└── package.json               # 项目配置和依赖
```

## 快速开始

### 环境要求

- Node.js 18+
- PostgreSQL 数据库
- npm 或 yarn 或 pnpm

### 安装依赖

```bash
npm install
# 或
yarn install
# 或
pnpm install
```

### 数据库配置

1. 确保 PostgreSQL 数据库已运行
2. 配置 `.env` 文件中的 `DATABASE_URL`
3. 运行数据库迁移：

```bash
npx prisma migrate dev
```

4. 生成 Prisma 客户端：

```bash
npx prisma generate
```

### 运行开发服务器

```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

## API 接口

### 用户认证

#### 用户登录
```
POST /api/login
```
请求体:
```json
{
  "username": "用户名",
  "password": "密码"
}
```
响应:
```json
{
  "token": "jwt-token-here",
  "user": {
    "id": 1,
    "username": "用户名",
    "nickname": "昵称",
    "avatar": "头像URL",
    "type": 0
  }
}
```

### 后台管理 API (需要管理员权限)

所有后台管理API都需要在请求头中包含Authorization: Bearer {token}

#### 获取博客列表
```
GET /api/admin/blogs?page=1&pageSize=10&title=搜索标题&typeId=1
```

#### 创建博客
```
POST /api/admin/blogs
```
请求体:
```json
{
  "title": "博客标题",
  "content": "博客内容",
  "description": "博客描述",
  "firstPicture": "/image.jpg",
  "published": true,
  "recommend": false,
  "commentabled": true,
  "appreciation": false,
  "shareStatement": false,
  "typeId": 1
}
```

#### 获取单个博客
```
GET /api/admin/blogs/[id]
```

#### 更新博客
```
PUT /api/admin/blogs/[id]
```

#### 删除博客
```
DELETE /api/admin/blogs/[id]
```

#### 获取分类列表
```
GET /api/admin/types
```

#### 创建分类
```
POST /api/admin/types
```
请求体:
```json
{
  "name": "分类名称"
}
```

#### 更新分类
```
PUT /api/admin/types/[id]
```

#### 删除分类
```
DELETE /api/admin/types/[id]
```

#### 获取统计信息
```
GET /api/admin/stats
```

### 前端博客展示 API

#### 获取所有博客
```
GET /api/blogs?page=1&limit=10&recommend=true&typeId=1&query=搜索关键词
```

#### 获取单个博客
```
GET /api/blogs/[id]
```

#### 获取所有分类
```
GET /api/types
```

#### 获取评论
```
GET /api/comments?blogId=1
```

#### 创建评论
```
POST /api/comments
```

#### 获取留言
```
GET /api/messages
```

#### 创建留言
```
POST /api/messages
```

#### 获取图片
```
GET /api/pictures
```

#### 获取统计信息
```
GET /api/stats
```

## 数据库模式

项目使用 Prisma 定义数据库模式，主要包含以下模型：

### User (用户表)
- `id`: 用户ID (BigInt, 主键)
- `avatar`: 用户头像 (String, 可选)
- `createTime`: 创建时间 (DateTime, 可选)
- `email`: 用户邮箱 (String, 可选)
- `nickname`: 用户昵称 (String, 可选)
- `password`: 用户密码 (String, 可选)
- `type`: 用户类型 (Int, 可选)
- `updateTime`: 更新时间 (DateTime, 可选)
- `username`: 用户名 (String, 可选, 唯一)

### Type (分类表)
- `id`: 分类ID (BigInt, 主键)
- `name`: 分类名称 (String)

### Blog (博客表)
- `id`: 博客ID (BigInt, 主键)
- `appreciation`: 是否开启赞赏 (Boolean)
- `commentabled`: 是否允许评论 (Boolean)
- `content`: 博客内容 (String, 可选)
- `createTime`: 创建时间 (DateTime, 可选)
- `description`: 博客描述 (String, 可选)
- `firstPicture`: 首图地址 (String, 可选)
- `flag`: 博客标识 (String, 可选)
- `published`: 是否发布 (Boolean)
- `recommend`: 是否推荐 (Boolean)
- `shareStatement`: 是否开启分享声明 (Boolean)
- `title`: 博客标题 (String, 可选)
- `updateTime`: 更新时间 (DateTime, 可选)
- `views`: 浏览次数 (Int, 可选)
- `typeId`: 分类ID (BigInt, 可选)
- `userId`: 用户ID (BigInt, 可选)
- `commentCount`: 评论数量 (Int, 可选)

### Comment (评论表)
- `id`: 评论ID (BigInt, 主键)
- `nickname`: 评论者昵称 (String, 可选)
- `email`: 评论者邮箱 (String, 可选)
- `content`: 评论内容 (String, 可选)
- `avatar`: 评论者头像 (String, 可选)
- `createTime`: 创建时间 (DateTime, 可选)
- `blogId`: 博客ID (BigInt, 可选)
- `parentCommentId`: 父评论ID (BigInt, 可选)
- `adminComment`: 是否管理员评论 (Boolean)

### Message (留言表)
- `id`: 留言ID (BigInt, 主键)
- `nickname`: 留言者昵称 (String, 可选)
- `email`: 留言者邮箱 (String, 可选)
- `content`: 留言内容 (String, 可选)
- `avatar`: 留言者头像 (String, 可选)
- `createTime`: 创建时间 (DateTime, 可选)
- `parentMessageId`: 父留言ID (BigInt, 可选)
- `adminMessage`: 是否管理员留言 (Boolean)

### Picture (图片表)
- `id`: 图片ID (BigInt, 主键)
- `pictureAddress`: 图片地址 (String, 可选)
- `pictureDescription`: 图片描述 (String, 可选)
- `pictureName`: 图片名称 (String, 可选)
- `pictureTime`: 图片时间 (String, 可选)

## 开发命令

```bash
# 开发服务器 (使用 Turbopack)
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start

# 代码检查
npm run lint

# 生成 Prisma 客户端
npx prisma generate

# 数据库迁移
npx prisma migrate dev

# 查看数据库状态
npx prisma migrate status

# 重置数据库
npx prisma migrate reset

# 打开 Prisma Studio
npx prisma studio
```

## 旧 Java 博客增量补齐

2026-11-24 将 Java 博客独立为 [ug-blog-classic](https://github.com/uguang2003/ug-blog-classic)，保留线上 JAR 中的页面、样式和交互，页面只调用本服务现有公开 API。本轮没有改变 API、数据库 Schema 或 Astro 的调用方式。独立前端已完成用户界面验收并部署 Vercel；原 Java 和 MySQL 已停止，制品与数据目录保留。

已逐字段比较 MySQL 与正式 Neon `neondb`：30 篇文章的正文、标题、分类、封面及时间一致；6 个分类、3 条评论和 13 条留言一致；旧库没有独立标签表。正式库补入照片 ID 170–186 共 17 张，照片由 145 张增至 162 张，30 篇文章的阅读数取两库较大值。未导入旧管理账户、密码或邮箱，也未覆盖新库较新的文章版本。旧评论引用已不存在的父记录时保留为顶层，已有有效回复关系继续保留。

迁移前保留 MySQL 完整 SQL 和 Neon 压缩快照，在隔离 PostgreSQL 18 实际恢复并执行 47 项增量操作，关系检查和重复执行均通过。随后正式执行相同计划；现有账户凭据保持不变。接手复核时重新读取实时 MySQL 与正式 Neon，计划为 0 项写入、0 个冲突。

脚本 `scripts/sync-legacy.mjs` 默认只生成计划，映射、冲突和关系检查在 `scripts/legacy-sync-core.mjs`。在本仓运行：

```powershell
mise exec -- node --test scripts/legacy-sync.test.mjs
$env:LEGACY_SOURCE_PATH = '<本机 MySQL JSON 快照绝对路径>'
$env:LEGACY_TARGET_CONFIG = '<本机目标连接 JSON 绝对路径>'
$env:LEGACY_REPORT_PATH = '<本机报告 JSON 绝对路径>'
mise exec -- node scripts/sync-legacy.mjs
```

源 JSON 使用原 MySQL 表名和字段名；作者只需 `id`、`nickname`、`avatar`，不需要凭据。目标连接 JSON 为 `{ "url": "<PostgreSQL 连接地址>" }`，仅保存在本机。需要执行时，必须先核对报告、验证恢复和隔离迁移，设置 `LEGACY_VERIFIED_SNAPSHOT` 为已验证快照的绝对路径，再加 `--execute`。执行时锁定并重新核对目标数据，遇到真实冲突停止写入。脚本不会删除目标独有数据，不设永久同步或定时任务；双站切换前仍须核对最终增量。

本轮快照和验收证据集中保留在工作区 `archived/maintenance-recovery-20261124/blog-classic-20261124/`，不提交数据库快照、个人信息或连接配置。隔离表单提交验证见该目录 `form-report.json`；正式迁移结果见 `production-execute.json`。

### 自建 Java / MySQL 退出状态

2026-11-24 核对服务器：MySQL 只有 `myblogplus` 一个业务库，在线业务连接均来自旧 Java 博客；Auth、Storage、AIHub 使用独立 PostgreSQL，不依赖该 MySQL。`img.ug666.top` 按用户要求不在本次范围。

用户已将 [blog.ug666.top](https://blog.ug666.top) 和 [blog.ug666.cn](https://blog.ug666.cn) 切换至 Vercel 的 `ug-blog-classic`。两域名 CNAME 为 `7abcb3ca8d5e9c1d.vercel-dns-017.com`，HTTPS 响应包含 `X-Vercel-Id`。默认地址为 [ug-blog-classic.vercel.app](https://ug-blog-classic.vercel.app)，原界面和部署回归证据见 Classic README。

19:08 停止 Java 并导出停止写入后的最终 MySQL 快照，核对正式 Neon：文章 30、分类 6、评论 3、留言 13、照片 162，增量计划 0 写入、0 冲突，无需追加正式写入。此前 MySQL SQL 与 Neon 压缩快照均已在临时隔离数据库实际恢复核对，验证库已移除。

Java 的 `spring_myblogplus-1_0_0-RELEASE_jar.service` 已停止、禁用并 mask，专属 drop-in 将 `Restart` 设为 `no`；宝塔项目的开机启动关闭，标记为主动停用。MySQL 已通过原 init 脚本正常关闭，`mysqld.service`、`mysql.service` 均 mask，所有 SysV 运行级别开机启动关闭。实测进程不存在、9996 和 3306 无监听，宝塔 Java 项目状态为停止。旧 MySQL 专属每日备份任务（ID 1）停用，其他任务不变。

停用后复验两域名访客页面与本地图片/样式、两域名公开 API、新后台登录页和 Astro，共 20 个 HTTP 请求均 200。后台实际账号登录未在本轮验证。博客访客站、API/管理后台和 Neon 数据库均不再依赖本机；旧 Nginx/证书配置仍保留，正式 DNS 不再指向它，原 Java 上游已关闭，没有改动自定义域名绑定。`img.ug666.top` 按用户要求保持原样。

恢复材料在服务器 `/var/backups/ug-blog-retired-20261124/` 和工作区 `archived/maintenance-recovery-20261124/blog-offserver-20261124/`，目录受限，不提交源码仓：`java-config-before.tar.gz` 保留 JAR、配置和证书；`mysql-final-190810.sql` 为停止 Java 后的最终 SQL；`mysql-datadir-stopped.tar.gz` 为正常停库后的完整 MySQL 数据目录归档；`neon-before-final.dump` 为已验证的 Neon 快照。最终核对、HTTP、服务状态和 SHA-256 清单随归档保存。原 JAR、`/etc/myblogplus/`、`/www/server/data/` 均未删除，Java 和 MySQL 运行时未卸载。Auth / Storage 的每日与每周备份不调整，Blog 的 Neon 周备份继续沿用 ug-backups。

需要回退时先核对切换后 Neon 的新增内容，不直接切回旧数据。使用保留的原目录，可以先 `systemctl unmask mysqld.service mysql.service spring_myblogplus-1_0_0-RELEASE_jar.service`，再通过 `/etc/init.d/mysqld start` 和 `systemctl start spring_myblogplus-1_0_0-RELEASE_jar.service` 手动恢复旧进程；确认数据和入口后再决定是否恢复自动启动。全量恢复材料的说明见本轮归档 README。

## 部署

### Docker 部署

#### 1. 准备工作

确保已安装 Docker 和 Docker Compose。

#### 2. 配置环境变量

复制 `.env.example` 文件为 `.env` 并修改其中的配置：

```bash
cp .env.example .env
```

修改 `.env` 文件中的数据库连接和 JWT 密钥等配置。

#### 3. 使用 Docker Compose 启动

```bash
# 启动所有服务(数据库 + 应用)
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down

# 停止服务并删除数据卷
docker-compose down -v
```

应用将运行在 `http://localhost:6067`

#### 4. 构建 Docker 镜像

```bash
# 构建镜像
docker build -t ug-blog-service .

# 运行容器(需要先有 PostgreSQL 数据库)
docker run -d \
  -p 6067:6067 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/dbname" \
  -e JWT_SECRET="your-secret-key" \
  --name ug-blog-app \
  ug-blog-service
```

### GitHub Actions 自动部署到 Docker Hub

本项目已配置 GitHub Actions 自动化工作流，可以自动构建并推送 Docker 镜像到 Docker Hub。

#### 配置步骤

1. **在 Docker Hub 创建 Access Token**
   - 访问 [Docker Hub](https://hub.docker.com/)
   - 进入 Account Settings → Security → Access Tokens
   - 点击 "New Access Token" 创建新令牌
   - 保存生成的 token

2. **在 GitHub 仓库配置 Secrets**
   - 进入你的 GitHub 仓库
   - 点击 Settings → Secrets and variables → Actions
   - 点击 "New repository secret" 添加以下两个 secrets：
     - `DOCKERHUB_USERNAME`: 你的 Docker Hub 用户名
     - `DOCKERHUB_TOKEN`: 刚才创建的 Access Token

3. **触发自动构建**
   
   工作流会在以下情况自动触发：
   - 推送代码到 `main` 分支
   - 创建新的 Git 标签(如 `v1.0.0`)
   - 手动触发(在 Actions 页面点击 "Run workflow")

4. **查看构建状态**
   
   在仓库的 "Actions" 标签页可以查看构建进度和日志

5. **从 Docker Hub 拉取镜像**

   ```bash
   # 拉取最新版本
   docker pull <你的Docker Hub用户名>/ug-blog-service:latest
   
   # 拉取特定版本
   docker pull <你的Docker Hub用户名>/ug-blog-service:v1.0.0
   
   # 运行镜像
   docker run -d \
     -p 6067:6067 \
     -e DATABASE_URL="postgresql://user:pass@host:5432/dbname" \
     -e JWT_SECRET="your-secret-key" \
     <你的Docker Hub用户名>/ug-blog-service:latest
   ```

### Vercel 部署

1. 连接 GitHub 仓库到 Vercel
2. 在 Storage 关联 Neon 数据库，由关联注入 `DATABASE_URL`；单独配置 `JWT_SECRET`
3. 部署应用

当前生产项目为 `ug-blog-service`，API 域名为 `api.blog.ug666.top` 和 `api.blog.ug666.cn`。2026-11-24 将原 Neon `ugblog` 的业务表迁入 Vercel Storage 的 `ug-blog`（新加坡），关联生产、预览和开发环境；底层数据库名为 `neondb`。随后用户确认旧个人 Neon 已全部删除，原库不再作为只读回退副本或恢复来源。恢复使用 GitHub 私有仓库中的备份。

自建服务器上的旧 PostgreSQL `ugblog`、同名账号及其专属备份定时任务已删除，独立快照已验证可恢复。账号遗留的两条 AIHub 默认授权规则已清理，AIHub 的表数据和对象归属保持不变；Java 博客的 MySQL `myblogplus` 已停用，原数据目录和恢复归档保留。

数据库备份由私有仓库 [ug-backups](https://github.com/uguang2003/ug-backups) 负责：每周一北京时间 11:15，从 Vercel 关联的 `ug-blog` 正式库导出 PostgreSQL 压缩备份，直接提交到该仓库的 `db/ug-blog/backups/`，长期保留并由用户手动清理。每次提交后重新检出、校验，并在隔离 PostgreSQL 18 中实际恢复核对；校验不再导出正式库。备份无需解密，恢复步骤见该仓库的 `db/ug-blog/README.md`。本仓库原七牛备份工作流已移除；保留的七牛 AK/SK 不参与当前备份。

### 其他部署方式

参考 Next.js 官方部署文档：[https://nextjs.org/docs/app/building-your-application/deploying](https://nextjs.org/docs/app/building-your-application/deploying)

## 贡献

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 联系方式

项目维护者: [uguang2003](https://github.com/uguang2003)

项目链接: [https://github.com/uguang2003/ug-blog-service](https://github.com/uguang2003/ug-blog-service)

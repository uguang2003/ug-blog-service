# Docker 部署快速入门指南

> 本指南面向 Docker 新手，提供最简单的部署方式

## 📋 准备工作

### 1. 安装 Docker

#### Windows 用户
1. 下载 [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/)
2. 双击安装包并按照提示完成安装
3. 重启电脑
4. 打开 Docker Desktop，确保它正在运行

#### Mac 用户
1. 下载 [Docker Desktop for Mac](https://www.docker.com/products/docker-desktop/)
2. 安装 Docker Desktop
3. 启动 Docker Desktop

#### Linux 用户
```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 启动 Docker 服务
sudo systemctl start docker
sudo systemctl enable docker

# 将当前用户加入 docker 组(可选,避免每次都用 sudo)
sudo usermod -aG docker $USER
```

### 2. 验证安装

打开终端(或命令提示符)，运行:
```bash
docker --version
docker compose version
```

如果显示版本号，说明安装成功!

## 🚀 快速部署

### 方法一: 使用脚本一键部署(推荐)

#### Windows 用户
1. 在项目根目录双击运行 `scripts\docker-deploy.bat`
2. 选择 `1` 启动服务
3. 等待构建完成(首次可能需要 5-10 分钟)
4. 浏览器访问 `http://localhost:6067`

#### Mac/Linux 用户
```bash
# 给脚本添加执行权限
chmod +x scripts/docker-deploy.sh

# 运行脚本
./scripts/docker-deploy.sh

# 选择 1 启动服务
```

### 方法二: 使用命令行

打开终端,进入项目根目录:

```bash
# 启动所有服务(包括数据库和应用)
docker compose up -d

# 查看日志
docker compose logs -f

# 停止服务
docker compose down
```

## 🔧 配置说明

### 环境变量

如果需要修改配置,编辑 `docker-compose.yml` 文件中的环境变量:

```yaml
environment:
  # 数据库连接地址
  DATABASE_URL: postgresql://postgres:postgres123@postgres:5432/ugblog
  
  # JWT 密钥(生产环境务必修改!)
  JWT_SECRET: your-super-secret-jwt-key-change-in-production
```

**重要**: 生产环境部署时,请修改以下敏感信息:
- `POSTGRES_PASSWORD`: 数据库密码
- `JWT_SECRET`: JWT 密钥

### 端口配置

默认配置:
- 应用端口: `6067`
- 数据库端口: `5432`

如需修改,编辑 `docker-compose.yml` 中的 `ports` 配置。

## 📦 GitHub Actions 自动部署到 Docker Hub

### 第一步: 创建 Docker Hub 账号

1. 访问 [Docker Hub](https://hub.docker.com/)
2. 点击 "Sign Up" 注册账号
3. 记住你的用户名(后面会用到)

### 第二步: 创建 Access Token

1. 登录 Docker Hub
2. 点击右上角头像 → **Account Settings**
3. 点击左侧 **Security** → **Access Tokens**
4. 点击 **New Access Token**
5. 输入描述(如 "GitHub Actions")
6. 点击 **Generate**
7. **复制生成的 token**(只显示一次,请妥善保存!)

### 第三步: 配置 GitHub Secrets

1. 进入你的 GitHub 仓库页面
2. 点击 **Settings**(设置)
3. 左侧菜单找到 **Secrets and variables** → **Actions**
4. 点击 **New repository secret** 添加以下两个 secret:

   **Secret 1:**
   - Name: `DOCKERHUB_USERNAME`
   - Value: 你的 Docker Hub 用户名

   **Secret 2:**
   - Name: `DOCKERHUB_TOKEN`
   - Value: 刚才复制的 Access Token

### 第四步: 触发自动构建

配置完成后,有三种方式触发自动构建:

#### 方式 1: 推送代码到 main 分支
```bash
git add .
git commit -m "Update code"
git push origin main
```

#### 方式 2: 创建版本标签
```bash
# 创建版本标签
git tag v1.0.0
git push origin v1.0.0
```

#### 方式 3: 手动触发
1. 进入 GitHub 仓库
2. 点击 **Actions** 标签
3. 选择 **Docker Build and Push** 工作流
4. 点击 **Run workflow** → **Run workflow**

### 第五步: 查看构建状态

1. 进入仓库的 **Actions** 标签
2. 点击最新的工作流运行
3. 查看构建日志和状态
4. 构建成功后,可以在 Docker Hub 看到你的镜像

### 第六步: 拉取和使用镜像

构建成功后,可以在任何地方拉取镜像:

```bash
# 拉取最新版本
docker pull <你的用户名>/ug-blog-service:latest

# 运行容器
docker run -d \
  -p 6067:6067 \
  -e DATABASE_URL="postgresql://user:password@host:5432/dbname" \
  -e JWT_SECRET="your-secret-key" \
  <你的用户名>/ug-blog-service:latest
```

## 📊 常用命令

```bash
# 查看运行中的容器
docker ps

# 查看所有容器(包括停止的)
docker ps -a

# 查看日志
docker compose logs -f app

# 进入容器
docker exec -it ug-blog-app sh

# 重启服务
docker compose restart

# 停止并删除所有容器和数据
docker compose down -v

# 查看数据库
docker compose exec postgres psql -U postgres -d ugblog
```

## 🐛 常见问题

### 1. 端口被占用

**错误信息**: `bind: address already in use`

**解决方法**:
- 检查端口 6067 或 5432 是否被其他程序占用
- 修改 `docker-compose.yml` 中的端口映射
- 或停止占用端口的程序

### 2. 构建失败

**错误信息**: 各种构建错误

**解决方法**:
```bash
# 清理 Docker 缓存
docker system prune -a

# 重新构建
docker compose up --build
```

### 3. 数据库连接失败

**错误信息**: `Can't reach database server`

**解决方法**:
- 等待数据库完全启动(约 10-20 秒)
- 检查 `docker-compose.yml` 中的数据库配置
- 查看数据库日志: `docker compose logs postgres`

### 4. 内存不足

**错误信息**: 构建过程卡住或失败

**解决方法**:
- Docker Desktop: 进入设置,增加分配给 Docker 的内存(建议 4GB+)
- 关闭其他占用内存的程序

## 🎓 下一步

- 学习 Docker 基础: [Docker 官方文档](https://docs.docker.com/get-started/)
- 学习 Docker Compose: [Docker Compose 文档](https://docs.docker.com/compose/)
- 配置生产环境: 使用反向代理(Nginx)、HTTPS、自动备份等

## 📞 需要帮助?

- 查看项目文档: [README.md](../README.md)
- 提交 Issue: [GitHub Issues](https://github.com/uguang2003/ug-blog-service/issues)

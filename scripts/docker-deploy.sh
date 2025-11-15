#!/bin/bash

# Docker 快速部署脚本

echo "================================"
echo "UG Blog Service - Docker 部署脚本"
echo "================================"
echo ""

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ 错误: 未找到 Docker，请先安装 Docker"
    exit 1
fi

echo "✅ Docker 已安装"

# 检查 Docker Compose 是否安装
if ! command -v docker-compose &> /dev/null; then
    echo "⚠️  警告: 未找到 docker-compose，将使用 docker compose 命令"
    DOCKER_COMPOSE="docker compose"
else
    DOCKER_COMPOSE="docker-compose"
fi

echo "✅ Docker Compose 可用"
echo ""

# 显示菜单
echo "请选择操作:"
echo "1. 启动服务 (docker-compose up)"
echo "2. 停止服务 (docker-compose down)"
echo "3. 重新构建并启动 (docker-compose up --build)"
echo "4. 查看日志 (docker-compose logs)"
echo "5. 停止服务并删除数据 (docker-compose down -v)"
echo "6. 仅构建 Docker 镜像"
echo "0. 退出"
echo ""

read -p "请输入选项 (0-6): " choice

case $choice in
    1)
        echo ""
        echo "🚀 启动服务..."
        $DOCKER_COMPOSE up -d
        echo ""
        echo "✅ 服务已启动!"
        echo "📱 应用地址: http://localhost:6067"
        echo "💡 查看日志: $DOCKER_COMPOSE logs -f"
        ;;
    2)
        echo ""
        echo "🛑 停止服务..."
        $DOCKER_COMPOSE down
        echo "✅ 服务已停止!"
        ;;
    3)
        echo ""
        echo "🔨 重新构建并启动..."
        $DOCKER_COMPOSE up --build -d
        echo ""
        echo "✅ 服务已重新构建并启动!"
        echo "📱 应用地址: http://localhost:6067"
        ;;
    4)
        echo ""
        echo "📋 显示日志 (按 Ctrl+C 退出)..."
        $DOCKER_COMPOSE logs -f
        ;;
    5)
        echo ""
        read -p "⚠️  警告: 此操作将删除所有数据，确定继续吗? (y/N): " confirm
        if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
            echo "🗑️  停止服务并删除数据..."
            $DOCKER_COMPOSE down -v
            echo "✅ 服务已停止，数据已删除!"
        else
            echo "❌ 操作已取消"
        fi
        ;;
    6)
        echo ""
        echo "🔨 构建 Docker 镜像..."
        docker build -t ug-blog-service:latest .
        echo ""
        echo "✅ 镜像构建完成!"
        echo "💡 镜像名称: ug-blog-service:latest"
        ;;
    0)
        echo "👋 再见!"
        exit 0
        ;;
    *)
        echo "❌ 无效的选项"
        exit 1
        ;;
esac

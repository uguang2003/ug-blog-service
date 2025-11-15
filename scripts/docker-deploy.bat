@echo off
chcp 65001 >nul
:: Docker 快速部署脚本 (Windows 版本)

echo ================================
echo UG Blog Service - Docker 部署脚本
echo ================================
echo.

:: 检查 Docker 是否安装
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误: 未找到 Docker，请先安装 Docker Desktop
    pause
    exit /b 1
)

echo ✅ Docker 已安装

:: 检查 Docker Compose 是否可用
docker compose version >nul 2>&1
if %errorlevel% equ 0 (
    set DOCKER_COMPOSE=docker compose
    echo ✅ Docker Compose 可用
) else (
    docker-compose --version >nul 2>&1
    if %errorlevel% equ 0 (
        set DOCKER_COMPOSE=docker-compose
        echo ✅ Docker Compose 可用
    ) else (
        echo ❌ 错误: 未找到 Docker Compose
        pause
        exit /b 1
    )
)

echo.
echo 请选择操作:
echo 1. 启动服务 (docker-compose up)
echo 2. 停止服务 (docker-compose down)
echo 3. 重新构建并启动 (docker-compose up --build)
echo 4. 查看日志 (docker-compose logs)
echo 5. 停止服务并删除数据 (docker-compose down -v)
echo 6. 仅构建 Docker 镜像
echo 0. 退出
echo.

set /p choice="请输入选项 (0-6): "

if "%choice%"=="1" goto start_service
if "%choice%"=="2" goto stop_service
if "%choice%"=="3" goto rebuild_service
if "%choice%"=="4" goto show_logs
if "%choice%"=="5" goto remove_data
if "%choice%"=="6" goto build_image
if "%choice%"=="0" goto exit_script
goto invalid_option

:start_service
echo.
echo 🚀 启动服务...
%DOCKER_COMPOSE% up -d
echo.
echo ✅ 服务已启动!
echo 📱 应用地址: http://localhost:6067
echo 💡 查看日志: %DOCKER_COMPOSE% logs -f
pause
exit /b 0

:stop_service
echo.
echo 🛑 停止服务...
%DOCKER_COMPOSE% down
echo ✅ 服务已停止!
pause
exit /b 0

:rebuild_service
echo.
echo 🔨 重新构建并启动...
%DOCKER_COMPOSE% up --build -d
echo.
echo ✅ 服务已重新构建并启动!
echo 📱 应用地址: http://localhost:6067
pause
exit /b 0

:show_logs
echo.
echo 📋 显示日志 (按 Ctrl+C 退出)...
%DOCKER_COMPOSE% logs -f
pause
exit /b 0

:remove_data
echo.
set /p confirm="⚠️  警告: 此操作将删除所有数据，确定继续吗? (y/N): "
if /i "%confirm%"=="y" (
    echo 🗑️  停止服务并删除数据...
    %DOCKER_COMPOSE% down -v
    echo ✅ 服务已停止，数据已删除!
) else (
    echo ❌ 操作已取消
)
pause
exit /b 0

:build_image
echo.
echo 🔨 构建 Docker 镜像...
docker build -t ug-blog-service:latest .
echo.
echo ✅ 镜像构建完成!
echo 💡 镜像名称: ug-blog-service:latest
pause
exit /b 0

:exit_script
echo 👋 再见!
exit /b 0

:invalid_option
echo ❌ 无效的选项
pause
exit /b 1

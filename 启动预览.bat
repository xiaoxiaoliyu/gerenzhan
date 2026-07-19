@echo off
echo ========== Kai V 个人网站 - 预览服务器 ==========
echo.
cd /d "E:\Codex\网站开发\gerenzhan"
echo [1/2] 正在启动 Vite 开发服务器...
echo.
call node_modules\.bin\vite.cmd --port 3000 --host 127.0.0.1
if errorlevel 1 (
    echo.
    echo [!] 启动失败，尝试使用 npx...
    npx vite --port 3000 --host 127.0.0.1
)
pause

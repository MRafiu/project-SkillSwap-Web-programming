@echo off
title SkillSwap Full-Stack Launcher
echo ========================================================
echo               SkillSwap Full-Stack Launcher
echo ========================================================
echo Checking Node.js installation...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not found in PATH. Please install Node.js.
    pause
    exit /b 1
)

echo Starting SkillSwap Application (Backend Port 5000 + Frontend Port 5173)...
node dev.js
pause

@echo off
echo Right to Read - GitHub Deployment Script
echo =========================================

REM Change to project directory
cd /d "d:\MyProjects\Right to Read"

REM Check if git is available
git --version >nul 2>&1
if errorlevel 1 (
    echo Error: Git is not installed or not in PATH
    echo Please install Git from: https://git-scm.com/downloads
    pause
    exit /b 1
)

echo Git found, proceeding with deployment...

REM Initialize git repository if not exists
if not exist ".git" (
    echo Initializing Git repository...
    git init
)

REM Add remote origin
git remote add origin https://github.com/tishamal/righttoread.git 2>nul

REM Add all files
echo Adding files to Git...
git add .

REM Show status
echo Git Status:
git status

REM Create commit
echo Creating commit...
git commit -m "Initial commit: Right to Read Admin Dashboard - React TypeScript app with Material-UI, authentication, book management, and PDF upload features"

REM Push to GitHub
echo Pushing to GitHub...
git branch -M main
git push -u origin main

echo.
echo Deployment completed successfully!
echo Repository: https://github.com/tishamal/righttoread.git
echo.
pause

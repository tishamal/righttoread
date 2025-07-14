# PowerShell script to commit Right to Read project to GitHub
# Run this script from the project root directory

Write-Host "Right to Read - GitHub Deployment Script" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

# Check if git is available
try {
    $gitVersion = git --version
    Write-Host "Git found: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "Error: Git is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Git from: https://git-scm.com/downloads" -ForegroundColor Yellow
    exit 1
}

# Set location to project directory
Set-Location "d:\MyProjects\Right to Read"

# Initialize git repository if not exists
if (-not (Test-Path ".git")) {
    Write-Host "Initializing Git repository..." -ForegroundColor Yellow
    git init
}

# Add remote origin if not exists
$remotes = git remote
if ($remotes -notcontains "origin") {
    Write-Host "Adding remote repository..." -ForegroundColor Yellow
    git remote add origin https://github.com/tishamal/righttoread.git
}

# Configure git user (you may need to update these)
Write-Host "Configuring Git user..." -ForegroundColor Yellow
# git config user.name "Your Name"
# git config user.email "your.email@example.com"

# Add all files
Write-Host "Adding files to Git..." -ForegroundColor Yellow
git add .

# Check status
Write-Host "Git Status:" -ForegroundColor Cyan
git status

# Create commit
$commitMessage = @"
Initial commit: Right to Read Admin Dashboard

Features implemented:
- React 18 + TypeScript setup with Material-UI
- Professional login page with authentication
- Dashboard with book management system
- Add Book modal with PDF upload functionality
- Grade-based filtering and search
- Dynamic statistics and responsive design
- Modern UI matching design requirements

Tech Stack:
- React 18 with TypeScript
- Material-UI (MUI) v5
- React Scripts for build tooling
- Custom styling with CSS
- PDF upload with drag & drop
- Form validation and state management
"@

Write-Host "Creating commit..." -ForegroundColor Yellow
git commit -m $commitMessage

# Set main branch and push
Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
git branch -M main
git push -u origin main

Write-Host "" -ForegroundColor Green
Write-Host "Deployment completed successfully!" -ForegroundColor Green
Write-Host "Repository: https://github.com/tishamal/righttoread.git" -ForegroundColor Cyan
Write-Host "" -ForegroundColor Green

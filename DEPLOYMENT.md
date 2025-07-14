# Git Deployment Instructions for Right to Read Admin Dashboard

## Prerequisites
Make sure you have Git installed on your system. If not, download it from: https://git-scm.com/downloads

## Steps to Commit to GitHub

### 1. Initialize Git Repository (if not already done)
```bash
cd "d:\MyProjects\Right to Read"
git init
```

### 2. Add Remote Repository
```bash
git remote add origin https://github.com/tishamal/righttoread.git
```

### 3. Configure Git (if first time setup)
```bash
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

### 4. Add All Files
```bash
git add .
```

### 5. Create Initial Commit
```bash
git commit -m "Initial commit: Right to Read Admin Dashboard

Features implemented:
- React 18 + TypeScript setup
- Material-UI dashboard with responsive design
- Login page with authentication
- Book management system with add/edit capabilities
- PDF upload functionality
- Grade-based filtering
- Dynamic statistics
- Professional UI matching design requirements"
```

### 6. Push to GitHub
```bash
git branch -M main
git push -u origin main
```

## Alternative: Using Git Bash or Command Prompt

If PowerShell doesn't recognize git, try:
1. Open Git Bash in the project directory
2. Run the same commands above
3. Or use Command Prompt (cmd) instead of PowerShell

## Subsequent Updates

For future commits:
```bash
git add .
git commit -m "Description of changes"
git push
```

## Project Structure Summary

The project includes:
- `/src/App.tsx` - Main application with dashboard and authentication
- `/src/components/Login.tsx` - Login page component
- `/src/components/AddBookModal.tsx` - Modal for adding new books
- `/src/App.css` - Custom styling
- `/public/index.html` - HTML template with Google Fonts
- `/package.json` - Dependencies and scripts
- `/.gitignore` - Git ignore file
- `/README.md` - Project documentation
- `/.github/copilot-instructions.md` - Development guidelines

## Development Server
```bash
npm start
```
Runs on http://localhost:3001

## Build for Production
```bash
npm run build
```

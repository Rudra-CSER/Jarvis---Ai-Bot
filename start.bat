@echo off
echo Starting Jarvis Bot MERN Stack Voice Assistant...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if .env file exists
if not exist .env (
    echo Warning: .env file not found
    echo Please copy config.env to .env and add your API keys
    echo.
)

REM Install dependencies if node_modules doesn't exist
if not exist node_modules (
    echo Installing dependencies...
    npm install
    echo.
)

REM Start the application
echo Starting servers...
echo Frontend: http://localhost:3000
echo Backend: http://localhost:3001
echo.
npm run dev


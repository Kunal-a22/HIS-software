@echo off
cd /d "%~dp0"
echo Starting Backend Server (Django)...
start cmd /k "cd backend && call venv\Scripts\activate && python manage.py runserver"

echo Starting Frontend Server (React+Vite)...
start cmd /k "cd frontend && npm run dev"

echo Both servers are starting up!

@echo off
echo ==========================================
echo   Smart AI Manager - Automated Setup
echo ==========================================

echo.
echo [1/3] Installing Python dependencies...
python -m pip install -r requirements.txt

echo.
echo [2/3] Installing Node.js dependencies...
call npm install

echo.
echo [3/3] Starting Backend and Frontend...
echo.
echo To stop, press Ctrl+C in this window.
echo Backend will run on http://localhost:8000
echo Frontend will run on http://localhost:3000
echo.

npm start

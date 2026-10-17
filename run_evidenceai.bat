@echo off
title EvidenceAI - Digital Evidence Management and AI Analysis System
cls
echo =====================================================================
echo           EvidenceAI - Digital Evidence Management System
echo =====================================================================
echo.

cd /d "%~dp0"

echo [1/3] Checking MySQL Database status on port 3306...
netstat -ano | findstr :3306 >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [!] MySQL is not detected on port 3306.
    if exist "C:\xampp\mysql\bin\mysqld.exe" (
        echo [*] Attempting to launch XAMPP MySQL daemon...
        start "" "C:\xampp\mysql\bin\mysqld.exe" --defaults-file="C:\xampp\mysql\bin\my.ini" --standalone
        timeout /t 3 /nobreak >nul
    ) else (
        echo [!] Please open XAMPP Control Panel and click START next to MySQL.
    )
) else (
    echo [OK] MySQL is active on port 3306.
)

echo.
echo [2/3] Checking EvidenceAI Virtual Environment and Python...
if not exist "venv\Scripts\python.exe" (
    echo [ERROR] Virtual environment not found at .\venv\Scripts\python.exe!
    echo Please ensure Python venv is installed.
    pause
    exit /b 1
)

echo.
echo [3/3] Checking EvidenceAI Backend Server on port 5000...
netstat -ano | findstr :5000 >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] EvidenceAI backend is already active on port 5000.
) else (
    echo [*] Starting Flask backend server...
    start "EvidenceAI Backend" venv\Scripts\python.exe backend\app.py
    timeout /t 3 /nobreak >nul
)

echo.
echo =====================================================================
echo [SUCCESS] Opening EvidenceAI in your browser: http://127.0.0.1:5000/
echo =====================================================================
start http://127.0.0.1:5000/

echo.
echo System is running! Keep this window or the backend console open.
pause

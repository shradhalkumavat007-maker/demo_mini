@echo off
title ElectroStock FullStack Launcher
echo =======================================================
echo  ElectroStock Full-Stack Inventory & ERP System
echo  Launching Java Backend (8080) and Next.js Frontend (3000)
echo =======================================================

start "ElectroStock Java Backend" cmd /k "%~dp0start-backend.bat"
timeout /t 2 >nul
start "ElectroStock Frontend" cmd /k "%~dp0start-frontend.bat"

echo.
echo Both services have been launched in separate windows!
echo - Java Backend (Oracle XE): http://localhost:8085/api
echo - Next.js App:              http://localhost:3000
echo.
echo =======================================================
echo  Starting Live Terminal Heartbeat Monitor...
echo =======================================================
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0heartbeat-monitor.ps1"


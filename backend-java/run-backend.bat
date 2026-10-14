@echo off
title ElectroStock Java Backend (Port 8080)
echo =======================================================
echo  Starting ElectroStock Java Backend REST API Server
echo =======================================================

cd /d "%~dp0"

if not exist bin mkdir bin

echo Compiling Java source files with javac...
javac -d bin -cp "lib/*" src/main/java/com/electrostock/model/*.java src/main/java/com/electrostock/util/*.java src/main/java/com/electrostock/service/*.java src/main/java/com/electrostock/server/*.java

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Java compilation failed! Please check JDK installation.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo Compilation succeeded! Starting REST API server on port 8080...
echo.
java -cp "bin;lib/*" com.electrostock.server.ElectroStockServer
pause

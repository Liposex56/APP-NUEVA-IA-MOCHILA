@echo off
start "IA en la Mochila - servidor" powershell -NoExit -ExecutionPolicy Bypass -File "%~dp0server.ps1"
timeout /t 2 /nobreak >nul
start "" http://localhost:8080

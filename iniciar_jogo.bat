@echo off
echo ===================================================
echo    Iniciando Missao STELLA (Taquari) - Jogo Espacial
echo ===================================================
start http://localhost:3000
cd /d "%~dp0server"
node server.js
pause


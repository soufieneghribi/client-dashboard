@echo off
echo ============================================
echo  TN360 RAG Chatbot Backend
echo  FastAPI + ChromaDB + Ollama
echo ============================================
echo.

cd /d "%~dp0"

REM Verifier si Ollama est installe
where ollama >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Ollama n'est pas installe!
    echo.
    echo Telechargez Ollama: https://ollama.ai
    echo Puis executez: ollama pull llama3.2
    echo.
    pause
    exit /b 1
)

echo [CHECK] Verification du modele llama3.2...
ollama list | findstr "llama3.2" >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [WARN] Le modele llama3.2 n'est pas installe.
    echo.
    echo Telechargement du modele...
    ollama pull llama3.2
)

echo.
echo [START] Demarrage du backend RAG TN360...
echo [INFO] Backend API: http://localhost:8001
echo [INFO] Documentation: http://localhost:8001/docs
echo [INFO] Frontend React: http://localhost:5175
echo.
echo Appuyez sur CTRL+C pour arreter le serveur
echo.

python -m uvicorn app.main:app --host 0.0.0.0 --port 8001

pause

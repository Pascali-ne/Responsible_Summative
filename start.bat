@echo off
echo ================================================================
echo    Starting Student Finance Tracker
echo ================================================================
echo.

where python >nul 2>nul
if %errorlevel% == 0 (
    echo Python found
    echo Starting server at http://localhost:8000
    echo.
    echo Instructions:
    echo    1. Open browser: http://localhost:8000
    echo    2. Import seed.json from Settings
    echo    3. Explore the app!
    echo.
    echo Press Ctrl+C to stop the server
    echo.
    echo ================================================================
    python -m http.server 8000
) else (
    echo Python not found!
    echo.
    echo Please install Python from: https://www.python.org/downloads/
    echo.
    echo Or double-click index.html to open directly
    echo.
    echo ================================================================
    pause
)

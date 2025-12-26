@echo off
echo Starting local server...
echo.
echo Open your browser and go to:
echo http://localhost:8000/blogs/
echo.
echo Press Ctrl+C to stop the server
echo.
cd /d "%~dp0"
python -m http.server 8000
pause

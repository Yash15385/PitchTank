@echo off
echo ========================================================
echo     PitchTank Android Build and Sync Utility
echo ========================================================
echo.

cd ..
echo [1/3] Building Next.js application...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo Build failed! Check errors above.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [2/3] Syncing web assets to native Android container...
call npx cap sync android
if %ERRORLEVEL% NEQ 0 (
    echo Capacitor sync failed!
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [3/3] Opening Android project in Android Studio (if installed)...
call npx cap open android

echo.
echo ========================================================
echo   SUCCESS: Android project updated!
echo   In Android Studio, click:
echo   Build -> Generate Signed Bundle / APK -> Android App Bundle (.aab)
echo ========================================================
pause

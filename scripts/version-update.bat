@echo off
echo ====================================
echo 📋 포커 모니터 버전 업데이트 도구
echo ====================================
echo.
echo 어떤 업데이트를 하시겠습니까?
echo.
echo 1. Patch (버그 수정, 작은 개선) - v8.7.0 → v8.7.1
echo 2. Minor (새 기능 추가) - v8.7.0 → v8.8.0
echo 3. Major (큰 변경사항) - v8.7.0 → v9.0.0
echo.
set /p choice="선택 (1/2/3): "

if "%choice%"=="1" (
    echo.
    echo 🔧 Patch 업데이트 실행 중...
    node update-version.js patch
) else if "%choice%"=="2" (
    echo.
    echo ✨ Minor 업데이트 실행 중...
    node update-version.js minor
) else if "%choice%"=="3" (
    echo.
    echo 🚀 Major 업데이트 실행 중...
    node update-version.js major
) else (
    echo.
    echo ❌ 잘못된 선택입니다.
    goto end
)

echo.
echo 💡 VERSION.md 파일을 열어서 변경 내용을 작성하세요!
echo.
pause

:end
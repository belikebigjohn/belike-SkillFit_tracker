@echo off
chcp 65001 >nul
setlocal EnableExtensions
title Форма роста — запуск
cd /d "%~dp0"

rem =======================================================================
rem  Запуск сервиса «Форма роста» одним двойным щелчком.
rem
rem  1. ищет Node.js; если его нет или он старше v20 — скачивает
rem     портативную официальную сборку с nodejs.org и сверяет SHA-256;
rem  2. ставит зависимости, если node_modules отсутствует;
rem  3. запускает dev-сервер на свободном порту и открывает браузер.
rem
rem  В систему ничего не устанавливается: Node.js кладётся в
rem  %LOCALAPPDATA%\node-portable. Нужна Windows 10 1803+ — оттуда берутся
rem  встроенные curl.exe и tar.exe.
rem =======================================================================

set "NODE_VERSION=22.23.4"

echo.
echo  ==============================================
echo    ФОРМА РОСТА — фитнес-трекинг с геймификацией
echo  ==============================================
echo.

rem --------------------------- 1. Node.js -------------------------------
echo  [1/3] Ищем Node.js...

if defined PROCESSOR_ARCHITEW6432 set "CPU=%PROCESSOR_ARCHITEW6432%"
if not defined CPU set "CPU=%PROCESSOR_ARCHITECTURE%"
set "ARCH=win-x64"
if /i "%CPU%"=="x86" set "ARCH=win-x86"
if /i "%CPU%"=="arm64" set "ARCH=win-arm64"

set "PORTABLE_DIR=%LOCALAPPDATA%\node-portable"
set "NODE_DIR=%PORTABLE_DIR%\node-v%NODE_VERSION%-%ARCH%"
set "ZIP_URL=https://nodejs.org/dist/v%NODE_VERSION%/node-v%NODE_VERSION%-%ARCH%.zip"

set "MAJOR="
for /f "tokens=1 delims=." %%v in ('node -v 2^>nul') do set "MAJOR=%%v"
if not defined MAJOR (
  echo      Node.js в PATH не найден.
  goto :node_want
)
set "MAJOR=%MAJOR:v=%"
if %MAJOR% GEQ 20 (
  echo      найден в системе: v%MAJOR% — скачивать не нужно.
  goto :node_ready
)
echo      версия v%MAJOR% слишком старая — нужна 20 или новее.

:node_want
echo      Скачаю портативную Node.js v%NODE_VERSION% %ARCH% — около 35 МБ.
echo      Папка: %NODE_DIR%
echo.

if exist "%NODE_DIR%\node.exe" goto :node_use

where curl.exe >nul 2>nul
if errorlevel 1 goto :no_curl
where tar.exe >nul 2>nul
if errorlevel 1 goto :no_tar

set "ZIP=%TEMP%\node-%RANDOM%.zip"
echo      Скачиваю %ZIP_URL%
curl.exe -fSL --progress-bar --retry 3 --connect-timeout 20 -o "%ZIP%" "%ZIP_URL%"
if errorlevel 1 goto :download_failed

rem --- сверяем SHA-256 с официальным списком nodejs.org -------------------
set "WANT="
set "HAVE="
curl.exe -fsL -o "%TEMP%\node-shasums.txt" "https://nodejs.org/dist/v%NODE_VERSION%/SHASUMS256.txt" 2>nul
if not exist "%TEMP%\node-shasums.txt" goto :node_extract
for /f "tokens=1" %%h in ('findstr /i /c:"node-v%NODE_VERSION%-%ARCH%.zip" "%TEMP%\node-shasums.txt"') do set "WANT=%%h"
for /f "skip=1 delims=" %%h in ('certutil -hashfile "%ZIP%" SHA256 2^>nul') do if not defined HAVE set "HAVE=%%h"
if defined HAVE set "HAVE=%HAVE: =%"
if not defined WANT goto :node_unverified
if not defined HAVE goto :node_unverified
if /i "%WANT%"=="%HAVE%" goto :node_verified
goto :checksum_failed

:node_verified
echo      SHA-256 совпал с указанной на nodejs.org.
goto :node_extract

:node_unverified
echo      Контрольную сумму проверить не удалось — ставим без проверки.

:node_extract
del "%TEMP%\node-shasums.txt" 2>nul
if not exist "%PORTABLE_DIR%" mkdir "%PORTABLE_DIR%"
echo      Распаковываю...
tar.exe -xf "%ZIP%" -C "%PORTABLE_DIR%"
if errorlevel 1 goto :extract_failed
if not exist "%NODE_DIR%\node.exe" goto :extract_failed
del "%ZIP%" 2>nul
echo      Готово.

:node_use
set "PATH=%NODE_DIR%;%PATH%"
echo      Использую Node.js из %NODE_DIR%

:node_ready
where npm.cmd >nul 2>nul
if errorlevel 1 goto :no_npm
for /f "delims=" %%v in ('node -v 2^>nul') do echo      Node.js %%v
echo.

rem -------------------------- 2. Зависимости -----------------------------
echo  [2/3] Проверяем зависимости...
if exist "node_modules\.package-lock.json" if exist "node_modules\.bin\next.cmd" goto :deps_ready

echo      Ставлю пакеты по package-lock.json — обычно около минуты.
echo      Замечание про --ignore-scripts: у better-sqlite3 готовый бинарник
echo      лежит прямо в пакете, но npm всё равно дёргает node-gyp, а тот
echo      требует Visual Studio и падает на машине без него. Флаг этот шаг
echo      пропускает — собирать ничего не нужно.
call npm.cmd install --no-audit --fund=false --ignore-scripts
if errorlevel 1 goto :install_failed

:deps_ready
echo      Всё на месте.
echo.

rem ----------------------------- 3. Запуск -------------------------------
echo  [3/3] Запускаю dev-сервер...

set "PORT=3000"
:find_port
rem Ищем свободный порт. Без блока в скобках: внутри них cmd подставляет
rem %PORT% один раз при разборе, а не после set /a — зациклило бы или дало
rem неверный диапазон.
netstat -ano | findstr /c:":%PORT% " | findstr /i /c:"LISTENING" >nul 2>nul
if errorlevel 1 goto :port_free
set /a PORT+=1
if %PORT% GEQ 3011 (
  echo      Порты 3000-3010 заняты — беру 3000, разбираться будет Next.
  set "PORT=3000"
  goto :port_free
)
goto :find_port
:port_free
echo      Порт: %PORT%
echo      Адрес откроется в браузере сам, когда сервер соберёт страницу.
echo      Демо-логин — в README.md
echo      Остановить: Ctrl+C в этом окне или закрыть окно.
echo.
start "" /min cmd /c "ping -n 21 127.0.0.1 >nul & start http://localhost:%PORT%"
call npm.cmd run dev -- --port %PORT%
echo.
echo      Dev-сервер остановлен.
goto :finish

rem ------------------------------ Ошибки ----------------------------------
:no_curl
echo.
echo  ОШИБКА: в системе нет curl.exe — он есть в Windows 10 версии 1803 и новее.
echo  Установите Node.js LTS вручную: https://nodejs.org/ru/download
goto :fail

:no_tar
echo.
echo  ОШИБКА: нет tar.exe для распаковки — нужна Windows 10 1803 и новее.
echo  Установите Node.js LTS вручную: https://nodejs.org/ru/download
goto :fail

:download_failed
echo.
echo  ОШИБКА: Node.js скачать не удалось. Проверьте интернет.
echo  Прямая ссылка: %ZIP_URL%
echo  Если сеть корпоративная или через прокси — установите Node.js LTS сами
echo  https://nodejs.org/ru/download  и запустите этот файл снова.
goto :fail

:checksum_failed
echo.
echo  ОШИБКА: SHA-256 архива не совпал с официальным — файл повреждён или подменён.
echo  Ожидался: %WANT%
echo  Получен:  %HAVE%
goto :fail

:extract_failed
echo.
echo  ОШИБКА: архив распаковать не удалось.
echo  Удалите папку %PORTABLE_DIR% и запустите файл снова.
goto :fail

:no_npm
echo.
echo  ОШИБКА: рядом с node.exe не нашёлся npm — Node.js установлен неполно.
echo  Переустановите его с https://nodejs.org/ru/download
goto :fail

:install_failed
echo.
echo  ОШИБКА: npm install не прошёл. Частые причины:
echo    - нет интернета или он за прокси;
echo    - кэш скачался криво — удалите папку node_modules и попробуйте снова;
echo    - для вашей платформы нет готового бинарника better-sqlite3 - тогда
echo      нужна Node.js 20/22/24 и Visual Studio с workload "C++".
echo.
echo  Диагностика: npm install --ignore-scripts --verbose
goto :fail

:fail
echo.
echo  Запуск прерван. Разберитесь с ошибкой выше и запустите файл снова.
pause
exit /b 1

:finish
echo.
pause
exit /b 0

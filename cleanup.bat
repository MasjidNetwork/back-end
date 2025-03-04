@echo off
echo Cleaning up generated files...

:: Remove build output
echo Removing dist directory...
if exist dist rmdir /s /q dist

:: Remove documentation
echo Removing generated documentation...
if exist docs rmdir /s /q docs
if exist postman rmdir /s /q postman

:: Remove logs
echo Removing logs...
if exist logs rmdir /s /q logs

:: Remove cache
echo Removing cache files...
if exist .eslintcache del .eslintcache
if exist node_modules\.cache rmdir /s /q node_modules\.cache

:: Remove coverage reports
echo Removing test coverage reports...
if exist coverage rmdir /s /q coverage

echo Cleanup complete! 
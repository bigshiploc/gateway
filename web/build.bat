npm install
npm run build
rmdir /s /q ..\gateway\public\
mkdir ..\gateway\public\
xcopy /s dist\* ..\gateway\public\
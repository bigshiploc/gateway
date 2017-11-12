call npm install
cd web
call npm install
call npm run build
cd ..
rmdir /S /Q public
mkdir public
xcopy /s web\dist\* public\
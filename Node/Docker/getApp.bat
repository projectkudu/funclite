del package.json
rmdir /S /Q out
rmdir /S /Q FunctionsRoot
copy ..\src\FuncLiteNodeServer\package.json .
robocopy ..\src\FuncLiteNodeServer\out .\out /E
robocopy ..\src\FuncLiteNodeServer\FunctionsRoot .\FunctionsRoot /E
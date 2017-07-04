$CurrentDir = (Get-Item -Path ".\" -Verbose).FullName
$SiteExtensionPath = "./siteextensions"
$SiteExtensionsZip = "./siteextensions.zip"
$ZipPath = Join-Path -Path $CurrentDir -ChildPath siteextensions

Remove-Item $SiteExtensionPath/* -Recurse -ErrorAction SilentlyContinue
Remove-Item $SiteExtensionsZip -ErrorAction SilentlyContinue
New-Item $SiteExtensionPath/funclite -type directory
Copy-Item .\node_modules $SiteExtensionPath/funclite -recurse
Copy-Item .\applicationHost.xdt $SiteExtensionPath/funclite
Copy-Item .\web.config $SiteExtensionPath/funclite
Copy-Item .\tsconfig.json $SiteExtensionPath/funclite
Copy-Item .\out\*.js $SiteExtensionPath/funclite

Compress-Archive -Path $Zippath -DestinationPath $Zippath

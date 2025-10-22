# Downloads required fonts into public/fonts/
# Usage: powershell -ExecutionPolicy Bypass -File .\scripts\download-fonts.ps1

$fontsDir = Join-Path -Path $PSScriptRoot -ChildPath "..\public\fonts"
$fontsDir = Resolve-Path $fontsDir
if (-not (Test-Path $fontsDir)) { New-Item -ItemType Directory -Path $fontsDir | Out-Null }

Write-Host "Fonts will be downloaded to: $fontsDir"

$families = @(
    "https://fonts.googleapis.com/css2?family=ZCOOL+XiaoWei",
    "https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;700"
)

function Download-Woff2FromCss($cssUrl) {
    Write-Host "Fetching CSS: $cssUrl"
    $css = (Invoke-RestMethod -Uri $cssUrl -UseBasicParsing) -as [string]
    if (-not $css) { Write-Error "Failed to fetch CSS from $cssUrl"; return }

    # find woff2 urls
    $matches = [regex]::Matches($css, "https://[^)\s]+\.woff2")
    foreach ($m in $matches) {
        $woff = $m.Value
        $fileName = [IO.Path]::GetFileName($woff)
        $target = Join-Path $fontsDir $fileName
        if (Test-Path $target) { Write-Host "Already exists: $fileName"; continue }
        Write-Host "Downloading $woff -> $fileName"
        try {
            Invoke-WebRequest -Uri $woff -OutFile $target -UseBasicParsing
        } catch {
            Write-Warning "Failed to download $woff : $_"
        }
    }
}

foreach ($f in $families) { Download-Woff2FromCss $f }

Write-Host "Done. You may need to rename files to the expected names listed in public/fonts/README.md if necessary."
# Move likely dev/temp images out of public/images into scripts/archive

$src = Join-Path $PSScriptRoot '..\public\images'
$dest = Join-Path $PSScriptRoot 'archive\images'

Write-Host "Scanning $src for dev artifacts..."

$patterns = @('preview','trans','temp','-preview','_preview')

Get-ChildItem -Path $src -File -Recurse | Where-Object {
    $name = $_.Name.ToLower()
    $patterns | ForEach-Object { if ($name -like "*$_*") { return $true } }
    return $false
} | ForEach-Object {
    $targetDir = Split-Path (Join-Path $dest $_.DirectoryName.Substring($src.Length)) -Parent
    if (-not (Test-Path $targetDir)) { New-Item -ItemType Directory -Path $targetDir -Force | Out-Null }
    $target = Join-Path $targetDir $_.Name
    Write-Host "Moving $($_.FullName) -> $target"
    Move-Item -Path $_.FullName -Destination $target -Force
}

Write-Host "Done. Archived dev images to $dest"

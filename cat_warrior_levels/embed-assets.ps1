<#
.SYNOPSIS
    Bakes the character portraits into a single standalone HTML file.

.DESCRIPTION
    cat-warrior-levels.html loads assets\jacob.png and assets\isaac.png by relative path.
    This script reads those images, base64-encodes them, and rewrites the portrait paths in
    the CHARACTERS config as inline data URIs, producing cat-warrior-levels.standalone.html.

    The result is one file that can be copied anywhere on its own.

    Missing images are skipped with a warning; the app falls back to its drawn SVG art for
    any character whose portrait was not embedded.

.EXAMPLE
    .\embed-assets.ps1
#>

[CmdletBinding()]
param(
    [string]$Source = (Join-Path $PSScriptRoot 'cat-warrior-levels.html'),
    [string]$Destination = (Join-Path $PSScriptRoot 'cat-warrior-levels.standalone.html')
)

$ErrorActionPreference = 'Stop'

if (-not (Test-Path -LiteralPath $Source)) {
    throw "Source file not found: $Source"
}

$html = Get-Content -LiteralPath $Source -Raw
$assetDir = Join-Path $PSScriptRoot 'assets'
$embedded = 0

# Find every portrait path the config declares, e.g.  portrait:"assets/jacob.png"
$matches = [regex]::Matches($html, 'portrait:\s*"(?<path>assets/[^"]+)"')

foreach ($m in $matches) {
    $rel = $m.Groups['path'].Value
    $file = Join-Path $assetDir (Split-Path $rel -Leaf)

    if (-not (Test-Path -LiteralPath $file)) {
        Write-Warning "Missing portrait, leaving as-is (drawn art will be used): $rel"
        continue
    }

    $ext = ([System.IO.Path]::GetExtension($file)).TrimStart('.').ToLowerInvariant()
    $mime = switch ($ext) {
        'png'  { 'image/png' }
        'jpg'  { 'image/jpeg' }
        'jpeg' { 'image/jpeg' }
        'webp' { 'image/webp' }
        'gif'  { 'image/gif' }
        default { throw "Unsupported image type '$ext' for $file" }
    }

    $b64 = [Convert]::ToBase64String([System.IO.File]::ReadAllBytes($file))
    $dataUri = "data:$mime;base64,$b64"

    # Replace only this exact declaration, not every occurrence of the filename.
    $html = $html.Replace("portrait:`"$rel`"", "portrait:`"$dataUri`"")
    $embedded++

    $kb = [math]::Round((Get-Item -LiteralPath $file).Length / 1KB, 1)
    Write-Host "Embedded $rel ($kb KB)"
}

if ($embedded -eq 0) {
    Write-Warning "No portraits were embedded. Put jacob.png and isaac.png in $assetDir first."
}

Set-Content -LiteralPath $Destination -Value $html -Encoding UTF8

$outKb = [math]::Round((Get-Item -LiteralPath $Destination).Length / 1KB, 1)
Write-Host ""
Write-Host "Wrote $Destination ($outKb KB, $embedded portrait(s) embedded)" -ForegroundColor Green

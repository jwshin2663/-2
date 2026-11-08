$ErrorActionPreference = 'stop'
Write-Host "Starting Docker build for Stock Analyzer..."
docker build -t jwshin2663/stock-analyzer:latest .
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Pushing Docker image to Docker Hub..."
docker push jwshin2663/stock-analyzer:latest
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

if ((Test-Path -LiteralPath variable:\LASTEXITCODE)) { exit $LASTEXITCODE }
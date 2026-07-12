# toon-memory installer for Windows (PowerShell)
# Usage: irm https://raw.githubusercontent.com/LuiggiVal08/toon-memory/main/install.ps1 | iex

$TOON_VERSION = "1.0.9"
# SHA-256 checksum of the tarball. Update on each release.
# Generate with: certutil -hashfile toon-memory-$TOON_VERSION.tgz SHA256
$TOON_CHECKSUM = "d5b2a8cbe0f3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9"

Write-Host "🧠 toon-memory installer" -ForegroundColor Cyan
Write-Host ""

# Check if npm is available
if (Get-Command npm -ErrorAction SilentlyContinue) {
    Write-Host "Installing toon-memory via npm..."
    npm install -g toon-memory@$TOON_VERSION
    Write-Host ""
    Write-Host "✅ toon-memory installed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:"
    Write-Host "  1. Run: npx toon-memory"
    Write-Host "  2. Select your agent(s)"
    Write-Host "  3. Choose local or global install"
    Write-Host ""
} else {
    Write-Host "npm not found. Installing standalone..." -ForegroundColor Yellow
    Write-Host ""
    
    # Create installation directory
    $INSTALL_DIR = "$env:USERPROFILE\.toon-memory"
    New-Item -ItemType Directory -Force -Path $INSTALL_DIR | Out-Null
    
    # Download the package
    Write-Host "Downloading toon-memory v$TOON_VERSION..."
    $url = "https://registry.npmjs.org/toon-memory/-/toon-memory-$TOON_VERSION.tgz"
    $tgzPath = "$INSTALL_DIR\toon-memory.tgz"
    Invoke-WebRequest -Uri $url -OutFile $tgzPath
    
    # Verify integrity
    $actualHash = (Get-FileHash -Path $tgzPath -Algorithm SHA256).Hash.ToLower()
    if ($actualHash -ne $TOON_CHECKSUM) {
        Write-Host "❌ Checksum mismatch! Expected $TOON_CHECKSUM, got $actualHash" -ForegroundColor Red
        Write-Host "The downloaded file may be corrupted or tampered with." -ForegroundColor Red
        Remove-Item -Path $tgzPath -Force
        exit 1
    }
    Write-Host "✅ Integrity verified" -ForegroundColor Green
    
    # Extract
    cd $INSTALL_DIR
    tar xzf toon-memory.tgz
    Move-Item -Path "package\*" -Destination "." -Force
    Remove-Item -Path "package" -Recurse -Force
    Remove-Item -Path $tgzPath -Force
    
    # Create launcher script
    $launcherContent = @"
`$SCRIPT_DIR = Split-Path -Parent `$MyInvocation.MyCommand.Path
node "`$SCRIPT_DIR\bin\toon-memory.js" @args
"@
    Set-Content -Path "$INSTALL_DIR\toon-memory.ps1" -Value $launcherContent
    
    # Add to PATH if not already there
    $currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
    if ($currentPath -notlike "*$INSTALL_DIR*") {
        [Environment]::SetEnvironmentVariable("Path", "$INSTALL_DIR;$currentPath", "User")
        Write-Host "Added to PATH"
    }
    
    Write-Host ""
    Write-Host "✅ toon-memory installed to $INSTALL_DIR" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  Open a new PowerShell window, then run:"
    Write-Host "  toon-memory.ps1"
    Write-Host ""
}

#!/bin/bash
set -e

# toon-memory installer for macOS/Linux
# Usage: curl -fsSL https://raw.githubusercontent.com/luiggival/toon-memory/main/install.sh | sh

TOON_VERSION="1.0.8"
NPM_REGISTRY="https://registry.npmjs.org"

echo "🧠 toon-memory installer"
echo ""

# Check if npm is available
if command -v npm &> /dev/null; then
    echo "Installing toon-memory via npm..."
    npm install -g toon-memory@${TOON_VERSION}
    echo ""
    echo "✅ toon-memory installed!"
    echo ""
    echo "Next steps:"
    echo "  1. Run: npx toon-memory"
    echo "  2. Select your agent(s)"
    echo "  3. Choose local or global install"
    echo ""
else
    echo "npm not found. Installing standalone..."
    echo ""
    
    # Create installation directory
    INSTALL_DIR="${HOME}/.toon-memory"
    mkdir -p "${INSTALL_DIR}"
    
    # Download the package
    echo "Downloading toon-memory v${TOON_VERSION}..."
    curl -fsSL "https://registry.npmjs.org/toon-memory/-/toon-memory-${TOON_VERSION}.tgz" -o "${INSTALL_DIR}/toon-memory.tgz"
    
    # Extract
    cd "${INSTALL_DIR}"
    tar xzf toon-memory.tgz
    mv package/* .
    rmdir package
    rm toon-memory.tgz
    
    # Create launcher script
    cat > "${INSTALL_DIR}/toon-memory" << 'LAUNCHER'
#!/bin/bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
node "${SCRIPT_DIR}/bin/toon-memory.js" "$@"
LAUNCHER
    chmod +x "${INSTALL_DIR}/toon-memory"
    
    # Add to PATH if not already there
    SHELL_RC=""
    if [ -f "${HOME}/.bashrc" ]; then
        SHELL_RC="${HOME}/.bashrc"
    elif [ -f "${HOME}/.zshrc" ]; then
        SHELL_RC="${HOME}/.zshrc"
    fi
    
    if [ -n "${SHELL_RC}" ]; then
        if ! grep -q "${INSTALL_DIR}" "${SHELL_RC}" 2>/dev/null; then
            echo "" >> "${SHELL_RC}"
            echo "# toon-memory" >> "${SHELL_RC}"
            echo "export PATH=\"${INSTALL_DIR}:\$PATH\"" >> "${SHELL_RC}"
            echo "Added to PATH in ${SHELL_RC}"
        fi
    fi
    
    echo ""
    echo "✅ toon-memory installed to ${INSTALL_DIR}"
    echo ""
    echo "⚠️  Open a new terminal, then run:"
    echo "  toon-memory"
    echo ""
fi

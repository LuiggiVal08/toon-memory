#!/bin/bash
set -e

# toon-memory uninstaller
# Usage: npx toon-memory uninstall

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🧠 toon-memory uninstaller"
echo ""

# Helper: remove toon-memory from a config file
remove_from_config() {
    local file="$1"
    if [ -f "${file}" ]; then
        node "${SCRIPT_DIR}/scripts/remove-mcp.js" "${file}"
    fi
}

# OpenCode
remove_from_config "${HOME}/.config/opencode/opencode.json"
remove_from_config ".opencode/opencode.json"

# VS Code
remove_from_config ".vscode/mcp.json"

# Claude
remove_from_config "${HOME}/.claude/settings.json"
remove_from_config ".claude/settings.json"

# Cursor
remove_from_config ".cursor/mcp.json"

# Windsurf
remove_from_config "${HOME}/.codeium/windsurf/mcp_config.json"

# Cline
remove_from_config ".cline/mcp.json"

# Continue
remove_from_config ".continue/config.json"

# Remove custom tools if they exist
if [ -d ".opencode/tools" ]; then
    if [ -f ".opencode/tools/memory.ts" ]; then
        echo "Removing custom tools..."
        rm -f ".opencode/tools/memory.ts"
        echo "  ✅ Removed memory.ts"
    fi
fi

# Remove memory file (ask user)
if [ -f ".opencode/memory/data.toon" ]; then
    echo ""
    read -p "Remove memory file (.opencode/memory/data.toon)? [y/N] " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -rf ".opencode/memory"
        echo "  ✅ Removed memory directory"
    fi
fi

# Uninstall npm package
echo ""
read -p "Uninstall toon-memory CLI? [y/N] " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if command -v npm &> /dev/null; then
        npm uninstall -g toon-memory 2>/dev/null && echo "  ✅ Uninstalled from npm" || echo "  ⚠️  Not installed via npm"
    fi
    
    # Remove standalone install
    if [ -d "${HOME}/.toon-memory" ]; then
        rm -rf "${HOME}/.toon-memory"
        echo "  ✅ Removed standalone install"
    fi
    
    # Remove from PATH in shell configs
    for rc in "${HOME}/.bashrc" "${HOME}/.zshrc"; do
        if [ -f "${rc}" ] && grep -q "toon-memory" "${rc}" 2>/dev/null; then
            sed -i '/# toon-memory/d;/.toon-memory/d' "${rc}"
            echo "  ✅ Cleaned ${rc}"
        fi
    done
fi

echo ""
echo "✅ toon-memory uninstalled"
echo ""

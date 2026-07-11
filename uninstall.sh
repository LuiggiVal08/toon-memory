#!/bin/bash
set -e

# toon-memory uninstaller
# Usage: npx toon-memory uninstall

echo "🧠 toon-memory uninstaller"
echo ""

# Remove from OpenCode
OPENCODE_GLOBAL="${HOME}/.config/opencode/opencode.json"
OPENCODE_LOCAL=".opencode/opencode.json"

remove_from_config() {
    local file="$1"
    local name="$2"
    
    if [ -f "${file}" ]; then
        if grep -q "toon-memory" "${file}" 2>/dev/null; then
            echo "Removing from ${name} (${file})..."
            # Use node to remove the MCP entry
            node -e "
                const fs = require('fs');
                const config = JSON.parse(fs.readFileSync('${file}', 'utf-8'));
                if (config.mcp && config.mcp['toon-memory']) {
                    delete config.mcp['toon-memory'];
                    fs.writeFileSync('${file}', JSON.stringify(config, null, 2));
                    console.log('  ✅ Removed');
                } else if (config.mcpServers && config.mcpServers['toon-memory']) {
                    delete config.mcpServers['toon-memory'];
                    fs.writeFileSync('${file}', JSON.stringify(config, null, 2));
                    console.log('  ✅ Removed');
                } else {
                    console.log('  ⚠️  Not found');
                }
            " 2>/dev/null || echo "  ⚠️  Could not parse config"
        fi
    fi
}

# OpenCode
remove_from_config "${OPENCODE_GLOBAL}" "OpenCode (global)"
remove_from_config "${OPENCODE_LOCAL}" "OpenCode (local)"

# VS Code
remove_from_config ".vscode/mcp.json" "VS Code"

# Claude
remove_from_config "${HOME}/.claude/settings.json" "Claude (global)"
remove_from_config ".claude/settings.json" "Claude (local)"

# Cursor
remove_from_config ".cursor/mcp.json" "Cursor"

# Cline
remove_from_config ".cline/mcp.json" "Cline"

# Continue
remove_from_config ".continue/config.json" "Continue"

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

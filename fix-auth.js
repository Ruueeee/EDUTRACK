const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        const dirPath = path.join(dir, f);
        const isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
    });
}

function processFile(filePath) {
    if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) return;

    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // Replace import { getServerSession } from "next-auth/next" or "next-auth"
    if (content.includes('getServerSession')) {
        content = content.replace(/import\s*\{\s*getServerSession\s*\}\s*from\s*['"]next-auth(?:\/next)?['"];?/g, 'import { auth } from "@/lib/auth";');
        // Remove import { authOptions } from "@/lib/auth"
        content = content.replace(/import\s*\{\s*authOptions\s*\}\s*from\s*['"]@\/lib\/auth['"];?/g, '');

        // Replace getServerSession(authOptions) with auth()
        content = content.replace(/getServerSession\(\s*authOptions\s*\)/g, 'auth()');

        // Replace remaining getServerSession() just in case
        content = content.replace(/getServerSession\(\s*\)/g, 'auth()');

        changed = true;
    }

    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Fixed', filePath);
    }
}

walk(path.join(__dirname, 'src'), processFile);
console.log('Done!');

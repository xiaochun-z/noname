import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 80;
const ROOT_DIR = __dirname;
const FS_SERVER_HOST = '127.0.0.1';
const FS_SERVER_PORT = 8089;

// Production Vue path
const VUE_PROD_PATH = path.join(ROOT_DIR, 'node_modules', 'vue', 'dist', 'vue.esm-browser.prod.js');

// FS API proxy endpoints
const PROXY_PATHS = [
    '/checkFile',
    '/checkDir',
    '/readFile',
    '/readFileAsText',
    '/writeFile',
    '/removeFile',
    '/getFileList',
    '/createDir',
    '/removeDir'
];

const MIME_TYPES = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.mjs': 'text/javascript',
    '.ts': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.wav': 'audio/wav',
    '.mp3': 'audio/mpeg',
    '.ogg': 'audio/ogg',
    '.ttf': 'font/ttf',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.wasm': 'application/wasm',
    '.map': 'application/json'
};

const server = http.createServer((req, res) => {
    const urlPath = req.url.split('?')[0];

    // ========================================================================
    // Vue Production Build Redirect
    // ========================================================================
    // Force production Vue build to eliminate development warnings
    if (urlPath.includes('vue.esm-browser.js') || urlPath === '/vue' || urlPath.startsWith('/vue/')) {
        fs.readFile(VUE_PROD_PATH, (err, content) => {
            if (err) {
                console.error(`[Vue Error] Production Vue not found at ${VUE_PROD_PATH}`);
                res.writeHead(404);
                res.end('Vue Not Found');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/javascript' });
                res.end(content, 'utf-8');
            }
        });
        return;
    }

    // ========================================================================
    // Mode File Smart Resolution
    // ========================================================================
    // Game tries mode/xxx/index.js first, then falls back to mode/xxx.js
    // This proactively resolves the correct file to avoid unnecessary 404s
    const modeMatch = urlPath.match(/^\/mode\/([^/]+)\/index\.js$/);
    if (modeMatch) {
        const modeName = modeMatch[1];
        const indexJsPath = path.join(ROOT_DIR, 'mode', modeName, 'index.js');
        const modeJsPath = path.join(ROOT_DIR, 'mode', `${modeName}.js`);

        // Try mode/xxx/index.js first (directory-based mode like guozhan)
        fs.stat(indexJsPath, (err, stats) => {
            if (!err && stats.isFile()) {
                fs.readFile(indexJsPath, (err, content) => {
                    if (err) {
                        res.writeHead(404);
                        res.end('File Not Found');
                    } else {
                        res.writeHead(200, { 'Content-Type': 'text/javascript' });
                        res.end(content, 'utf-8');
                    }
                });
                return;
            }

            // Fall back to mode/xxx.js (single-file mode like chess, identity)
            fs.stat(modeJsPath, (err, stats) => {
                if (!err && stats.isFile()) {
                    console.log(`[Mode] ${urlPath} -> /mode/${modeName}.js`);
                    fs.readFile(modeJsPath, (err, content) => {
                        if (err) {
                            res.writeHead(404);
                            res.end('File Not Found');
                        } else {
                            res.writeHead(200, { 'Content-Type': 'text/javascript' });
                            res.end(content, 'utf-8');
                        }
                    });
                } else {
                    res.writeHead(404);
                    res.end('File Not Found');
                }
            });
        });
        return;
    }

    // ========================================================================
    // JIT Test Virtual File
    // ========================================================================
    // Provides a virtual ES module for JIT TypeScript compilation detection
    if (urlPath.endsWith('jit-test.ts')) {
        res.writeHead(200, { 'Content-Type': 'text/javascript' });
        res.end('export const test = "ok";', 'utf-8');
        return;
    }

    // ========================================================================
    // FS API Proxy
    // ========================================================================
    if (PROXY_PATHS.some(p => urlPath.startsWith(p))) {
        const options = {
            hostname: FS_SERVER_HOST,
            port: FS_SERVER_PORT,
            path: req.url,
            method: req.method,
            headers: req.headers
        };

        const proxyReq = http.request(options, (proxyRes) => {
            res.writeHead(proxyRes.statusCode, proxyRes.headers);
            proxyRes.pipe(res, { end: true });
        });

        proxyReq.on('error', (e) => {
            console.error(`[Proxy Error] ${req.url} -> :${FS_SERVER_PORT} | ${e.message}`);
            res.writeHead(502);
            res.end('Bad Gateway: FS Server not reachable');
        });

        req.pipe(proxyReq, { end: true });
        return;
    }

    // ========================================================================
    // Static File Serving
    // ========================================================================
    const filePath = path.join(ROOT_DIR, urlPath === '/' ? 'index.html' : urlPath);

    // Security check: prevent directory traversal
    if (!filePath.startsWith(ROOT_DIR)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    fs.stat(filePath, (err, stats) => {
        if (err) {
            res.writeHead(404);
            res.end('File Not Found');
            return;
        }

        if (stats.isDirectory()) {
            res.writeHead(404);
            res.end('Directory listing forbidden');
            return;
        }

        const extname = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[extname] || 'application/octet-stream';

        fs.readFile(filePath, (err, content) => {
            if (err) {
                res.writeHead(500);
                res.end('Internal Server Error');
            } else {
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content, 'utf-8');
            }
        });
    });
});

server.listen(PORT, () => {
    console.log(`HTTP server running at http://localhost:${PORT}/`);
    console.log(`Proxying FS API to ${FS_SERVER_HOST}:${FS_SERVER_PORT}`);
});
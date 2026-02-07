import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 80;
const ROOT_DIR = __dirname;
const FS_SERVER_HOST = '127.0.0.1';
const FS_SERVER_PORT = 8089;

// 这些 API 请求会被转发给 fs-server (Port 8089)
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
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp3': 'audio/mpeg',
    '.ogg': 'audio/ogg',
    '.ttf': 'font/ttf',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2'
};

const server = http.createServer((req, res) => {
    // ============================================================
    // 0. 特殊资源处理
    // ============================================================
    
    // [Vue 映射修复]
    // 浏览器请求 "/vue" 时，直接返回 node_modules 中的构建文件
    if (req.url === '/vue') {
        const vuePath = path.join(ROOT_DIR, 'node_modules', 'vue', 'dist', 'vue.esm-browser.js');
        fs.readFile(vuePath, (err, content) => {
            if (err) {
                console.error(`[Read Error] Vue not found at ${vuePath}`);
                res.writeHead(404);
                res.end('Vue Not Found');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/javascript' });
                res.end(content, 'utf-8');
            }
        });
        return;
    }

    // 注意：我们移除了 /preload.js 的处理。
    // 让它返回 404 (File Not Found) 是预期的行为。
    // 这样 noname.js 里的 import('/preload.js').catch(...) 才会触发，
    // 从而加载 ./init/browser.js 并正确初始化 checkFile 等 API。

    // ============================================================
    // 1. 处理 API 代理 (转发给 fs-server)
    // ============================================================
    if (PROXY_PATHS.some(p => req.url.startsWith(p))) {
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
            // 连接 fs-server 失败时的日志
            console.error(`[Proxy Error] ${req.url} -> :${FS_SERVER_PORT} | ${e.message}`);
            res.writeHead(502);
            res.end('Bad Gateway: FS Server not reachable');
        });

        req.pipe(proxyReq, { end: true });
        return;
    }

    // ============================================================
    // 2. 处理静态文件 (Web Server)
    // ============================================================
    let urlPath = req.url.split('?')[0];
    let filePath = path.join(ROOT_DIR, urlPath === '/' ? 'index.html' : urlPath);
    
    // 安全检查：防止目录遍历
    if (!filePath.startsWith(ROOT_DIR)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    fs.stat(filePath, (err, stats) => {
        if (err) {
            // 404 是正常现象，游戏会尝试探测很多文件
            // console.log(`[404] ${req.url}`); 
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
    console.log(`HTTP Static Server running at http://localhost:${PORT}/`);
    console.log(`> Proxying FS API to ${FS_SERVER_HOST}:${FS_SERVER_PORT}`);
});
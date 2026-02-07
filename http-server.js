import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 80;
const ROOT_DIR = __dirname;
const FS_SERVER_HOST = '127.0.0.1';
const FS_SERVER_PORT = 8089;

// 预定义 Vue 生产版本路径
const VUE_PROD_PATH = path.join(ROOT_DIR, 'node_modules', 'vue', 'dist', 'vue.esm-browser.prod.js');

// 这些 API 请求会被转发给运行在 8089 端口的 fs-server
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
    '.ts': 'text/javascript', // 确保 TS 文件以 JS 模块形式解析以支持 JIT
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
    // 0. 特殊资源处理 (关键修复逻辑)
    // ============================================================
    
    // 拦截所有包含 vue.esm-browser.js 的请求，确保使用生产版以消除警告
    if (req.url.includes('vue.esm-browser.js') || req.url === '/vue') {
        fs.readFile(VUE_PROD_PATH, (err, content) => {
            if (err) {
                console.error(`[Read Error] Production Vue not found at ${VUE_PROD_PATH}`);
                res.writeHead(404);
                res.end('Vue Not Found');
            } else {
                console.log(`[Rewrite] Redirecting ${req.url} to Production Vue`);
                res.writeHead(200, { 'Content-Type': 'text/javascript' });
                res.end(content, 'utf-8');
            }
        });
        return;
    }

    // 强制返回合法的 jit-test.ts 内容，防止 Missing initializer 错误导致 SW 崩溃
    if (req.url.endsWith('jit-test.ts')) {
        res.writeHead(200, { 'Content-Type': 'text/javascript' });
        res.end('export const test = "ok";', 'utf-8');
        return;
    }

    // 注意：故意不处理 /preload.js，让其返回 404 以触发游戏内部的浏览器环境回退逻辑

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
            // 404 是正常现象，游戏会尝试探测很多扩展文件
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
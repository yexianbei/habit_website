/**
 * 构建后把 H5 版本注入到 dist/index.html，供客户端 WebView 从页面读取版本（无需单独请求 version.json）。
 */
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
const version = pkg.version || '1.0.0';

const indexPath = resolve(root, 'dist', 'index.html');
let html = readFileSync(indexPath, 'utf8');
const meta = `<meta name="h5-version" content="${version}">`;
if (html.includes('name="h5-version"')) {
  html = html.replace(/<meta name="h5-version" content="[^"]*">/, meta);
} else {
  html = html.replace(/<head>/, `<head>\n    ${meta}`);
}
writeFileSync(indexPath, html, 'utf8');
console.log('Injected h5-version into dist/index.html:', version);

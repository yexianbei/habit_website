/**
 * 构建时生成 version.json，供客户端（Android/iOS/鸿蒙）做 WebView 版本校验与缓存策略。
 * 部署后访问：https://your-domain/version.json
 */
import { writeFileSync, readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));

const versionInfo = {
  version: pkg.version || '1.0.0',
  buildTime: new Date().toISOString(),
};

const outPath = resolve(root, 'public', 'version.json');
writeFileSync(outPath, JSON.stringify(versionInfo, null, 2), 'utf8');
console.log('Generated public/version.json:', versionInfo);

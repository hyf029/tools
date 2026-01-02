// 最小化 Service Worker - 仅用于启用 PWA 安装
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());

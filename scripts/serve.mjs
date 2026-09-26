import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { resolve, extname, sep } from 'node:path'

const root = resolve('.output/public')
const base = process.env.NUXT_APP_BASE_URL || '/Agentic-Eval/'
const mime = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
}
createServer(async (request, response) => {
  try {
    let path = decodeURIComponent(new URL(request.url, 'http://localhost').pathname)
    if (path.startsWith(base)) path = path.slice(base.length)
    let file = resolve(root, path.replace(/^\/+/, ''))
    if (file !== root && !file.startsWith(root + sep)) throw new Error('Invalid path')
    if ((await stat(file)).isDirectory()) file = resolve(file, 'index.html')
    response.setHeader('Content-Type', mime[extname(file)] || 'application/octet-stream')
    response.end(await readFile(file))
  } catch {
    response.writeHead(404).end('Not found')
  }
}).listen(4173, '127.0.0.1', () => console.log(`Static preview: http://127.0.0.1:4173${base}`))

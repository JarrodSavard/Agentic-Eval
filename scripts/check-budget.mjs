import { readdir, readFile } from 'node:fs/promises'
import { gzipSync } from 'node:zlib'

const root = '.output/public/_nuxt'
const files = (await readdir(root)).filter((name) => name.endsWith('.js'))
let bytes = 0
for (const file of files) bytes += gzipSync(await readFile(`${root}/${file}`)).byteLength
// Counting all chunks is stricter than counting only initial-route JavaScript.
console.log(`All client JavaScript: ${(bytes / 1024).toFixed(1)} KB gzip / 250 KB budget`)
if (bytes > 250 * 1024) process.exitCode = 1

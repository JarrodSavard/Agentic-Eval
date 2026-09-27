import { spawn } from 'node:child_process'
import { resolve } from 'node:path'

function run(command, args, env = process.env) {
  return new Promise((done, reject) => {
    const child = spawn(command, args, { stdio: 'inherit', env })
    const stop = () => child.kill('SIGINT')
    process.on('SIGINT', stop)
    child.on('error', reject)
    child.on('exit', (code) => {
      process.off('SIGINT', stop)
      if (code === 0) done()
      else reject(new Error(`Process exited with code ${code}`))
    })
  })
}

await run(process.execPath, ['node_modules/nuxt/bin/nuxt.mjs', 'generate'], {
  ...process.env,
  NUXT_APP_BASE_URL: '/',
  ROADTEST_LOCAL_BUILD: '1',
  NUXT_TELEMETRY_DISABLED: '1',
})
const python = resolve(
  process.platform === 'win32' ? '.venv/Scripts/python.exe' : '.venv/bin/python',
)
await run(python, ['-m', 'roadtest.cli', 'serve', '--site', '.local-output/public'])

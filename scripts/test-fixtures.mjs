import { execFileSync } from 'node:child_process'
import { resolve } from 'node:path'

// Generate from Python before each suite so publishing live data cannot change test inputs.
const python = resolve(
  process.platform === 'win32' ? '.venv/Scripts/python.exe' : '.venv/bin/python',
)
execFileSync(python, ['-m', 'roadtest.cli', 'demo', '--output', 'artifacts/test-data'], {
  stdio: 'inherit',
})

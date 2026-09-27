import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { compile } from 'json-schema-to-typescript'
import Ajv from 'ajv/dist/2020.js'
import standaloneCode from 'ajv/dist/standalone/index.js'
import prettier from 'prettier'

const schema = JSON.parse(await readFile('contracts/evaluation.schema.json', 'utf8'))
const types = await compile(schema, 'EvaluationBundle', { additionalProperties: false })
const ajv = new Ajv({ code: { source: true, esm: true }, strict: false })
const validator = standaloneCode(ajv, ajv.compile(schema))
const files = {
  'app/generated/evaluation.ts': await prettier.format(types, { parser: 'typescript' }),
  'app/generated/validate.js': await prettier.format(validator, { parser: 'babel' }),
}
const liveSchema = JSON.parse(await readFile('contracts/live.schema.json', 'utf8'))
files['app/generated/live.ts'] = await prettier.format(
  await compile(liveSchema, 'LiveAPI', { additionalProperties: false, ignoreMinAndMaxItems: true }),
  { parser: 'typescript' },
)
await mkdir('app/generated', { recursive: true })
for (const [path, value] of Object.entries(files)) {
  if (process.argv.includes('--check')) {
    if ((await readFile(path, 'utf8')) !== value) throw new Error(`Contract drift: ${path}`)
  } else await writeFile(path, value)
}
console.log(
  process.argv.includes('--check')
    ? 'Generated contracts match.'
    : 'Generated TypeScript and standalone validator.',
)

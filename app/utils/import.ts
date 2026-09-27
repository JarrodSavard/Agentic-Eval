import validate from '../generated/validate.js'
import type { EvaluationBundle } from '../generated/evaluation'

export const MAX_IMPORT_BYTES = 5 * 1024 * 1024

export function parseBundle(text: string): EvaluationBundle {
  if (new TextEncoder().encode(text).length > MAX_IMPORT_BYTES)
    throw new Error('Result files must be smaller than 5 MB.')
  let value: unknown
  try {
    value = JSON.parse(text)
  } catch {
    throw new Error('This is not valid JSON. Choose an exported evaluation file.')
  }
  if (
    !value ||
    typeof value !== 'object' ||
    !('schema_version' in value) ||
    value.schema_version !== '2.0'
  ) {
    throw new Error(
      'Unsupported result version. This rental-car demo accepts version 2.0. Export a new recording with the current runner.',
    )
  }
  if (!validate(value))
    throw new Error(
      'The file does not match the evaluation format. Re-export it with the Python runner.',
    )
  const bundle = value as EvaluationBundle
  const scenarioIds = new Set(bundle.scenarios.map((s) => s.id))
  if (scenarioIds.size !== bundle.scenarios.length)
    throw new Error('The file contains duplicate scenario ids.')
  if (new Set(bundle.trials.map((t) => t.id)).size !== bundle.trials.length)
    throw new Error('The file contains duplicate trial ids.')
  for (const trial of bundle.trials) {
    if (!scenarioIds.has(trial.scenario_id))
      throw new Error('A trial refers to an unknown scenario.')
    if (trial.events.some((event, index) => event.sequence !== index))
      throw new Error('A trial has an invalid event sequence.')
  }
  return bundle
}

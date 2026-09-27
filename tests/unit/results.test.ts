import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import {
  featuredTrial,
  summarize,
  filterTrials,
  provenanceLabel,
  returnedModelLabel,
} from '../../app/utils/results'
import { parseBundle } from '../../app/utils/import'

const fixture = () => parseBundle(readFileSync('artifacts/test-data/bundle.json', 'utf8'))

describe('honest comparison summaries', () => {
  it('never labels a missing live model response as a scripted policy', () => {
    const trial = fixture().trials[0]!
    trial.source = 'live'
    trial.returned_model = null
    expect(returnedModelLabel(trial)).toBe('No model response recorded')
    trial.source = 'scripted'
    expect(returnedModelLabel(trial)).toBe('Not applicable to this scripted policy')
  })
  it('counts completed outcomes and distinguishes scripted data', () => {
    const bundle = fixture()
    const reference = bundle.trials.filter((t) => t.model === 'scripted-recovery-v1')
    expect(summarize(reference)).toMatchObject({
      trials: 24,
      completed: 24,
      passed: 24,
      live: 0,
      cost: 0,
    })
    expect(provenanceLabel(reference[0]!)).toBe('Scripted demonstration')
  })
  it('does not count an incomplete trial as a passed trial even when final state is valid', () => {
    const trial = fixture().trials[0]!
    trial.status = 'turn_limit'
    trial.grade.success = true
    expect(summarize([trial])).toMatchObject({ passed: 0, completed: 0, incomplete: 1 })
  })
  it('filters on provider and scenario family without mixing unmatched rows', () => {
    const bundle = fixture()
    const results = filterTrials(bundle.trials, bundle.scenarios, {
      family: 'committed_timeout',
      model: 'scripted-recovery-v1',
    })
    expect(results).toHaveLength(8)
    expect(results.every((t) => t.scenario_id.startsWith('committed_timeout'))).toBe(true)
  })
})

describe('local result imports', () => {
  it('accepts the Python-exported contract', () => {
    expect(fixture().schema_version).toBe('1.0')
  })
  it('rejects invalid JSON, unsupported versions and broken references clearly', () => {
    expect(() => parseBundle('{')).toThrow('valid JSON')
    expect(() => parseBundle('{"schema_version":"2"}')).toThrow('version')
    const bundle = fixture()
    bundle.trials[0]!.scenario_id = 'missing'
    expect(() => parseBundle(JSON.stringify(bundle))).toThrow('unknown scenario')
  })
  it('rejects oversized files before parsing', () => {
    expect(() => parseBundle(' '.repeat(5 * 1024 * 1024 + 1))).toThrow('5 MB')
  })
})

it('features a real fault trial regardless of outcome', () => {
  const trials = fixture().trials
  const clean = { ...trials[0]!, source: 'live' as const, scenario_id: 'example-clean' }
  const fault = { ...clean, scenario_id: 'example-fault', status: 'provider_error' as const }
  expect(featuredTrial([clean, ...trials, fault])).toBe(fault)
})

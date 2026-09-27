import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { explainEvent } from '../../app/utils/story'
import { parseBundle } from '../../app/utils/import'
const bundle = parseBundle(readFileSync('artifacts/test-data/bundle.json', 'utf8'))
describe('plain language evidence', () => {
  it('distinguishes stale information from what actually changed', () => {
    const trial = bundle.trials.find((t) => t.scenario_id === 'car_unavailable-01-fault')!
    const story = explainEvent(trial.events[0]!)
    expect(story.title).toBe('The AI checks available cars')
    expect(story.detail).toContain('after')
    expect(story.detail).toContain('model has not seen')
  })
  it('does not describe a timed-out successful write as a failed booking', () => {
    const trial = bundle.trials.find((t) => t.scenario_id === 'committed_timeout-01-fault')!
    const event = trial.events.find((e) => e.result?.fault === 'committed_timeout')!
    expect(explainEvent(event).detail).toContain('was saved')
    expect(explainEvent(event).detail).toContain('confirmation')
  })
  it('does not equate a model message with verified success', () => {
    const event = bundle.trials[0]!.events.at(-1)!
    expect(explainEvent(event).detail).toContain('grader')
  })
})

it('never describes a rejected inspection as having received the schedule', () => {
  const event = structuredClone(bundle.trials[0]!.events[0]!)
  event.result = { data: {}, error: 'invalid_arguments', fault: null }
  expect(explainEvent(event).title).toBe('The car check was rejected')
})

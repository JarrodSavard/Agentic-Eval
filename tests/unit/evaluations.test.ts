import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { passEstimates, reliabilityGroups, checkSummary } from '../../app/utils/evaluations'
import { parseBundle } from '../../app/utils/import'
import EvaluationReport from '../../app/components/EvaluationReport.vue'

const fixture = () => parseBundle(readFileSync('artifacts/test-data/bundle.json', 'utf8'))

describe('evaluation evidence', () => {
  it('withholds estimates when an early interruption has no returned model identifier', () => {
    const bundle = fixture()
    const trials = [0, 1, 2].map((i) => ({
      ...structuredClone(bundle.trials[0]!),
      id: String(i),
      source: 'live' as const,
      returned_model: 'confirmed',
    }))
    trials[2]!.returned_model = null as unknown as string
    trials[2]!.status = 'budget_exhausted'
    const rows = reliabilityGroups(bundle, trials, 2)
    expect(rows[0]!.every).toBeNull()
    expect(rows[0]!.unresolved).toBe(1)
  })
  it('uses the same hand-calculated reliability examples as Python', () => {
    const examples = JSON.parse(readFileSync('contracts/reliability-examples.json', 'utf8'))
    for (const row of examples)
      expect(passEstimates(row.n, row.c, row.k)).toEqual({ atLeast: row.atLeast, every: row.every })
  })
  it('keeps incomplete runs in the denominator without mixing settings', () => {
    const bundle = fixture()
    const a = bundle.trials[0]!
    const b = structuredClone(a)
    b.id = 'second'
    b.status = 'provider_error'
    b.repetition = 2
    const c = structuredClone(a)
    c.id = 'different'
    c.settings = { temperature: 0.8 }
    const rows = reliabilityGroups(bundle, [a, b, c], 2)
    expect(rows).toHaveLength(2)
    expect(rows[0]).toMatchObject({
      attempts: 2,
      successes: 1,
      incomplete: 1,
      atLeast: 1,
      every: 0,
    })
    expect(rows[1]!.every).toBeNull()
  })
  it('distinguishes missing checks and inapplicable checks from passes', () => {
    const bundle = fixture()
    const t = bundle.trials[0]!
    const legacy = { ...t, assessment: null }
    expect(checkSummary([t, legacy], 'reporting')).toMatchObject({ pass: 1, not_assessed: 1 })
    expect(checkSummary([t], 'recovery')).toMatchObject({ pass: 0, not_applicable: 1 })
  })
  it('opens old rental evidence without inventing assessment results', () => {
    const raw = JSON.parse(readFileSync('public/data/bundle.json', 'utf8'))
    raw.schema_version = '2.0'
    raw.prompt_version = '2.0'
    for (const t of raw.trials) delete t.assessment
    for (const s of raw.scenarios) {
      delete s.expected_outcome
      delete s.rental_notice
    }
    const opened = parseBundle(JSON.stringify(raw))
    expect(opened.trials[0]!.assessment).toBeNull()
    expect(opened.prompt_version).toBe('2.0')
    expect(opened.code_revision).toBe(raw.code_revision)
  })
  it('shows the actual receipt verdict and jumps to its recorded evidence', async () => {
    const assessment = fixture().trials[0]!.assessment!
    const wrapper = mount(EvaluationReport, { props: { assessment } })
    expect(wrapper.text()).toContain('The final receipt matches reality')
    const buttons = wrapper.findAll('button')
    const receipt = assessment.checks.find((c) => c.id === 'reporting')!
    const evidence = buttons.find(
      (b) => b.attributes('data-sequence') === String(receipt.evidence_sequences[0]),
    )!
    await evidence.trigger('click')
    expect(wrapper.emitted('inspect')![0]).toEqual([receipt.evidence_sequences[0]])
  })
  it('explains that older recordings have no expanded check results', () => {
    const wrapper = mount(EvaluationReport, { props: { assessment: null } })
    expect(wrapper.text()).toContain('not recorded')
    expect(wrapper.findAll('button')).toHaveLength(0)
  })
})

import type { EvaluationBundle, Scenario, TrialResult } from '../generated/evaluation'

export type TrialSummary = Omit<TrialResult, 'events' | 'final_state'> & { trace_path?: string }
export type SummaryIndex = Omit<EvaluationBundle, 'trials'> & { trials: TrialSummary[] }

export const familyLabels: Record<string, string> = {
  transient_read: 'Lost signal',
  instrument_unavailable: 'Change of plans',
  committed_timeout: 'An uncertain success',
}

export function summarize(trials: TrialSummary[]) {
  return {
    trials: trials.length,
    completed: trials.filter((t) => t.status === 'completed').length,
    passed: trials.filter((t) => t.status === 'completed' && t.grade.success).length,
    incomplete: trials.filter((t) => t.status !== 'completed').length,
    live: trials.filter((t) => t.source === 'live').length,
    cost: trials.reduce((sum, t) => sum + t.estimated_cost_usd, 0),
    reserved: trials.reduce((sum, t) => sum + t.reserved_cost_usd, 0),
    calls: trials.reduce((sum, t) => sum + t.tool_calls, 0),
    invalid: trials.reduce((sum, t) => sum + t.invalid_actions, 0),
  }
}

export function filterTrials(
  trials: TrialSummary[],
  scenarios: Scenario[],
  filters: { family?: string; model?: string; variant?: string },
) {
  const accepted = new Set(
    scenarios
      .filter(
        (s) =>
          (!filters.family || s.family === filters.family) &&
          (!filters.variant || s.variant === filters.variant),
      )
      .map((s) => s.id),
  )
  return trials.filter(
    (t) => accepted.has(t.scenario_id) && (!filters.model || t.model === filters.model),
  )
}

export function provenanceLabel(trial: Pick<TrialSummary, 'source'>) {
  return trial.source === 'live' ? 'Recorded model run' : 'Scripted demonstration'
}

export function returnedModelLabel(trial: Pick<TrialSummary, 'source' | 'returned_model'>) {
  return (
    trial.returned_model ||
    (trial.source === 'live'
      ? 'No model response recorded'
      : 'Not applicable to this scripted policy')
  )
}

export function outcome(trial: TrialSummary) {
  if (trial.status !== 'completed') return trial.status.replaceAll('_', ' ')
  return trial.grade.success ? 'Task achieved' : 'Task not achieved'
}

export function money(value: number) {
  return value === 0 ? '$0.00' : `$${value.toFixed(4)}`
}

export function featuredTrial(trials: TrialSummary[]) {
  return (
    trials.find((t) => t.source === 'live' && t.scenario_id.endsWith('-fault')) ||
    trials.find(
      (t) =>
        t.scenario_id === 'instrument_unavailable-01-fault' && t.model === 'scripted-recovery-v1',
    ) ||
    trials[0]
  )
}

<script setup lang="ts">
import { checkSummary, evaluationTypes } from '~/utils/evaluations'
const evaluation = useEvaluation()
onMounted(evaluation.load)
const source = ref('live')
const trials = computed(() =>
  (evaluation.data.value?.trials || []).filter((t) => t.source === source.value),
)
const covered = computed(
  () => new Set(trials.value.filter((t) => t.status !== 'not_run').map((t) => t.scenario_id)).size,
)
</script>
<template>
  <section class="page-heading">
    <div>
      <h1>What are<br />we testing?</h1>
      <p class="lead">
        Booking the car is only part of the job. It also matters how the AI gets there, what it
        reports, and whether it can do it again.
      </p>
    </div>
    <ResultImport />
  </section>
  <p v-if="evaluation.loadError.value" role="alert">{{ evaluation.loadError.value }}</p>
  <p v-if="evaluation.imported.value" class="notice" role="note">
    Local file · Format validated only. Model identities, provenance and check results are supplied
    by the file and have not been independently verified here. Run the Python verifier before
    trusting recorded results.
  </p>
  <section class="coverage-intro">
    <div>
      <h2>Test coverage is not proof of reliability.</h2>
      <p>
        The suite contains {{ evaluation.data.value?.scenarios.length || 48 }} rental cases. This
        recording has evidence for <strong>{{ covered }}</strong> of them from the selected source.
        A check can exist without having real AI results yet.
      </p>
      <NuxtLink class="text-link" to="/scenarios">Explore the rental cases <ArrowIcon /></NuxtLink>
    </div>
    <label
      >Evidence to show<select v-model="source">
        <option value="live">Real AI recordings</option>
        <option value="scripted">Scripted examples</option></select
      ><small>{{ trials.length }} recorded attempts</small></label
    >
  </section>
  <p class="notice">
    {{
      source === 'live'
        ? 'These are observed results from a small sample, not a model ranking.'
        : 'Scripted actions test the evaluator itself. They do not demonstrate model ability.'
    }}
  </p>
  <div class="coverage-list">
    <article v-for="type in evaluationTypes" :key="type.id" class="coverage-row">
      <div>
        <h2>{{ type.name }}</h2>
        <p>{{ type.example }}</p>
      </div>
      <dl class="coverage-counts">
        <div>
          <dt>Passed</dt>
          <dd>{{ checkSummary(trials, type.id).pass }}</dd>
        </div>
        <div>
          <dt>Needs attention</dt>
          <dd>{{ checkSummary(trials, type.id).fail }}</dd>
        </div>
        <div>
          <dt>Not tested here</dt>
          <dd>{{ checkSummary(trials, type.id).not_applicable }}</dd>
        </div>
        <div>
          <dt>Not assessed</dt>
          <dd>{{ checkSummary(trials, type.id).not_assessed }}</dd>
        </div>
      </dl>
    </article>
  </div>
  <ReliabilityReport
    v-if="evaluation.data.value"
    :bundle="evaluation.data.value"
    :trials="trials"
  />
  <section class="section split-section">
    <div>
      <h2>Did a change<br />make things worse?</h2>
    </div>
    <div class="prose">
      <p>
        Every code change runs the reference agent through the full suite, checks deliberately bad
        behavior, and replays published evidence. These checks protect the simulator and evaluator.
        They do not make new paid AI calls.
      </p>
      <p>
        Compare saved experiments to find matching tasks and settings, lower success rates, and
        newly failing checks. Unmatched groups remain visible.
      </p>
      <pre>uv run roadtest regress before.json after.json</pre>
      <p>
        Small differences in live samples can be random variation. The report does not claim
        statistical significance.
      </p>
    </div>
  </section>
  <section class="grading-methods prose">
    <h2>How the checks are graded.</h2>
    <p>
      Use the least expensive method that can answer the question reliably. Different grading
      methods serve different purposes.
    </p>
    <div class="table-scroll">
      <table>
        <caption>
          Grading methods in this rental-car testbed
        </caption>
        <thead>
          <tr>
            <th>Method</th>
            <th>How we use it</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Deterministic assertions</td>
            <td>
              Check tool inputs, limits, protected bookings, and recorded actions. No extra AI call.
            </td>
          </tr>
          <tr>
            <td>Structured exact match</td>
            <td>
              Compare the final receipt’s customer, car, and date with the saved bookings. Accept
              any suitable car.
            </td>
          </tr>
          <tr>
            <td>Custom domain checks</td>
            <td>
              Check availability, required features, dates, duplicates, and whether an unavailable
              claim is true.
            </td>
          </tr>
          <tr>
            <td>Human review</td>
            <td>
              Read messages and actions in Replay to judge clarity, tone, and edge cases. No
              automatic human rating is implied.
            </td>
          </tr>
          <tr>
            <td>Semantic similarity</td>
            <td>Not used. Two messages can sound alike while describing different bookings.</td>
          </tr>
          <tr>
            <td>AI-as-judge</td>
            <td>
              Not used. Booking facts can be verified directly. Subjective model grading would
              require a calibrated rubric and a separate budget.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <h2>What this does not test.</h2>
    <p>
      This is one synthetic tool-using agent. It does not evaluate browser navigation, research
      quality, long-term memory, teamwork between agents, or production traffic. Public examples can
      appear in model training data; these are not private holdout tests.
    </p>
    <p>
      The approach draws on
      <a href="https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents"
        >Anthropic’s evaluation guidance</a
      >: check outcomes and recorded behavior, allow valid alternatives, and use repeated trials to
      study consistency.
    </p>
    <NuxtLink class="text-link" to="/replay">Inspect the evidence <ArrowIcon /></NuxtLink>
  </section>
</template>

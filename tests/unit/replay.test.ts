import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import ReplayControls from '../../app/components/ReplayControls.vue'
import { parseBundle } from '../../app/utils/import'

describe('replay controls', () => {
  it('moves through actual events, announces position and respects bounds', async () => {
    const trial = parseBundle(readFileSync('artifacts/test-data/bundle.json', 'utf8')).trials[0]!
    const wrapper = mount(ReplayControls, { props: { count: trial.events.length, modelValue: 0 } })
    expect(wrapper.get('button[aria-label="Previous event"]').attributes('disabled')).toBeDefined()
    await wrapper.get('button[aria-label="Next event"]').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([1])
    await wrapper.setProps({ modelValue: trial.events.length - 1 })
    expect(wrapper.get('button[aria-label="Next event"]').attributes('disabled')).toBeDefined()
    expect(wrapper.text()).toContain(`of ${trial.events.length}`)
  })
})

import type { TraceEvent } from '~/generated/evaluation'

export function explainEvent(event: TraceEvent) {
  const result = event.result
  const instrument =
    event.state.instruments
      .find((i) => i.id === event.arguments?.instrument_id)
      ?.name.split(' / ')[0] || 'the instrument'
  const slot = event.arguments?.slot
  if (event.kind === 'stopped')
    return {
      title: 'Run stopped',
      detail:
        'The run ended before a normal completion. Inspect the recorded status; this is not counted as a successful run.',
    }
  if (event.kind === 'message')
    return {
      title: 'Model reported back',
      detail:
        'This is the model�s own account. The independent grader checks the reservations to decide whether the task succeeded.',
    }
  if (result?.fault === 'committed_timeout')
    return {
      title: 'Booking saved, confirmation lost',
      detail:
        'The reservation was saved, but the model received a timeout instead of confirmation. It must check the schedule or retry safely to avoid a duplicate.',
    }
  if (event.tool === 'inspect_observatory') {
    if (result?.fault === 'transient_read')
      return {
        title: 'Schedule check failed',
        detail:
          'A temporary read failure prevented the model from seeing the schedule. No booking changed.',
      }
    if (result?.error)
      return {
        title: 'Schedule check rejected',
        detail:
          'The model did not receive the schedule. Expand the technical details to see why the request was rejected.',
      }
    if (result?.fault === 'instrument_unavailable')
      return {
        title: 'Checked the schedule',
        detail:
          'An instrument went offline after the schedule was returned. The board shows the changed world, but the model has not seen that change yet.',
      }
    return {
      title: 'Checked the schedule',
      detail:
        'The model received the current instruments, availability and existing bookings. This action only reads the schedule.',
    }
  }
  if (event.tool === 'reserve_observation') {
    if (result?.error === 'instrument_unavailable')
      return {
        title: 'Booking rejected',
        detail: `${instrument} is unavailable. The attempted booking in slot ${slot} was rejected; it did not change the schedule. The model now has evidence that its earlier information is out of date.`,
      }
    if (result?.error)
      return {
        title: 'Booking rejected',
        detail: `The request did not satisfy the rules (${result.error.replaceAll('_', ' ')}). No reservation was added.`,
      }
    if (result?.data?.idempotent_replay)
      return {
        title: 'Existing booking confirmed',
        detail:
          'A safe retry returned the original reservation. It did not create another booking.',
      }
    return {
      title: 'Observation booked',
      detail: `The model reserved ${instrument} in slot ${slot}. The green square shows the booking now present in the schedule.`,
    }
  }
  if (event.tool === 'cancel_reservation')
    return result?.error
      ? {
          title: 'Cancellation rejected',
          detail: 'The reservation was not removed. Expand the technical details to see why.',
        }
      : {
          title: 'Reservation cancelled',
          detail: 'The requested reservation was removed from the schedule.',
        }
  return {
    title: 'Tool action recorded',
    detail: 'Inspect the recorded request and response for this action.',
  }
}

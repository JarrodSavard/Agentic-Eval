import type { TraceEvent } from '~/generated/evaluation'
import { rentalDay } from './rental'

export function explainEvent(event: TraceEvent) {
  const result = event.result
  const car =
    event.state.cars.find((c) => c.id === event.arguments?.car_id)?.name || 'the requested car'
  const day = rentalDay(event.arguments?.day)
  if (event.kind === 'stopped')
    return {
      title: 'The run stopped early',
      detail:
        'The AI did not finish its attempt. This is shown separately from a completed booking, even if it made some progress.',
    }
  if (event.kind === 'message')
    return {
      title: 'The AI reports back',
      detail:
        'This is what the AI says it did. The independent checker (grader) looks at the actual bookings to decide whether it really finished the job.',
    }
  if (result?.fault === 'committed_timeout')
    return {
      title: 'Booked, but no confirmation',
      detail:
        'The booking was saved, but the confirmation did not reach the AI. It needs to check the bookings or repeat the same request safely, without booking twice.',
    }
  if (event.tool === 'check_cars') {
    if (result?.fault === 'transient_read')
      return {
        title: 'The booking site did not respond',
        detail:
          'The AI tried to see which cars were available, but the site returned a temporary error. No booking changed.',
      }
    if (result?.error)
      return {
        title: 'The car check was rejected',
        detail:
          'The AI did not receive the car list. Open Technical details to see why the request was rejected.',
      }
    if (result?.fault === 'car_unavailable')
      return {
        title: 'The AI checks available cars',
        detail:
          'The Blue SUV became unavailable after the car list was sent. The board shows the current situation, but the model has not seen this change yet. Its list still says the car is available.',
      }
    return {
      title: 'The AI checks available cars',
      detail:
        'The AI can now see each car, its features, whether it is available, and existing bookings. Nothing has been booked by this action.',
    }
  }
  if (event.tool === 'book_car') {
    if (result?.error === 'car_unavailable')
      return {
        title: 'That car is no longer available',
        detail: `The AI tried to book the ${car} for ${day}, but it is no longer available. No booking was made. The AI now knows it needs another option.`,
      }
    if (result?.error)
      return {
        title: 'The booking was rejected',
        detail: `No booking was added because a rule was not met: ${result.error.replaceAll('_', ' ')}. The AI can use this feedback to try another option.`,
      }
    if (result?.data?.idempotent_replay)
      return {
        title: 'The original booking is confirmed',
        detail:
          'The AI repeated the same booking request safely. The site returned the booking that already existed, without creating a second one.',
      }
    return {
      title: 'The car is booked',
      detail: `The ${car} is booked for ${day}. The green entry on the board shows the booking that actually exists.`,
    }
  }
  if (event.tool === 'cancel_booking')
    return result?.error
      ? {
          title: 'The cancellation was rejected',
          detail: 'The booking was not removed. Open Technical details to see why.',
        }
      : {
          title: 'The booking was cancelled',
          detail: 'The selected booking was removed. Other bookings stayed in place.',
        }
  return {
    title: 'The AI made a request',
    detail: 'Open Technical details to inspect the request and response.',
  }
}

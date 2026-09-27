export const featureLabel = (feature: string) =>
  ({ child_seat: 'child seat', large_boot: 'space for extra luggage' })[feature] ||
  feature.replaceAll('_', ' ')
export function rentalDay(value: unknown) {
  if (typeof value !== 'string' || !/^2026-10-(0[1-9]|[12][0-9]|3[01])$/.test(value))
    return 'the requested date'
  return `Oct ${Number(value.slice(-2))}`
}

export function formatRelativeDate(value: string) {
  const date = new Date(value)
  const diffInSeconds = Math.floor((date.getTime() - Date.now()) / 1000)
  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

  const intervals: Array<{ unit: Intl.RelativeTimeFormatUnit; seconds: number }> = [
    { unit: 'year', seconds: 31536000 },
    { unit: 'month', seconds: 2592000 },
    { unit: 'week', seconds: 604800 },
    { unit: 'day', seconds: 86400 },
    { unit: 'hour', seconds: 3600 },
    { unit: 'minute', seconds: 60 },
  ]

  for (const interval of intervals) {
    const valueForUnit = Math.ceil(diffInSeconds / interval.seconds)
    if (Math.abs(valueForUnit) >= 1) {
      return formatter.format(valueForUnit, interval.unit)
    }
  }

  return 'just now'
}

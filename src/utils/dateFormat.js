export const formatDate = (dateStr) => {
  if (!dateStr) return { day: '', num: '', mon: '', full: '' }

  // Manejar tanto '2026-04-06' como '2026-04-06T05:00:00.000Z'
  const clean = typeof dateStr === 'string' ? dateStr.slice(0, 10) : ''
  const [year, month, day] = clean.split('-').map(Number)

  if (!year || !month || !day) return { day: '', num: '', mon: '', full: '' }

  const date = new Date(year, month - 1, day)

  const dayName = date.toLocaleString('es', { weekday: 'short' })
  const num     = String(day).padStart(2, '0')
  const mon     = date.toLocaleString('es', { month: 'short' })

  return {
    day:  dayName.charAt(0).toUpperCase() + dayName.slice(1),
    num,
    mon:  mon.charAt(0).toUpperCase() + mon.slice(1),
    full: `${dayName} ${num} ${mon}`,
  }
}
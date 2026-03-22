import { parseLocalDate, toLocalISODate } from '../dateUtils'

type Props = {
  selectedDate: string
  onChange: (iso: string) => void
}

export function DateNav({ selectedDate, onChange }: Props) {
  const today = toLocalISODate(new Date())

  function shift(days: number) {
    const d = parseLocalDate(selectedDate)
    d.setDate(d.getDate() + days)
    onChange(toLocalISODate(d))
  }

  return (
    <div className="date-nav" role="group" aria-label="Choose day">
      <button
        type="button"
        className="btn secondary icon-btn"
        onClick={() => shift(-1)}
        aria-label="Previous day"
      >
        ←
      </button>
      <div className="date-nav-center">
        <time dateTime={selectedDate} className="date-nav-label">
          {selectedDate}
        </time>
        {selectedDate !== today && (
          <button
            type="button"
            className="btn link"
            onClick={() => onChange(today)}
          >
            Today
          </button>
        )}
      </div>
      <button
        type="button"
        className="btn secondary icon-btn"
        onClick={() => shift(1)}
        aria-label="Next day"
      >
        →
      </button>
    </div>
  )
}

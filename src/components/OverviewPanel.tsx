import type { PlannerState } from '../types'

type Props = {
  state: PlannerState
  today: string
}

export function OverviewPanel({ state, today }: Props) {
  const dueToday = state.tasks.filter(
    (t) => t.dueDate === today && !t.completed,
  ).length
  const openTasks = state.tasks.filter((t) => !t.completed).length
  const orgTaskOpen = state.organizations.reduce(
    (n, o) => n + o.orgTasks.filter((t) => !t.completed).length,
    0,
  )
  const subjects = state.subjects.length
  const learning = state.learningItems.length

  const cards = [
    { label: 'Due today', value: dueToday, hint: 'Daily tab' },
    { label: 'Open tasks', value: openTasks, hint: 'All categories' },
    { label: 'Club / project tasks', value: orgTaskOpen, hint: 'Clubs' },
    { label: 'Subjects', value: subjects, hint: 'Semesters' },
    { label: 'Skills & courses', value: learning, hint: 'Learning' },
  ]

  return (
    <div className="overview">
      <p className="panel-intro tight">
        Snapshot for <strong>{today}</strong>. Open a section from the sidebar to
        drill in — everything stays in collapsible panels so the screen stays calm.
      </p>
      <div className="stat-grid">
        {cards.map((c) => (
          <div key={c.label} className="stat-card">
            <span className="stat-value">{c.value}</span>
            <span className="stat-label">{c.label}</span>
            <span className="stat-hint">{c.hint}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

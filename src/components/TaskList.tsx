import type { Task } from '../types'
import { formatDisplayDate } from '../dateUtils'

const categoryLabel: Record<Task['category'], string> = {
  need: 'Need to do',
  wish: 'Wish to do',
  assignment: 'Assignment',
  project: 'Project',
}

type Props = {
  tasks: Task[]
  showDueBadge?: boolean
  emptyMessage: string
  onToggle: (id: string, completed: boolean) => void
  onEdit: (task: Task) => void
  onRequestDelete: (task: Task) => void
}

export function TaskList({
  tasks,
  showDueBadge,
  emptyMessage,
  onToggle,
  onEdit,
  onRequestDelete,
}: Props) {
  if (tasks.length === 0) {
    return <p className="empty-hint">{emptyMessage}</p>
  }

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <li key={task.id} className={`task-item ${task.completed ? 'done' : ''}`}>
          <label className="task-check">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={(e) => onToggle(task.id, e.target.checked)}
              aria-label={`Mark complete: ${task.title}`}
            />
            <span className="task-title">{task.title}</span>
          </label>
          <span className="task-meta">
            <span className="tag">{categoryLabel[task.category]}</span>
            {showDueBadge && task.dueDate && (
              <span className="task-due">{formatDisplayDate(task.dueDate)}</span>
            )}
          </span>
          {task.details && <p className="task-details">{task.details}</p>}
          <div className="task-actions">
            <button
              type="button"
              className="btn link"
              onClick={() => onEdit(task)}
            >
              Edit
            </button>
            <button
              type="button"
              className="btn link danger-text"
              onClick={() => onRequestDelete(task)}
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}

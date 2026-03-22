import { useState } from 'react'
import type { Task, TaskCategory } from '../types'

const categories: { value: TaskCategory; label: string }[] = [
  { value: 'need', label: 'Need to do' },
  { value: 'wish', label: 'Wish to do' },
  { value: 'assignment', label: 'Assignment' },
  { value: 'project', label: 'Project' },
]

type Props = {
  task: Task | null
  onSave: (id: string, patch: Partial<Task>) => void
  onClose: () => void
}

export function EditTaskModal({ task, onSave, onClose }: Props) {
  const [title, setTitle] = useState(() => task?.title ?? '')
  const [details, setDetails] = useState(() => task?.details ?? '')
  const [category, setCategory] = useState<TaskCategory>(
    () => task?.category ?? 'need',
  )
  const [dueDate, setDueDate] = useState(() => task?.dueDate ?? '')
  const [completed, setCompleted] = useState(() => task?.completed ?? false)

  if (!task) return null

  const editing = task

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const t = title.trim()
    if (!t) return
    onSave(editing.id, {
      title: t,
      details: details.trim() || undefined,
      category,
      dueDate: dueDate || undefined,
      completed,
    })
    onClose()
  }

  return (
    <div
      className="dialog-backdrop"
      role="presentation"
      onClick={onClose}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      <div
        className="dialog dialog-wide"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-task-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="edit-task-title" className="dialog-title">
          Edit task
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label htmlFor="edit-title">Title</label>
            <input
              id="edit-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="form-row inline">
            <div>
              <label htmlFor="edit-cat">Category</label>
              <select
                id="edit-cat"
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
              >
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="edit-due">Due date</label>
              <input
                id="edit-due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>
          <div className="form-row">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={completed}
                onChange={(e) => setCompleted(e.target.checked)}
              />
              Completed
            </label>
          </div>
          <div className="form-row">
            <label htmlFor="edit-details">Details</label>
            <textarea
              id="edit-details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
            />
          </div>
          <div className="dialog-actions">
            <button type="button" className="btn secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn primary">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

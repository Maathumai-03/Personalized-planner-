import { useEffect, useState } from 'react'
import type { TaskCategory } from '../types'

const categories: { value: TaskCategory; label: string }[] = [
  { value: 'need', label: 'Need to do' },
  { value: 'wish', label: 'Wish to do' },
  { value: 'assignment', label: 'Assignment' },
  { value: 'project', label: 'Project' },
]

type Props = {
  defaultCategory?: TaskCategory
  defaultDueDate?: string
  submitLabel?: string
  onSubmit: (data: {
    title: string
    details?: string
    category: TaskCategory
    dueDate?: string
  }) => void
}

export function QuickTaskForm({
  defaultCategory = 'need',
  defaultDueDate,
  submitLabel = 'Add task',
  onSubmit,
}: Props) {
  const [title, setTitle] = useState('')
  const [details, setDetails] = useState('')
  const [category, setCategory] = useState<TaskCategory>(defaultCategory)
  const [dueDate, setDueDate] = useState(defaultDueDate ?? '')

  useEffect(() => {
    setCategory(defaultCategory)
  }, [defaultCategory])

  useEffect(() => {
    if (defaultDueDate !== undefined) setDueDate(defaultDueDate)
  }, [defaultDueDate])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const t = title.trim()
    if (!t) return
    onSubmit({
      title: t,
      details: details.trim() || undefined,
      category,
      dueDate: dueDate || undefined,
    })
    setTitle('')
    setDetails('')
    setCategory(defaultCategory)
    setDueDate(defaultDueDate ?? '')
  }

  return (
    <form className="card form-card" onSubmit={handleSubmit}>
      <div className="form-row">
        <label htmlFor="task-title">Title</label>
        <input
          id="task-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What do you need to do?"
          autoComplete="off"
        />
      </div>
      <div className="form-row inline">
        <div>
          <label htmlFor="task-cat">Category</label>
          <select
            id="task-cat"
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
          <label htmlFor="task-due">Due date</label>
          <input
            id="task-due"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
      </div>
      <div className="form-row">
        <label htmlFor="task-details">Details (optional)</label>
        <textarea
          id="task-details"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          rows={2}
          placeholder="Notes…"
        />
      </div>
      <button type="submit" className="btn primary">
        {submitLabel}
      </button>
    </form>
  )
}

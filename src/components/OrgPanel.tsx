import { useState } from 'react'
import type { Organization } from '../types'
import { formatDisplayDate } from '../dateUtils'
import { Collapse } from './Collapse'

type Props = {
  org: Organization
  onEdit: (org: Organization) => void
  onRequestDelete: (org: Organization) => void
  onAddTask: (orgId: string, title: string) => void
  onToggleTask: (orgId: string, taskId: string, completed: boolean) => void
  onDeleteTask: (orgId: string, taskId: string) => void
}

export function OrgPanel({
  org,
  onEdit,
  onRequestDelete,
  onAddTask,
  onToggleTask,
  onDeleteTask,
}: Props) {
  const [draft, setDraft] = useState('')
  const pending = org.orgTasks.filter((t) => !t.completed).length
  const badge =
    org.orgTasks.length > 0
      ? `${pending}/${org.orgTasks.length}`
      : undefined

  function submitTask(e: React.FormEvent) {
    e.preventDefault()
    const t = draft.trim()
    if (!t) return
    onAddTask(org.id, t)
    setDraft('')
  }

  return (
    <Collapse
      title={
        <span className="collapse-title-stack">
          <span className="collapse-title-main">{org.name}</span>
          <span className="collapse-title-sub">{org.role}</span>
        </span>
      }
      badge={badge}
      className="org-panel"
    >
      <div className="org-panel-inner">
        {(org.startedAt || org.endedAt) && (
          <p className="org-dates subtle">
            {org.startedAt && <span>From {formatDisplayDate(org.startedAt)}</span>}
            {org.startedAt && org.endedAt && ' · '}
            {org.endedAt && <span>Until {formatDisplayDate(org.endedAt)}</span>}
          </p>
        )}
        {org.notes && <p className="org-notes subtle">{org.notes}</p>}

        <Collapse
          title="Tasks for this role"
          badge={org.orgTasks.length || undefined}
          className="collapse-nested"
          defaultOpen={org.orgTasks.length > 0}
        >
          {org.orgTasks.length === 0 && (
            <p className="empty-hint tight">No tasks yet. Add below.</p>
          )}
          <ul className="org-task-list">
            {org.orgTasks.map((t) => (
              <li key={t.id} className="org-task-row">
                <label className="org-task-check">
                  <input
                    type="checkbox"
                    checked={t.completed}
                    onChange={(e) =>
                      onToggleTask(org.id, t.id, e.target.checked)
                    }
                  />
                  <span className={t.completed ? 'done' : ''}>{t.title}</span>
                </label>
                <button
                  type="button"
                  className="btn link danger-text tiny"
                  onClick={() => onDeleteTask(org.id, t.id)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <form className="org-task-add" onSubmit={submitTask}>
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Add a task to complete…"
              aria-label="New task for this club or project"
            />
            <button type="submit" className="btn primary small">
              Add
            </button>
          </form>
        </Collapse>

        <div className="org-panel-actions">
          <button type="button" className="btn secondary small" onClick={() => onEdit(org)}>
            Edit details
          </button>
          <button
            type="button"
            className="btn secondary small danger-text"
            onClick={() => onRequestDelete(org)}
          >
            Remove
          </button>
        </div>
      </div>
    </Collapse>
  )
}

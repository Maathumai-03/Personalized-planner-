import { useState } from 'react'
import type { Organization, OrgKind } from '../types'

type Props = {
  kind: OrgKind
  initial?: Organization | null
  /** Omit card chrome (e.g. inside a modal) */
  embedded?: boolean
  headingId?: string
  onSubmit: (data: Omit<Organization, 'id'>) => void
  onCancel?: () => void
}

export function OrgForm({
  kind,
  initial,
  embedded,
  headingId,
  onSubmit,
  onCancel,
}: Props) {
  const [name, setName] = useState(() => initial?.name ?? '')
  const [role, setRole] = useState(() => initial?.role ?? '')
  const [notes, setNotes] = useState(() => initial?.notes ?? '')
  const [startedAt, setStartedAt] = useState(() => initial?.startedAt ?? '')
  const [endedAt, setEndedAt] = useState(() => initial?.endedAt ?? '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const n = name.trim()
    const r = role.trim()
    if (!n || !r) return
    onSubmit({
      kind,
      name: n,
      role: r,
      notes: notes.trim() || undefined,
      startedAt: startedAt || undefined,
      endedAt: endedAt || undefined,
      orgTasks: initial?.orgTasks ?? [],
    })
    if (!initial) {
      setName('')
      setRole('')
      setNotes('')
      setStartedAt('')
      setEndedAt('')
    }
  }

  const heading = initial
    ? `Edit ${kind === 'club' ? 'club' : 'external project'}`
    : kind === 'club'
      ? 'Add club'
      : 'Add external project'

  const formClass = embedded
    ? 'form-card org-form org-form-embedded'
    : 'card form-card org-form'

  return (
    <form className={formClass} onSubmit={handleSubmit}>
      {headingId ? (
        <h2 id={headingId} className="dialog-title">
          {heading}
        </h2>
      ) : (
        <h3 className="section-heading">{heading}</h3>
      )}
      <div className="form-row">
        <label htmlFor={`org-name-${kind}`}>Name</label>
        <input
          id={`org-name-${kind}`}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={kind === 'club' ? 'Club name' : 'Project or org name'}
        />
      </div>
      <div className="form-row">
        <label htmlFor={`org-role-${kind}`}>Your position / role</label>
        <input
          id={`org-role-${kind}`}
          type="text"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="e.g. Treasurer, Contributor"
        />
      </div>
      <div className="form-row inline">
        <div>
          <label htmlFor={`org-start-${kind}`}>Started (optional)</label>
          <input
            id={`org-start-${kind}`}
            type="date"
            value={startedAt}
            onChange={(e) => setStartedAt(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor={`org-end-${kind}`}>Ended (optional)</label>
          <input
            id={`org-end-${kind}`}
            type="date"
            value={endedAt}
            onChange={(e) => setEndedAt(e.target.value)}
          />
        </div>
      </div>
      <div className="form-row">
        <label htmlFor={`org-notes-${kind}`}>Notes</label>
        <textarea
          id={`org-notes-${kind}`}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
        />
      </div>
      <div className="form-actions-row">
        <button type="submit" className="btn primary">
          {initial ? 'Save' : 'Add'}
        </button>
        {initial && onCancel && (
          <button type="button" className="btn secondary" onClick={onCancel}>
            Cancel edit
          </button>
        )}
      </div>
    </form>
  )
}

import type { Organization } from '../types'
import { formatDisplayDate } from '../dateUtils'

type Props = {
  org: Organization
  onEdit: (org: Organization) => void
  onRequestDelete: (org: Organization) => void
}

export function OrgCard({ org, onEdit, onRequestDelete }: Props) {
  return (
    <article className="org-card">
      <header className="org-card-head">
        <h3 className="org-name">{org.name}</h3>
        <p className="org-role">{org.role}</p>
      </header>
      {(org.startedAt || org.endedAt) && (
        <p className="org-dates">
          {org.startedAt && (
            <span>From {formatDisplayDate(org.startedAt)}</span>
          )}
          {org.startedAt && org.endedAt && ' · '}
          {org.endedAt && <span>Until {formatDisplayDate(org.endedAt)}</span>}
        </p>
      )}
      {org.notes && <p className="org-notes">{org.notes}</p>}
      <div className="task-actions">
        <button
          type="button"
          className="btn link"
          onClick={() => onEdit(org)}
        >
          Edit
        </button>
        <button
          type="button"
          className="btn link danger-text"
          onClick={() => onRequestDelete(org)}
        >
          Delete
        </button>
      </div>
    </article>
  )
}

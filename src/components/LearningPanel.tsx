import { useState } from 'react'
import type { LearningItem, LearningKind } from '../types'
import { Collapse } from './Collapse'

type Props = {
  items: LearningItem[]
  onAdd: (input: { title: string; kind: LearningKind; notes?: string }) => void
  onUpdate: (id: string, patch: Partial<LearningItem>) => void
  onDelete: (id: string) => void
}

export function LearningPanel({ items, onAdd, onUpdate, onDelete }: Props) {
  const [title, setTitle] = useState('')
  const [kind, setKind] = useState<LearningKind>('skill')
  const [notes, setNotes] = useState('')

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const t = title.trim()
    if (!t) return
    onAdd({ title: t, kind, notes: notes.trim() || undefined })
    setTitle('')
    setNotes('')
    setKind('skill')
  }

  const skills = items.filter((x) => x.kind === 'skill')
  const courses = items.filter((x) => x.kind === 'course')

  return (
    <div className="learning-root">
      <p className="panel-intro tight">
        Skills and courses you want to grow — no deadlines, just steady progress.
      </p>

      <form className="card form-card learning-form" onSubmit={submit}>
        <div className="form-row inline">
          <div>
            <label htmlFor="learn-kind">Type</label>
            <select
              id="learn-kind"
              value={kind}
              onChange={(e) => setKind(e.target.value as LearningKind)}
            >
              <option value="skill">Skill</option>
              <option value="course">Course</option>
            </select>
          </div>
          <div className="grow">
            <label htmlFor="learn-title">Title</label>
            <input
              id="learn-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. TypeScript patterns, or Coursera ML"
            />
          </div>
        </div>
        <div className="form-row">
          <label htmlFor="learn-notes">Notes (optional)</label>
          <textarea
            id="learn-notes"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Resources, focus areas, next steps…"
          />
        </div>
        <button type="submit" className="btn primary">
          Add to list
        </button>
      </form>

      <div className="learning-columns">
        <section className="learning-col">
          <h3 className="learning-col-title">Skills</h3>
          {skills.length === 0 ? (
            <p className="empty-hint tight">No skills yet.</p>
          ) : (
            <div className="stack-gap nested">
              {skills.map((item) => (
                <LearningCard
                  key={item.id}
                  item={item}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                />
              ))}
            </div>
          )}
        </section>
        <section className="learning-col">
          <h3 className="learning-col-title">Courses</h3>
          {courses.length === 0 ? (
            <p className="empty-hint tight">No courses yet.</p>
          ) : (
            <div className="stack-gap nested">
              {courses.map((item) => (
                <LearningCard
                  key={item.id}
                  item={item}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function LearningCard({
  item,
  onUpdate,
  onDelete,
}: {
  item: LearningItem
  onUpdate: (id: string, patch: Partial<LearningItem>) => void
  onDelete: (id: string) => void
}) {
  return (
    <Collapse
      title={<span className="collapse-title-main">{item.title}</span>}
      badge={item.kind === 'skill' ? 'Skill' : 'Course'}
      className="learning-card"
    >
      <div className="learning-card-body">
        <label className="field-label">Notes</label>
        <textarea
          rows={3}
          value={item.notes ?? ''}
          onChange={(e) => onUpdate(item.id, { notes: e.target.value })}
          placeholder="What you want to learn, resources…"
        />
        <button
          type="button"
          className="btn link danger-text"
          onClick={() => {
            if (window.confirm(`Remove “${item.title}”?`)) onDelete(item.id)
          }}
        >
          Remove
        </button>
      </div>
    </Collapse>
  )
}

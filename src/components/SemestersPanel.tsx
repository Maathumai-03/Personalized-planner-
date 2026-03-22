import { useState } from 'react'
import type { PlannerState, Semester, Subject } from '../types'
import { Collapse } from './Collapse'

type Props = {
  state: PlannerState
  onAddSemester: (name: string) => void
  onUpdateSemester: (id: string, patch: Partial<Semester>) => void
  onDeleteSemester: (id: string) => void
  onMoveSemester: (id: string, direction: -1 | 1) => void
  onAddSubject: (semesterId: string, name: string) => void
  onUpdateSubject: (id: string, patch: Partial<Subject>) => void
  onDeleteSubject: (id: string) => void
}

export function SemestersPanel({
  state,
  onAddSemester,
  onUpdateSemester,
  onDeleteSemester,
  onMoveSemester,
  onAddSubject,
  onUpdateSubject,
  onDeleteSubject,
}: Props) {
  const [semName, setSemName] = useState('')

  const sorted = [...state.semesters].sort((a, b) => a.order - b.order)

  function addSem(e: React.FormEvent) {
    e.preventDefault()
    const n = semName.trim()
    if (!n) return
    onAddSemester(n)
    setSemName('')
  }

  return (
    <div className="semesters-root">
      <p className="panel-intro tight">
        Add semesters and keep them in order. You can add/remove semesters anytime.
        Subjects nest inside each semester with study and todo planning.
      </p>

      <form className="inline-add-row" onSubmit={addSem}>
        <input
          type="text"
          value={semName}
          onChange={(e) => setSemName(e.target.value)}
          placeholder="New semester name (e.g. Fall 2025 · Sem 1)"
          aria-label="Semester name"
        />
        <button type="submit" className="btn primary">
          Add semester
        </button>
      </form>

      {sorted.length === 0 && (
        <p className="empty-hint">No semesters yet. Add one above.</p>
      )}

      <div className="stack-gap">
        {sorted.map((sem, idx) => {
          const subjects = state.subjects.filter((s) => s.semesterId === sem.id)
          return (
            <Collapse
              key={sem.id}
              title={<span className="collapse-title-main">{sem.name}</span>}
              badge={subjects.length}
              className="semester-block"
            >
              <div className="semester-toolbar">
                <button
                  type="button"
                  className="btn secondary small"
                  disabled={idx === 0}
                  onClick={() => onMoveSemester(sem.id, -1)}
                >
                  Move up
                </button>
                <button
                  type="button"
                  className="btn secondary small"
                  disabled={idx === sorted.length - 1}
                  onClick={() => onMoveSemester(sem.id, 1)}
                >
                  Move down
                </button>
                <button
                  type="button"
                  className="btn secondary small"
                  onClick={() => {
                    const n = window.prompt('Semester name', sem.name)
                    if (n && n.trim()) onUpdateSemester(sem.id, { name: n.trim() })
                  }}
                >
                  Rename
                </button>
                <button
                  type="button"
                  className="btn secondary small danger-text"
                  onClick={() => {
                    if (
                      window.confirm(
                        `Delete “${sem.name}” and all its subjects?`,
                      )
                    )
                      onDeleteSemester(sem.id)
                  }}
                >
                  Delete semester
                </button>
              </div>

              <SubjectList
                semesterId={sem.id}
                subjects={subjects}
                onAdd={onAddSubject}
                onUpdate={onUpdateSubject}
                onDelete={onDeleteSubject}
              />
            </Collapse>
          )
        })}
      </div>
    </div>
  )
}

function SubjectList({
  semesterId,
  subjects,
  onAdd,
  onUpdate,
  onDelete,
}: {
  semesterId: string
  subjects: Subject[]
  onAdd: (semesterId: string, name: string) => void
  onUpdate: (id: string, patch: Partial<Subject>) => void
  onDelete: (id: string) => void
}) {
  const [draft, setDraft] = useState('')

  function add(e: React.FormEvent) {
    e.preventDefault()
    const n = draft.trim()
    if (!n) return
    onAdd(semesterId, n)
    setDraft('')
  }

  return (
    <div className="semester-subjects">
      <form className="inline-add-row" onSubmit={add}>
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add subject"
          aria-label="Subject name"
        />
        <button type="submit" className="btn primary small">
          Add subject
        </button>
      </form>

      {subjects.length === 0 && (
        <p className="empty-hint tight">No subjects in this semester yet.</p>
      )}

      <div className="stack-gap nested">
        {subjects.map((sub) => (
          <Collapse
            key={sub.id}
            title={<span className="collapse-title-main">{sub.name}</span>}
            className="subject-block"
          >
            <div className="subject-fields">
              <label className="field-label">What to study</label>
              <textarea
                rows={3}
                value={sub.studyPlan}
                onChange={(e) =>
                  onUpdate(sub.id, { studyPlan: e.target.value })
                }
                placeholder="Topics, chapters, readings…"
              />
              <label className="field-label">What to do / assignments & prep</label>
              <textarea
                rows={3}
                value={sub.todoPlan}
                onChange={(e) => onUpdate(sub.id, { todoPlan: e.target.value })}
                placeholder="Assignments, labs, exam prep…"
              />
              <button
                type="button"
                className="btn link danger-text"
                onClick={() => {
                  if (window.confirm(`Remove subject “${sub.name}”?`))
                    onDelete(sub.id)
                }}
              >
                Remove subject
              </button>
            </div>
          </Collapse>
        ))}
      </div>
    </div>
  )
}

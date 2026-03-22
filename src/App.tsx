import { useCallback, useRef, useState } from 'react'
import { ConfirmDialog } from './components/ConfirmDialog'
import { Collapse } from './components/Collapse'
import { DateNav } from './components/DateNav'
import { EditTaskModal } from './components/EditTaskModal'
import { LearningPanel } from './components/LearningPanel'
import { OrgForm } from './components/OrgForm'
import { OrgPanel } from './components/OrgPanel'
import { OverviewPanel } from './components/OverviewPanel'
import { QuickTaskForm } from './components/QuickTaskForm'
import { SemestersPanel } from './components/SemestersPanel'
import { TaskList } from './components/TaskList'
import { toLocalISODate } from './dateUtils'
import { usePlannerState } from './hooks/usePlannerState'
import { exportStateJson, parseImportedState } from './storage'
import type { Organization, Task, TaskCategory } from './types'

type Tab =
  | 'overview'
  | 'daily'
  | 'categories'
  | 'clubs'
  | 'semesters'
  | 'learning'

const categoryOrder: TaskCategory[] = [
  'need',
  'wish',
  'assignment',
  'project',
]

const categorySectionTitle: Record<TaskCategory, string> = {
  need: 'Need to do',
  wish: 'Wish to do',
  assignment: 'Assignments',
  project: 'Projects',
}

const navItems: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'daily', label: 'Daily' },
  { id: 'categories', label: 'Categories' },
  { id: 'clubs', label: 'Clubs & projects' },
  { id: 'semesters', label: 'Semesters' },
  { id: 'learning', label: 'Skills & courses' },
]

export default function App() {
  const {
    state,
    addTask,
    updateTask,
    deleteTask,
    addOrganization,
    updateOrganization,
    deleteOrganization,
    addOrgTask,
    updateOrgTask,
    deleteOrgTask,
    addSemester,
    updateSemester,
    deleteSemester,
    moveSemester,
    addSubject,
    updateSubject,
    deleteSubject,
    addLearningItem,
    updateLearningItem,
    deleteLearningItem,
    replaceState,
  } = usePlannerState()

  const [tab, setTab] = useState<Tab>('overview')
  const [selectedDate, setSelectedDate] = useState(() =>
    toLocalISODate(new Date()),
  )
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null)

  const [confirmTask, setConfirmTask] = useState<Task | null>(null)
  const [confirmOrg, setConfirmOrg] = useState<Organization | null>(null)
  const [confirmImport, setConfirmImport] = useState<{
    next: ReturnType<typeof parseImportedState>
  } | null>(null)

  const importInputRef = useRef<HTMLInputElement>(null)
  const todayIso = toLocalISODate(new Date())

  const dailyTasks = state.tasks.filter((t) => t.dueDate === selectedDate)

  const exportBackup = useCallback(() => {
    const json = exportStateJson(state)
    const blob = new Blob([json], { type: 'application/json' })
    const a = document.createElement('a')
    const url = URL.createObjectURL(blob)
    a.href = url
    a.download = `maathu-planner-backup-${toLocalISODate(new Date())}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [state])

  const onImportPick = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      e.target.value = ''
      if (!file) return
      const reader = new FileReader()
      reader.onload = () => {
        const text = String(reader.result ?? '')
        const next = parseImportedState(text)
        if (!next) {
          window.alert(
            'Could not read that file. Make sure it is a valid planner backup JSON.',
          )
          return
        }
        setConfirmImport({ next })
      }
      reader.readAsText(file)
    },
    [],
  )

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-top">
          <div>
            <h1 className="app-title">Maathu planner</h1>
            <p className="app-tagline">
              Dashboard for tasks, school, clubs, and learning — stored in this
              browser only.
            </p>
          </div>
          <div className="header-actions">
            <button type="button" className="btn secondary" onClick={exportBackup}>
              Export JSON
            </button>
            <button
              type="button"
              className="btn secondary"
              onClick={() => importInputRef.current?.click()}
            >
              Import JSON
            </button>
            <input
              ref={importInputRef}
              type="file"
              accept="application/json,.json"
              className="sr-only"
              aria-label="Import backup JSON file"
              onChange={onImportPick}
            />
          </div>
        </div>
      </header>

      <div className="app-shell">
        <aside className="app-sidebar" aria-label="Primary">
          <nav className="sidebar-nav">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`sidebar-link ${tab === item.id ? 'active' : ''}`}
                onClick={() => setTab(item.id)}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="app-content">
          {tab === 'overview' && (
            <section className="panel">
              <h2 className="panel-title">Overview</h2>
              <OverviewPanel state={state} today={todayIso} />
            </section>
          )}

          {tab === 'daily' && (
            <section className="panel">
              <h2 className="panel-title">Daily</h2>
              <Collapse
                title="Day planner"
                defaultOpen
                badge={dailyTasks.filter((t) => !t.completed).length}
              >
                <p className="panel-intro tight">
                  Tasks with a <strong>due date</strong> matching the selected day
                  appear here.
                </p>
                <DateNav selectedDate={selectedDate} onChange={setSelectedDate} />
                <QuickTaskForm
                  key={selectedDate}
                  defaultDueDate={selectedDate}
                  onSubmit={addTask}
                />
                <TaskList
                  tasks={dailyTasks}
                  showDueBadge={false}
                  emptyMessage="No tasks due on this day."
                  onToggle={(id, completed) => updateTask(id, { completed })}
                  onEdit={setEditingTask}
                  onRequestDelete={setConfirmTask}
                />
              </Collapse>
            </section>
          )}

          {tab === 'categories' && (
            <section className="panel">
              <h2 className="panel-title">Categories</h2>
              <p className="panel-intro tight">
                Expand a category to add or review tasks.
              </p>
              <div className="stack-gap">
                {categoryOrder.map((cat, i) => {
                  const list = state.tasks.filter((t) => t.category === cat)
                  return (
                    <Collapse
                      key={cat}
                      title={categorySectionTitle[cat]}
                      badge={list.filter((t) => !t.completed).length}
                      defaultOpen={i === 0}
                      className="category-collapse"
                    >
                      <QuickTaskForm
                        defaultCategory={cat}
                        submitLabel="Add"
                        onSubmit={addTask}
                      />
                      <TaskList
                        tasks={list}
                        showDueBadge
                        emptyMessage="Nothing here yet."
                        onToggle={(id, completed) =>
                          updateTask(id, { completed })
                        }
                        onEdit={setEditingTask}
                        onRequestDelete={setConfirmTask}
                      />
                    </Collapse>
                  )
                })}
              </div>
            </section>
          )}

          {tab === 'clubs' && (
            <section className="panel">
              <h2 className="panel-title">Clubs &amp; external projects</h2>
              <p className="panel-intro tight">
                Your role and nested tasks for each club or project. Expand a row
                to see details and task tracking.
              </p>

              <div className="stack-gap">
                <Collapse title="Clubs" className="org-section" defaultOpen>
                  <Collapse title="Add a club" className="collapse-nested">
                    <OrgForm kind="club" onSubmit={(data) => addOrganization(data)} />
                  </Collapse>
                  <div className="stack-gap nested">
                    {state.organizations
                      .filter((o) => o.kind === 'club')
                      .map((org) => (
                        <OrgPanel
                          key={org.id}
                          org={org}
                          onEdit={setEditingOrg}
                          onRequestDelete={setConfirmOrg}
                          onAddTask={addOrgTask}
                          onToggleTask={(oid, tid, done) =>
                            updateOrgTask(oid, tid, { completed: done })
                          }
                          onDeleteTask={deleteOrgTask}
                        />
                      ))}
                    {state.organizations.filter((o) => o.kind === 'club')
                      .length === 0 && (
                      <p className="empty-hint tight">No clubs yet.</p>
                    )}
                  </div>
                </Collapse>

                <Collapse title="External projects" className="org-section" defaultOpen>
                  <Collapse title="Add a project" className="collapse-nested">
                    <OrgForm
                      kind="external"
                      onSubmit={(data) => addOrganization(data)}
                    />
                  </Collapse>
                  <div className="stack-gap nested">
                    {state.organizations
                      .filter((o) => o.kind === 'external')
                      .map((org) => (
                        <OrgPanel
                          key={org.id}
                          org={org}
                          onEdit={setEditingOrg}
                          onRequestDelete={setConfirmOrg}
                          onAddTask={addOrgTask}
                          onToggleTask={(oid, tid, done) =>
                            updateOrgTask(oid, tid, { completed: done })
                          }
                          onDeleteTask={deleteOrgTask}
                        />
                      ))}
                    {state.organizations.filter((o) => o.kind === 'external')
                      .length === 0 && (
                      <p className="empty-hint tight">No external projects yet.</p>
                    )}
                  </div>
                </Collapse>
              </div>
            </section>
          )}

          {tab === 'semesters' && (
            <section className="panel">
              <h2 className="panel-title">Semesters &amp; subjects</h2>
              <SemestersPanel
                state={state}
                onAddSemester={addSemester}
                onUpdateSemester={updateSemester}
                onDeleteSemester={deleteSemester}
                onMoveSemester={moveSemester}
                onAddSubject={addSubject}
                onUpdateSubject={updateSubject}
                onDeleteSubject={deleteSubject}
              />
            </section>
          )}

          {tab === 'learning' && (
            <section className="panel">
              <h2 className="panel-title">Skills &amp; courses</h2>
              <LearningPanel
                items={state.learningItems}
                onAdd={addLearningItem}
                onUpdate={updateLearningItem}
                onDelete={deleteLearningItem}
              />
            </section>
          )}
        </main>
      </div>

      <EditTaskModal
        key={editingTask?.id ?? 'closed'}
        task={editingTask}
        onClose={() => setEditingTask(null)}
        onSave={(id, patch) => updateTask(id, patch)}
      />

      {editingOrg && (
        <div
          className="dialog-backdrop"
          role="presentation"
          onClick={() => setEditingOrg(null)}
          onKeyDown={(e) => e.key === 'Escape' && setEditingOrg(null)}
        >
          <div
            className="dialog dialog-wide"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-org-title"
            onClick={(e) => e.stopPropagation()}
          >
            <OrgForm
              key={editingOrg.id}
              kind={editingOrg.kind}
              initial={editingOrg}
              embedded
              headingId="edit-org-title"
              onSubmit={(data) => {
                updateOrganization(editingOrg.id, data)
                setEditingOrg(null)
              }}
              onCancel={() => setEditingOrg(null)}
            />
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!confirmTask}
        title="Delete task?"
        message={
          confirmTask
            ? `Remove “${confirmTask.title}”? This cannot be undone.`
            : ''
        }
        onConfirm={() => {
          if (confirmTask) deleteTask(confirmTask.id)
          setConfirmTask(null)
        }}
        onCancel={() => setConfirmTask(null)}
      />

      <ConfirmDialog
        open={!!confirmOrg}
        title="Delete entry?"
        message={
          confirmOrg
            ? `Remove “${confirmOrg.name}” (${confirmOrg.role})?`
            : ''
        }
        onConfirm={() => {
          if (confirmOrg) deleteOrganization(confirmOrg.id)
          setConfirmOrg(null)
        }}
        onCancel={() => setConfirmOrg(null)}
      />

      <ConfirmDialog
        open={!!confirmImport?.next}
        title="Replace all data?"
        message="Importing will replace tasks, organizations, semesters, subjects, and learning items in this browser. Export a backup first if you are unsure."
        confirmLabel="Replace data"
        onConfirm={() => {
          if (confirmImport?.next) replaceState(confirmImport.next)
          setConfirmImport(null)
        }}
        onCancel={() => setConfirmImport(null)}
      />
    </div>
  )
}

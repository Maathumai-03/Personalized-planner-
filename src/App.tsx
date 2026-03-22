import { useCallback, useRef, useState } from 'react'
import { ConfirmDialog } from './components/ConfirmDialog'
import { DateNav } from './components/DateNav'
import { EditTaskModal } from './components/EditTaskModal'
import { OrgCard } from './components/OrgCard'
import { OrgForm } from './components/OrgForm'
import { QuickTaskForm } from './components/QuickTaskForm'
import { TaskList } from './components/TaskList'
import { toLocalISODate } from './dateUtils'
import { usePlannerState } from './hooks/usePlannerState'
import {
  exportStateJson,
  parseImportedState,
} from './storage'
import type { Organization, Task, TaskCategory } from './types'

type Tab = 'daily' | 'categories' | 'orgs'

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

export default function App() {
  const {
    state,
    addTask,
    updateTask,
    deleteTask,
    addOrganization,
    updateOrganization,
    deleteOrganization,
    replaceState,
  } = usePlannerState()

  const [tab, setTab] = useState<Tab>('daily')
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

  const dailyTasks = state.tasks.filter(
    (t) => t.dueDate === selectedDate,
  )

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
          <h1 className="app-title">Maathu planner</h1>
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
        <p className="app-tagline">
          Tasks, categories, and roles — stored only in this browser.
        </p>
        <nav className="tabs" aria-label="Main">
          <button
            type="button"
            className={`tab ${tab === 'daily' ? 'active' : ''}`}
            onClick={() => setTab('daily')}
          >
            Daily
          </button>
          <button
            type="button"
            className={`tab ${tab === 'categories' ? 'active' : ''}`}
            onClick={() => setTab('categories')}
          >
            Categories
          </button>
          <button
            type="button"
            className={`tab ${tab === 'orgs' ? 'active' : ''}`}
            onClick={() => setTab('orgs')}
          >
            Clubs &amp; external
          </button>
        </nav>
      </header>

      <main className="app-main">
        {tab === 'daily' && (
          <section aria-labelledby="daily-heading" className="panel">
            <h2 id="daily-heading" className="panel-title">
              Day view
            </h2>
            <p className="panel-intro">
              Tasks with a <strong>due date</strong> matching the selected day
              appear here. New tasks default to the selected date.
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
              emptyMessage="No tasks due on this day. Add one above or pick another date."
              onToggle={(id, completed) => updateTask(id, { completed })}
              onEdit={setEditingTask}
              onRequestDelete={setConfirmTask}
            />
          </section>
        )}

        {tab === 'categories' && (
          <section aria-labelledby="cat-heading" className="panel">
            <h2 id="cat-heading" className="panel-title">
              By category
            </h2>
            <p className="panel-intro">
              Every task lives in one category. Use this view to plan by type
              of work.
            </p>
            <div className="category-grid">
              {categoryOrder.map((cat) => {
                const list = state.tasks.filter((t) => t.category === cat)
                return (
                  <div key={cat} className="category-column">
                    <h3 className="category-heading">
                      {categorySectionTitle[cat]}
                    </h3>
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
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {tab === 'orgs' && (
          <section aria-labelledby="orgs-heading" className="panel">
            <h2 id="orgs-heading" className="panel-title">
              Clubs &amp; external projects
            </h2>
            <p className="panel-intro">
              Track where you contribute and your <strong>position</strong> in
              each club or external project.
            </p>
            <div className="org-grid">
              <div className="org-column">
                <h3 className="category-heading">Clubs</h3>
                <OrgForm
                  kind="club"
                  onSubmit={(data) => addOrganization(data)}
                />
                <div className="org-list">
                  {state.organizations
                    .filter((o) => o.kind === 'club')
                    .map((org) => (
                      <OrgCard
                        key={org.id}
                        org={org}
                        onEdit={setEditingOrg}
                        onRequestDelete={setConfirmOrg}
                      />
                    ))}
                  {state.organizations.filter((o) => o.kind === 'club')
                    .length === 0 && (
                    <p className="empty-hint">No clubs yet.</p>
                  )}
                </div>
              </div>
              <div className="org-column">
                <h3 className="category-heading">External projects</h3>
                <OrgForm
                  kind="external"
                  onSubmit={(data) => addOrganization(data)}
                />
                <div className="org-list">
                  {state.organizations
                    .filter((o) => o.kind === 'external')
                    .map((org) => (
                      <OrgCard
                        key={org.id}
                        org={org}
                        onEdit={setEditingOrg}
                        onRequestDelete={setConfirmOrg}
                      />
                    ))}
                  {state.organizations.filter((o) => o.kind === 'external')
                    .length === 0 && (
                    <p className="empty-hint">No external projects yet.</p>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

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
        message="Importing will replace tasks and organizations in this browser with the file contents. Export a backup first if you are unsure."
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

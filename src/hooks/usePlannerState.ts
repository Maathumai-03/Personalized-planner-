import { useCallback, useEffect, useState } from 'react'
import type { Organization, PlannerState, Task, TaskCategory } from '../types'
import { loadState, saveState } from '../storage'

function newId(): string {
  return crypto.randomUUID()
}

export function usePlannerState() {
  const [state, setState] = useState<PlannerState>(() => loadState())

  useEffect(() => {
    saveState(state)
  }, [state])

  const addTask = useCallback(
    (input: {
      title: string
      details?: string
      category: TaskCategory
      dueDate?: string
    }) => {
      const task: Task = {
        id: newId(),
        title: input.title.trim(),
        details: input.details?.trim() || undefined,
        category: input.category,
        dueDate: input.dueDate,
        completed: false,
        createdAt: new Date().toISOString(),
      }
      if (!task.title) return
      setState((s) => ({ ...s, tasks: [task, ...s.tasks] }))
    },
    [],
  )

  const updateTask = useCallback((id: string, patch: Partial<Task>) => {
    setState((s) => ({
      ...s,
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    }))
  }, [])

  const deleteTask = useCallback((id: string) => {
    setState((s) => ({ ...s, tasks: s.tasks.filter((t) => t.id !== id) }))
  }, [])

  const addOrganization = useCallback(
    (input: Omit<Organization, 'id'>) => {
      const org: Organization = {
        ...input,
        id: newId(),
        name: input.name.trim(),
        role: input.role.trim(),
        notes: input.notes?.trim() || undefined,
        startedAt: input.startedAt || undefined,
        endedAt: input.endedAt || undefined,
      }
      if (!org.name || !org.role) return
      setState((s) => ({ ...s, organizations: [org, ...s.organizations] }))
    },
    [],
  )

  const updateOrganization = useCallback(
    (id: string, patch: Partial<Organization>) => {
      setState((s) => ({
        ...s,
        organizations: s.organizations.map((o) =>
          o.id === id ? { ...o, ...patch } : o,
        ),
      }))
    },
    [],
  )

  const deleteOrganization = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      organizations: s.organizations.filter((o) => o.id !== id),
    }))
  }, [])

  const replaceState = useCallback((next: PlannerState) => {
    setState(next)
  }, [])

  return {
    state,
    addTask,
    updateTask,
    deleteTask,
    addOrganization,
    updateOrganization,
    deleteOrganization,
    replaceState,
  }
}

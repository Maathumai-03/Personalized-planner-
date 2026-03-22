import { useCallback, useEffect, useState } from 'react'
import type {
  LearningItem,
  LearningKind,
  Organization,
  OrgTask,
  PlannerState,
  Semester,
  Subject,
  Task,
  TaskCategory,
} from '../types'
import { loadState, normalizePlannerState, saveState } from '../storage'

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

  const addOrganization = useCallback((input: Omit<Organization, 'id'>) => {
    const org: Organization = {
      ...input,
      id: newId(),
      name: input.name.trim(),
      role: input.role.trim(),
      notes: input.notes?.trim() || undefined,
      startedAt: input.startedAt || undefined,
      endedAt: input.endedAt || undefined,
      orgTasks: [],
    }
    if (!org.name || !org.role) return
    setState((s) => ({ ...s, organizations: [org, ...s.organizations] }))
  }, [])

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

  const addOrgTask = useCallback((organizationId: string, title: string) => {
    const t = title.trim()
    if (!t) return
    const task: OrgTask = {
      id: newId(),
      title: t,
      completed: false,
      createdAt: new Date().toISOString(),
    }
    setState((s) => ({
      ...s,
      organizations: s.organizations.map((o) =>
        o.id === organizationId
          ? { ...o, orgTasks: [task, ...o.orgTasks] }
          : o,
      ),
    }))
  }, [])

  const updateOrgTask = useCallback(
    (
      organizationId: string,
      taskId: string,
      patch: Partial<OrgTask>,
    ) => {
      setState((s) => ({
        ...s,
        organizations: s.organizations.map((o) =>
          o.id === organizationId
            ? {
                ...o,
                orgTasks: o.orgTasks.map((t) =>
                  t.id === taskId ? { ...t, ...patch } : t,
                ),
              }
            : o,
        ),
      }))
    },
    [],
  )

  const deleteOrgTask = useCallback(
    (organizationId: string, taskId: string) => {
      setState((s) => ({
        ...s,
        organizations: s.organizations.map((o) =>
          o.id === organizationId
            ? {
                ...o,
                orgTasks: o.orgTasks.filter((t) => t.id !== taskId),
              }
            : o,
        ),
      }))
    },
    [],
  )

  const addSemester = useCallback((name: string) => {
    const n = name.trim()
    if (!n) return
    setState((s) => {
      const maxOrder = s.semesters.reduce(
        (m, x) => Math.max(m, x.order),
        -1,
      )
      const semester: Semester = {
        id: newId(),
        name: n,
        order: maxOrder + 1,
      }
      return { ...s, semesters: [...s.semesters, semester] }
    })
  }, [])

  const updateSemester = useCallback((id: string, patch: Partial<Semester>) => {
    setState((s) => ({
      ...s,
      semesters: s.semesters.map((x) => (x.id === id ? { ...x, ...patch } : x)),
    }))
  }, [])

  const deleteSemester = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      semesters: s.semesters.filter((x) => x.id !== id),
      subjects: s.subjects.filter((sub) => sub.semesterId !== id),
    }))
  }, [])

  const moveSemester = useCallback((id: string, direction: -1 | 1) => {
    setState((s) => {
      const sorted = [...s.semesters].sort((a, b) => a.order - b.order)
      const i = sorted.findIndex((x) => x.id === id)
      if (i < 0) return s
      const j = i + direction
      if (j < 0 || j >= sorted.length) return s
      ;[sorted[i], sorted[j]] = [sorted[j], sorted[i]]
      const reordered = sorted.map((sem, idx) => ({ ...sem, order: idx }))
      return { ...s, semesters: reordered }
    })
  }, [])

  const addSubject = useCallback((semesterId: string, name: string) => {
    const n = name.trim()
    if (!n) return
    const subject: Subject = {
      id: newId(),
      semesterId,
      name: n,
      studyPlan: '',
      todoPlan: '',
    }
    setState((s) => ({ ...s, subjects: [subject, ...s.subjects] }))
  }, [])

  const updateSubject = useCallback((id: string, patch: Partial<Subject>) => {
    setState((s) => ({
      ...s,
      subjects: s.subjects.map((sub) =>
        sub.id === id ? { ...sub, ...patch } : sub,
      ),
    }))
  }, [])

  const deleteSubject = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      subjects: s.subjects.filter((sub) => sub.id !== id),
    }))
  }, [])

  const addLearningItem = useCallback(
    (input: { title: string; kind: LearningKind; notes?: string }) => {
      const title = input.title.trim()
      if (!title) return
      const item: LearningItem = {
        id: newId(),
        kind: input.kind,
        title,
        notes: input.notes?.trim() || undefined,
        createdAt: new Date().toISOString(),
      }
      setState((s) => ({
        ...s,
        learningItems: [item, ...s.learningItems],
      }))
    },
    [],
  )

  const updateLearningItem = useCallback(
    (id: string, patch: Partial<LearningItem>) => {
      setState((s) => ({
        ...s,
        learningItems: s.learningItems.map((x) =>
          x.id === id ? { ...x, ...patch } : x,
        ),
      }))
    },
    [],
  )

  const deleteLearningItem = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      learningItems: s.learningItems.filter((x) => x.id !== id),
    }))
  }, [])

  const replaceState = useCallback((next: PlannerState) => {
    setState(normalizePlannerState(next))
  }, [])

  return {
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
  }
}

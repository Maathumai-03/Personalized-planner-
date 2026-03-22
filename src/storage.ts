import type {
  LearningItem,
  Organization,
  PlannerState,
  Semester,
  Subject,
  Task,
} from './types'
import { STORAGE_KEY, STORAGE_VERSION } from './types'

function normalizeOrganization(o: Organization): Organization {
  return {
    ...o,
    orgTasks: Array.isArray(o.orgTasks) ? o.orgTasks : [],
  }
}

export function normalizePlannerState(raw: Partial<PlannerState>): PlannerState {
  const tasks: Task[] = Array.isArray(raw.tasks) ? raw.tasks : []
  const organizations: Organization[] = (
    Array.isArray(raw.organizations) ? raw.organizations : []
  ).map((o) => normalizeOrganization(o as Organization))
  const semesters: Semester[] = Array.isArray(raw.semesters)
    ? (raw.semesters as Semester[])
    : []
  const subjects: Subject[] = Array.isArray(raw.subjects)
    ? (raw.subjects as Subject[])
    : []
  const learningItems: LearningItem[] = Array.isArray(raw.learningItems)
    ? (raw.learningItems as LearningItem[])
    : []

  return {
    version: STORAGE_VERSION,
    tasks,
    organizations,
    semesters,
    subjects,
    learningItems,
  }
}

const defaultState = (): PlannerState => normalizePlannerState({})

export function loadState(): PlannerState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultState()
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object') return defaultState()
    return normalizePlannerState(parsed as Partial<PlannerState>)
  } catch {
    return defaultState()
  }
}

export function saveState(state: PlannerState): void {
  const payload: PlannerState = {
    ...state,
    version: STORAGE_VERSION,
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
}

export function exportStateJson(state: PlannerState): string {
  return JSON.stringify({ ...state, version: STORAGE_VERSION }, null, 2)
}

export function parseImportedState(json: string): PlannerState | null {
  try {
    const parsed = JSON.parse(json) as unknown
    if (!parsed || typeof parsed !== 'object') return null
    const p = parsed as Partial<PlannerState>
    if (!Array.isArray(p.tasks) || !Array.isArray(p.organizations)) return null
    return normalizePlannerState(p)
  } catch {
    return null
  }
}

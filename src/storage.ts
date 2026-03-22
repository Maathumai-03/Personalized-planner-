import type { PlannerState } from './types'
import { STORAGE_KEY, STORAGE_VERSION } from './types'

const defaultState = (): PlannerState => ({
  version: STORAGE_VERSION,
  tasks: [],
  organizations: [],
})

export function loadState(): PlannerState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultState()
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object') return defaultState()
    const p = parsed as Partial<PlannerState>
    return {
      version: typeof p.version === 'number' ? p.version : STORAGE_VERSION,
      tasks: Array.isArray(p.tasks) ? (p.tasks as PlannerState['tasks']) : [],
      organizations: Array.isArray(p.organizations)
        ? (p.organizations as PlannerState['organizations'])
        : [],
    }
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
    return {
      version: STORAGE_VERSION,
      tasks: p.tasks as PlannerState['tasks'],
      organizations: p.organizations as PlannerState['organizations'],
    }
  } catch {
    return null
  }
}

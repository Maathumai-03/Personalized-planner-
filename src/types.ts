export type TaskCategory = 'need' | 'wish' | 'assignment' | 'project'

export interface Task {
  id: string
  title: string
  details?: string
  category: TaskCategory
  /** YYYY-MM-DD — task appears on Daily view when this matches the selected day */
  dueDate?: string
  completed: boolean
  createdAt: string
}

export type OrgKind = 'club' | 'external'

export interface Organization {
  id: string
  kind: OrgKind
  name: string
  role: string
  notes?: string
  startedAt?: string
  endedAt?: string
}

export interface PlannerState {
  version: number
  tasks: Task[]
  organizations: Organization[]
}

export const STORAGE_VERSION = 1
export const STORAGE_KEY = 'maathu-planner-v1'

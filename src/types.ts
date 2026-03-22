export type TaskCategory = 'need' | 'wish' | 'assignment' | 'project'

export interface Task {
  id: string
  title: string
  details?: string
  category: TaskCategory
  dueDate?: string
  completed: boolean
  createdAt: string
}

export type OrgKind = 'club' | 'external'

export interface OrgTask {
  id: string
  title: string
  completed: boolean
  createdAt: string
}

export interface Organization {
  id: string
  kind: OrgKind
  name: string
  role: string
  notes?: string
  startedAt?: string
  endedAt?: string
  orgTasks: OrgTask[]
}

export interface Semester {
  id: string
  name: string
  order: number
}

export interface Subject {
  id: string
  semesterId: string
  name: string
  /** What to study (chapters, topics, etc.) */
  studyPlan: string
  /** Assignments, prep, planning */
  todoPlan: string
}

export type LearningKind = 'skill' | 'course'

export interface LearningItem {
  id: string
  kind: LearningKind
  title: string
  notes?: string
  createdAt: string
}

export interface PlannerState {
  version: number
  tasks: Task[]
  organizations: Organization[]
  semesters: Semester[]
  subjects: Subject[]
  learningItems: LearningItem[]
}

export const STORAGE_VERSION = 2
export const STORAGE_KEY = 'maathu-planner-v1'

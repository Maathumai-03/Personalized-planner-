import type { ReactNode } from 'react'

type Props = {
  title: ReactNode
  badge?: string | number
  defaultOpen?: boolean
  className?: string
  children: ReactNode
  /** Optional id for aria-controls from outside */
  id?: string
}

export function Collapse({
  title,
  badge,
  defaultOpen,
  className,
  children,
  id,
}: Props) {
  return (
    <details
      className={`collapse ${className ?? ''}`.trim()}
      open={defaultOpen}
      id={id}
    >
      <summary className="collapse-summary">
        <span className="collapse-caret" aria-hidden />
        <span className="collapse-title">{title}</span>
        {badge != null && badge !== '' && (
          <span className="collapse-badge">{badge}</span>
        )}
      </summary>
      <div className="collapse-body">{children}</div>
    </details>
  )
}

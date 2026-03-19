import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { AlertTriangle } from 'lucide-react'
import { departmentTheme } from '../lib/theme'

export default function ShiftCard({ shift, compact = false, open = false, onOpen, warning = false }) {
  const draggable = !open
  const dnd = draggable
    ? useDraggable({
        id: shift.id,
        data: {
          type: 'shift',
          shift,
        },
      })
    : { attributes: {}, listeners: {}, setNodeRef: undefined, transform: null, transition: undefined, isDragging: false }

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = dnd
  const theme = departmentTheme[shift.dept]

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    background: open ? '#f8fafc' : theme.soft,
    borderColor: warning ? '#dc2626' : theme.border,
    color: theme.text,
  }

  return (
    <button
      ref={setNodeRef}
      className={`shift-card ${compact ? 'compact' : ''} ${open ? 'open-card' : ''} ${warning ? 'warning-card' : ''}`}
      style={style}
      onDoubleClick={() => onOpen?.(shift)}
      {...listeners}
      {...attributes}
      type="button"
      title={warning ? `${shift.positionCode} · unavailable assignment` : shift.positionCode}
    >
      <div className="shift-card-top compact-only">
        <span className="shift-time">{shift.positionCode}</span>
        {warning && <AlertTriangle size={11} className="card-warning-icon" />}
      </div>
    </button>
  )
}

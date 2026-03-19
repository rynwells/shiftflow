import { Sparkles, X } from 'lucide-react'

export default function ShiftDrawer({
  shift,
  employees = [],
  positions = [],
  suggestions = [],
  onClose,
  onAssign,
  onUpdate,
  onDelete,
  onSendToOpen,
}) {
  if (!shift) return null

  const handlePositionChange = (event) => {
    const next = { ...shift, positionCode: event.target.value }
    shift.open ? onAssign(next) : onUpdate(next)
  }

  const handleEmployeeChange = (event) => {
    const employeeId = event.target.value
    if (!employeeId) return
    const next = { ...shift, employeeId, open: false }
    shift.open ? onAssign(next) : onUpdate(next)
  }

  return (
    <div className="drawer-shell">
      <button aria-label="Close editor" className="drawer-backdrop" onClick={onClose} type="button" />
      <aside className="drawer-panel">
        <div className="drawer-header">
          <div>
            <div className="drawer-eyebrow">Shift editor</div>
            <h2>{shift.positionCode}</h2>
            <div className="drawer-subtitle">{shift.open ? 'Open slot' : shift.employeeName || shift.employeeId}</div>
          </div>
          <button className="icon-btn" onClick={onClose} type="button">
            <X size={16} />
          </button>
        </div>

        {shift.employeeUnavailable && (
          <div className="drawer-alert">
            This employee is marked unavailable on this day.
          </div>
        )}

        <section className="drawer-section">
          <label className="drawer-label">Position</label>
          <select className="drawer-input" value={shift.positionCode} onChange={handlePositionChange}>
            {positions.map((position) => (
              <option key={position} value={position}>{position}</option>
            ))}
          </select>
        </section>

        <section className="drawer-section">
          <label className="drawer-label">Employee</label>
          <select className="drawer-input" value={shift.employeeId || ''} onChange={handleEmployeeChange}>
            <option value="">Select employee</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.name}{employee.unavailableDays?.includes(shift.day) ? ' — unavailable' : ''}
              </option>
            ))}
          </select>
        </section>

        <section className="drawer-meta-grid">
          <div className="meta-card">
            <div className="meta-label">Department</div>
            <div className="meta-value">{shift.dept}</div>
          </div>
          <div className="meta-card">
            <div className="meta-label">Day</div>
            <div className="meta-value">{shift.day}</div>
          </div>
        </section>

        <section className="drawer-section">
          <div className="smart-header">
            <div className="drawer-label">Smart assign</div>
            <div className="smart-pill"><Sparkles size={13} /> Best fit suggestions</div>
          </div>
          {suggestions.length > 0 ? (
            <div className="smart-list">
              {suggestions.map((employee) => (
                <button
                  key={employee.id}
                  className={`smart-item ${!employee.available ? 'disabled' : ''}`}
                  disabled={!employee.available}
                  onClick={() => handleEmployeeChange({ target: { value: employee.id } })}
                  type="button"
                >
                  <div>
                    <div className="smart-name">{employee.name}</div>
                    <div className="smart-meta">{employee.reason}</div>
                  </div>
                  <div className={`smart-tag ${employee.available ? 'good' : 'warn'}`}>
                    {employee.available ? 'Quick assign' : employee.blocked ? 'Unavailable' : 'Busy'}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="smart-empty">No smart suggestions available for this shift yet.</div>
          )}
        </section>

        <div className="drawer-actions">
          {!shift.open && (
            <button className="ghost-btn drawer-action-btn" onClick={() => onSendToOpen(shift)} type="button">Send to open slots</button>
          )}
          {!shift.open && (
            <button className="ghost-btn drawer-action-btn danger" onClick={() => onDelete(shift.id)} type="button">Delete shift</button>
          )}
          <button className="primary-btn drawer-action-btn" onClick={onClose} type="button">Done</button>
        </div>
      </aside>
    </div>
  )
}

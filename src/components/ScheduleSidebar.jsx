import { departmentTheme } from '../lib/theme'

export default function ScheduleSidebar({ departments, coverage, conflicts, missingPositions, availability }) {
  const healthItems = [
    ['Coverage', `${coverage.coverage}%`],
    ['Open slots', `${coverage.open}`],
    ['Conflicts', `${conflicts.length}`],
    ['Blocked days', `${availability.totalBlocks}`],
  ]

  return (
    <div className="sidebar-stack">
      <section className="sidebar-card">
        <div className="sidebar-label">Schedule health</div>
        <div className="score">{coverage.coverage}%</div>
        <div className="progress-list">
          {healthItems.map(([label, value]) => (
            <div key={label} className="progress-row">
              <div className="progress-header">
                <span>{label}</span>
                <span>{value}</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: label === 'Open slots' || label === 'Conflicts' || label === 'Blocked days' ? `${Math.min(Number(value) * 8, 100)}%` : value,
                    background: label === 'Conflicts'
                      ? '#dc2626'
                      : label === 'Open slots'
                        ? '#f59e0b'
                        : label === 'Blocked days'
                          ? '#7c3aed'
                          : '#2563eb',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="sidebar-card">
        <div className="sidebar-label">Department coverage</div>
        <div className="dept-list compact-list">
          {departments.map((dept) => {
            const item = coverage.byDepartment[dept.id]
            const blocked = availability.byDepartment[dept.id]?.count || 0
            return (
              <div className="dept-coverage-item" key={dept.id}>
                <div className="dept-list-item">
                  <div className="dept-list-left">
                    <span className="dept-dot" style={{ background: departmentTheme[dept.id].dot }} />
                    <span>{dept.name}</span>
                  </div>
                  <strong>{item.coverage}%</strong>
                </div>
                <div className="mini-meta">{item.assigned}/{item.required} filled · {item.open} open · {blocked} blocked</div>
              </div>
            )
          })}
        </div>
      </section>

      <section className="sidebar-card">
        <div className="sidebar-label">Availability</div>
        <ul className="warning-list no-bullets availability-list">
          {availability.todayBlocked.map((item) => (
            <li key={item.date} className="availability-item">
              <div className="availability-day">
                <strong>{item.day}</strong>
                <span>{item.count} blocked</span>
              </div>
              <div className="availability-names">{item.employees.map((entry) => entry.employeeName).join(', ') || 'All clear'}</div>
            </li>
          ))}
        </ul>
      </section>

      <section className="sidebar-card">
        <div className="sidebar-label">Missing positions</div>
        <ul className="warning-list no-bullets">
          {missingPositions.map((item, idx) => (
            <li key={`${item.dept}-${item.day}-${item.positionCode}-${idx}`}>
              <strong>{item.positionCode}</strong> <span className="muted-inline">{item.day}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

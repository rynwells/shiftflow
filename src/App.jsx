import { useState, useEffect, useMemo } from 'react'
import { supabase } from './lib/supabase'
import { CalendarDays, ClipboardList, LayoutDashboard, Settings, Users } from 'lucide-react'
import ScheduleToolbar from './components/ScheduleToolbar'
import ScheduleSidebar from './components/ScheduleSidebar'
import ScheduleGrid from './components/ScheduleGrid'
import { departments, initialShifts, weekDays } from './data/scheduleData'
import {
  autoFillOpenSlots,
  buildEmployeeDirectory,
  getAvailabilitySummary,
  getConflicts,
  getCoverageSummary,
  getTopMissingPositions,
} from './lib/scheduleMetrics'

const navItems = [
  ['Dashboard', LayoutDashboard],
  ['Schedule', CalendarDays],
  ['Team', Users],
  ['Requests', ClipboardList],
  ['Settings', Settings],
]

function downloadTextFile(filename, content, type = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export default function App() {
  const [shifts, setShifts] = useState([])
  const [lastAutoFillCount, setLastAutoFillCount] = useState(0)
  const [lastExportType, setLastExportType] = useState('')

  useEffect(() => {
    loadShifts()
  }, [])

  async function loadShifts() {
    const { data, error } = await supabase.from('shifts').select('*')

    if (error) {
      console.error('Load error:', error)
      return
    }

    if (!data || data.length === 0) {
      await saveShifts(initialShifts)
      setShifts(initialShifts)
      return
    }

    const mapped = data.map((row) => ({
      id: row.id,
      employeeId: row.employee_id,
      dept: row.dept,
      day: row.day,
      positionCode: row.position_code,
      note: row.note || '',
    }))

    setShifts(mapped)
  }

  async function saveShifts(updated) {
    const payload = updated.map((shift) => ({
      id: shift.id,
      employee_id: shift.employeeId ?? null,
      dept: shift.dept,
      day: shift.day,
      position_code: shift.positionCode,
      note: shift.note || null,
    }))

    const { error } = await supabase.from('shifts').upsert(payload)

    if (error) {
      console.error('Save error:', error)
    }
  }

  const coverage = useMemo(() => getCoverageSummary(shifts), [shifts])
  const employeeDirectory = useMemo(() => buildEmployeeDirectory(departments), [])
  const availability = useMemo(() => getAvailabilitySummary(departments), [])
  const conflicts = useMemo(() => getConflicts(shifts, employeeDirectory), [shifts, employeeDirectory])
  const missingPositions = useMemo(() => getTopMissingPositions(shifts), [shifts])

  const exportRows = useMemo(() => {
    return shifts
      .map((shift) => {
        const employee = employeeDirectory[shift.employeeId]
        const day = weekDays.find((entry) => entry.key === shift.day)
        return {
          employee: employee?.name || shift.employeeId,
          department: departments.find((dept) => dept.id === shift.dept)?.name || shift.dept,
          day: day?.short || shift.day,
          date: shift.day,
          position: shift.positionCode,
          role: employee?.role || '',
          availability: employee?.unavailableDays?.includes(shift.day) ? 'Blocked' : 'Available',
        }
      })
      .sort((a, b) => a.date.localeCompare(b.date) || a.department.localeCompare(b.department) || a.position.localeCompare(b.position))
  }, [shifts, employeeDirectory])

  function handleAutoFill() {
    const result = autoFillOpenSlots({ shifts, departments })
    setShifts(result.shifts)
    saveShifts(result.shifts)
    setLastAutoFillCount(result.added.length)
  }

  function handleExportCsv() {
    const header = ['Employee', 'Department', 'Day', 'Date', 'Position', 'Role', 'Availability']
    const rows = exportRows.map((row) => [row.employee, row.department, row.day, row.date, row.position, row.role, row.availability])
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(','))
      .join('\n')

    downloadTextFile('shiftflow-schedule-week-of-2026-03-15.csv', csv, 'text/csv;charset=utf-8')
    setLastExportType('CSV export ready')
  }

  function handleExportJson() {
    const payload = {
      workspace: 'Mercy Jefferson',
      weekOf: '2026-03-15',
      exportedAt: new Date().toISOString(),
      coverage,
      rows: exportRows,
    }

    downloadTextFile('shiftflow-schedule-week-of-2026-03-15.json', JSON.stringify(payload, null, 2), 'application/json;charset=utf-8')
    setLastExportType('JSON export ready')
  }

  function handlePrint() {
    window.print()
    setLastExportType('Print layout opened')
  }

  return (
    <div className="app-shell">
      <aside className="sidebar no-print">
        <div className="brand">ShiftFlow</div>
        <div className="workspace-card">
          <div className="workspace-title">Mercy Jefferson</div>
          <div className="workspace-subtitle">Grouped schedule view</div>
        </div>

        <nav className="nav-list">
          {navItems.map(([label, Icon]) => (
            <button key={label} className={`nav-item ${label === 'Schedule' ? 'active' : ''}`} type="button">
              <Icon size={17} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="main-shell">
        <ScheduleToolbar
          coverage={coverage}
          availability={availability}
          autoFillCount={lastAutoFillCount}
          lastExportType={lastExportType}
          onAutoFill={handleAutoFill}
          onExportCsv={handleExportCsv}
          onExportJson={handleExportJson}
          onPrint={handlePrint}
        />

        <section className="print-summary print-only">
          <div>
            <div className="print-title">ShiftFlow Weekly Schedule</div>
            <div className="print-subtitle">Mercy Jefferson · Week of March 15–21, 2026</div>
          </div>
          <div className="print-stats">
            <span>{coverage.totalAssigned} assigned</span>
            <span>{coverage.open} open</span>
            <span>{coverage.coverage}% coverage</span>
          </div>
        </section>

        <div className="content-grid">
          <ScheduleGrid
            departments={departments}
            shifts={shifts}
            setShifts={(updated) => {
              if (typeof updated === 'function') {
                setShifts((current) => {
                  const next = updated(current)
                  saveShifts(next)
                  return next
                })
              } else {
                setShifts(updated)
                saveShifts(updated)
              }
            }}
            openSlots={coverage.openSlots}
          />
          <ScheduleSidebar
            departments={departments}
            coverage={coverage}
            conflicts={conflicts}
            missingPositions={missingPositions}
            availability={availability}
          />
        </div>
      </main>
    </div>
  )
}
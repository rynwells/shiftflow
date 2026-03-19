import { Fragment, useMemo, useState } from 'react'
import { DndContext, DragOverlay, PointerSensor, useDroppable, useSensor, useSensors } from '@dnd-kit/core'
import { AlertTriangle, ChevronDown, Minus, Plus } from 'lucide-react'
import ShiftCard from './ShiftCard'
import ShiftDrawer from './ShiftDrawer'
import { positionTemplates, weekDays } from '../data/scheduleData'
import { buildEmployeeDirectory, getSmartAssignSuggestions, isEmployeeUnavailable } from '../lib/scheduleMetrics'
import { departmentTheme } from '../lib/theme'

function DropCell({ employee, day, shifts, onQuickAdd, activeTarget, onOpenShift, showUnavailable }) {
  const droppableId = `${employee.id}:${day.key}`
  const { setNodeRef, isOver } = useDroppable({
    id: droppableId,
    disabled: showUnavailable,
    data: {
      type: 'day-cell',
      employeeId: employee.id,
      day: day.key,
      disabled: showUnavailable,
    },
  })

  const isActive = activeTarget === droppableId

  return (
    <div ref={setNodeRef} className={`day-cell ${isOver || isActive ? 'day-cell-over' : ''} ${showUnavailable ? 'day-cell-unavailable' : ''}`}>
      {shifts.length > 0 ? (
        shifts.map((shift) => <ShiftCard key={shift.id} shift={shift} compact onOpen={onOpenShift} warning={showUnavailable} />)
      ) : showUnavailable ? (
        <div className="unavailable-chip">
          <Minus size={12} />
          Unavailable
        </div>
      ) : (
        <button className="empty-cell-btn" onClick={() => onQuickAdd(employee, day)} type="button">
          <Plus size={12} />
        </button>
      )}
    </div>
  )
}

function OpenDropCell({ dept, day, openSlots, activeTarget, onOpenShift }) {
  const droppableId = `open:${dept}:${day.key}`
  const { setNodeRef, isOver } = useDroppable({
    id: droppableId,
    data: {
      type: 'open-cell',
      dept,
      day: day.key,
    },
  })

  const isActive = activeTarget === droppableId

  return (
    <div ref={setNodeRef} className={`day-cell open-row-cell ${isOver || isActive ? 'day-cell-over' : ''}`}>
      {openSlots.length > 0 ? (
        openSlots.map((slot) => <ShiftCard key={slot.id} shift={slot} compact open onOpen={onOpenShift} />)
      ) : (
        <div className="empty-open">Covered</div>
      )}
    </div>
  )
}

export default function ScheduleGrid({ departments, shifts, setShifts, openSlots }) {
  const [activeShift, setActiveShift] = useState(null)
  const [activeTarget, setActiveTarget] = useState(null)
  const [drawerShift, setDrawerShift] = useState(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const shiftsByEmployeeAndDay = useMemo(() => {
    const map = new Map()
    for (const shift of shifts) {
      const key = `${shift.employeeId}:${shift.day}`
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(shift)
    }
    return map
  }, [shifts])

  const employeeDirectory = useMemo(() => buildEmployeeDirectory(departments), [departments])

  function handleDragStart(event) {
    setActiveShift(event.active.data.current?.shift || null)
  }

  function handleDragOver(event) {
    setActiveTarget(event.over?.id || null)
  }

  function handleDragEnd(event) {
    const draggedShift = event.active.data.current?.shift
    const target = event.over?.data.current

    if (!draggedShift || !target || target.disabled) {
      setActiveShift(null)
      setActiveTarget(null)
      return
    }

    if (target.type === 'day-cell') {
      const employee = employeeDirectory[target.employeeId]
      if (!isEmployeeUnavailable(employee, target.day)) {
        setShifts((current) =>
          current.map((shift) =>
            shift.id === draggedShift.id
              ? { ...shift, employeeId: target.employeeId, day: target.day }
              : shift,
          ),
        )
      }
    }

    if (target.type === 'open-cell') {
      setShifts((current) => current.filter((shift) => shift.id !== draggedShift.id))
      if (drawerShift?.id === draggedShift.id) setDrawerShift(null)
    }

    setActiveShift(null)
    setActiveTarget(null)
  }

  function handleDragCancel() {
    setActiveShift(null)
    setActiveTarget(null)
  }

  function handleQuickAdd(employee, day) {
    if (isEmployeeUnavailable(employee, day.key)) return

    const dept = departments.find((item) => item.employees.some((entry) => entry.id === employee.id))?.id || 'cafeteria'
    const available = (openSlots?.[dept]?.[day.key] || [])[0]?.positionCode || positionTemplates[dept][0]

    setShifts((current) => [
      ...current,
      {
        id: `shift-${Date.now()}`,
        employeeId: employee.id,
        day: day.key,
        positionCode: available,
        dept,
      },
    ])
  }

  function openDrawer(shift) {
    setDrawerShift(shift)
  }

  function closeDrawer() {
    setDrawerShift(null)
  }

  function updateAssignedShift(updatedShift) {
    const employee = employeeDirectory[updatedShift.employeeId]
    if (updatedShift.employeeId && isEmployeeUnavailable(employee, updatedShift.day)) return

    setShifts((current) => current.map((shift) => (shift.id === updatedShift.id ? { ...shift, ...updatedShift, open: undefined } : shift)))
    setDrawerShift({ ...updatedShift, open: false })
  }

  function assignOpenShift(openShift) {
    const employee = employeeDirectory[openShift.employeeId]
    if (isEmployeeUnavailable(employee, openShift.day)) return

    const createdShift = {
      id: `shift-${Date.now()}`,
      employeeId: openShift.employeeId,
      day: openShift.day,
      positionCode: openShift.positionCode,
      dept: openShift.dept,
    }

    setShifts((current) => [...current, createdShift])
    setDrawerShift(createdShift)
  }

  function deleteAssignedShift(shiftId) {
    setShifts((current) => current.filter((shift) => shift.id !== shiftId))
    setDrawerShift(null)
  }

  function sendAssignedShiftToOpen(shift) {
    if (!shift.open) {
      setShifts((current) => current.filter((entry) => entry.id !== shift.id))
    }

    setDrawerShift({ ...shift, open: true })
  }

  const drawerEmployees = drawerShift ? departments.find((dept) => dept.id === drawerShift.dept)?.employees || [] : []
  const drawerPositions = drawerShift ? positionTemplates[drawerShift.dept] || [drawerShift.positionCode] : []
  const hydratedDrawerShift = drawerShift?.employeeId
    ? {
        ...drawerShift,
        employeeName: employeeDirectory[drawerShift.employeeId]?.name,
        employeeUnavailable: isEmployeeUnavailable(employeeDirectory[drawerShift.employeeId], drawerShift.day),
      }
    : drawerShift

  const smartSuggestions = hydratedDrawerShift
    ? getSmartAssignSuggestions({
        shift: hydratedDrawerShift,
        employees: drawerEmployees,
        shifts,
      })
    : []

  return (
    <>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="grid-shell">
          <div className="schedule-grid">
            <div className="grid-header sticky-left">Employee</div>
            {weekDays.map((day) => (
              <div key={day.key} className={`grid-header ${day.short === 'Wed' ? 'today-column' : ''}`}>
                <div>{day.short}</div>
                <span>{day.label}</span>
              </div>
            ))}

            {departments.map((dept) => {
              const theme = departmentTheme[dept.id]
              return (
                <Fragment key={dept.id}>
                  <div className="department-row sticky-left" style={{ background: theme.soft, borderColor: theme.border, color: theme.text }}>
                    <div className="department-title">
                      <ChevronDown size={14} />
                      <span className="dept-dot" style={{ background: theme.dot }} />
                      <strong>{dept.name}</strong>
                    </div>
                    <span>{dept.employees.length}</span>
                  </div>
                  {weekDays.map((day) => (
                    <div key={`${dept.id}-${day.key}`} className="department-fill" style={{ background: theme.soft, borderColor: theme.border }} />
                  ))}

                  {dept.employees.map((employee) => (
                    <Fragment key={employee.id}>
                      <div className="employee-cell sticky-left">
                        <div className="employee-name-row">
                          <div className="employee-name">{employee.name}</div>
                          {employee.unavailableDays?.length > 0 && <AlertTriangle size={12} className="employee-warning-icon" />}
                        </div>
                        <div className="employee-role">{employee.role}</div>
                      </div>
                      {weekDays.map((day) => {
                        const key = `${employee.id}:${day.key}`
                        const cellShifts = shiftsByEmployeeAndDay.get(key) || []
                        const unavailable = isEmployeeUnavailable(employee, day.key)
                        return (
                          <DropCell
                            key={key}
                            employee={employee}
                            day={day}
                            shifts={cellShifts}
                            onQuickAdd={handleQuickAdd}
                            activeTarget={activeTarget}
                            onOpenShift={openDrawer}
                            showUnavailable={unavailable}
                          />
                        )
                      })}
                    </Fragment>
                  ))}

                  <div className="employee-cell sticky-left open-label-cell">
                    <div className="employee-name">Open slots</div>
                    <div className="employee-role">Unassigned positions</div>
                  </div>
                  {weekDays.map((day) => (
                    <OpenDropCell
                      key={`open-${dept.id}-${day.key}`}
                      dept={dept.id}
                      day={day}
                      openSlots={openSlots?.[dept.id]?.[day.key] || []}
                      activeTarget={activeTarget}
                      onOpenShift={openDrawer}
                    />
                  ))}
                </Fragment>
              )
            })}
          </div>
        </div>

        <DragOverlay>
          {activeShift ? <ShiftCard shift={activeShift} /> : null}
        </DragOverlay>
      </DndContext>

      <ShiftDrawer
        shift={hydratedDrawerShift}
        employees={drawerEmployees}
        positions={drawerPositions}
        suggestions={smartSuggestions}
        onClose={closeDrawer}
        onAssign={assignOpenShift}
        onUpdate={updateAssignedShift}
        onDelete={deleteAssignedShift}
        onSendToOpen={sendAssignedShiftToOpen}
      />
    </>
  )
}

import { positionTemplates, weekDays } from '../data/scheduleData'

export function isEmployeeUnavailable(employee, day) {
  return Boolean(employee?.unavailableDays?.includes(day))
}

export function buildEmployeeDirectory(departments = []) {
  return Object.fromEntries(
    departments.flatMap((dept) => (dept.employees || []).map((employee) => [employee.id, employee])),
  )
}

export function getOpenSlotsByDepartmentDay(shifts) {
  const assigned = new Map()

  for (const shift of shifts) {
    if (!shift.employeeId) continue
    assigned.set(`${shift.dept}:${shift.day}:${shift.positionCode}`, shift.id)
  }

  const result = {}

  for (const [dept, positions] of Object.entries(positionTemplates)) {
    result[dept] = {}
    for (const day of weekDays) {
      result[dept][day.key] = positions
        .filter((positionCode) => !assigned.has(`${dept}:${day.key}:${positionCode}`))
        .map((positionCode) => ({
          id: `open:${dept}:${day.key}:${positionCode}`,
          dept,
          day: day.key,
          positionCode,
          open: true,
        }))
    }
  }

  return result
}

export function getCoverageSummary(shifts) {
  const openSlots = getOpenSlotsByDepartmentDay(shifts)
  const byDepartment = {}
  let totalRequired = 0
  let totalAssigned = 0

  for (const [dept, positions] of Object.entries(positionTemplates)) {
    const required = positions.length * weekDays.length
    const open = weekDays.reduce((sum, day) => sum + openSlots[dept][day.key].length, 0)
    const assigned = required - open
    const coverage = required === 0 ? 100 : Math.round((assigned / required) * 100)

    byDepartment[dept] = {
      required,
      assigned,
      open,
      coverage,
    }

    totalRequired += required
    totalAssigned += assigned
  }

  return {
    totalRequired,
    totalAssigned,
    open: totalRequired - totalAssigned,
    coverage: totalRequired === 0 ? 100 : Math.round((totalAssigned / totalRequired) * 100),
    byDepartment,
    openSlots,
  }
}

export function getAvailabilitySummary(departments = []) {
  const byDepartment = {}
  const byDay = Object.fromEntries(weekDays.map((day) => [day.key, []]))
  let totalBlocks = 0

  for (const dept of departments) {
    const blocked = []
    for (const employee of dept.employees || []) {
      for (const day of employee.unavailableDays || []) {
        blocked.push({ employeeId: employee.id, employeeName: employee.name, day })
        byDay[day]?.push({ employeeId: employee.id, employeeName: employee.name, dept: dept.id })
        totalBlocks += 1
      }
    }

    byDepartment[dept.id] = {
      blocked,
      count: blocked.length,
    }
  }

  return {
    totalBlocks,
    byDepartment,
    byDay,
    todayBlocked: weekDays.map((day) => ({
      day: day.short,
      date: day.key,
      count: byDay[day.key]?.length || 0,
      employees: byDay[day.key] || [],
    })),
  }
}

export function getConflicts(shifts, employeeDirectory = {}) {
  const employeeDayMap = new Map()
  const positionMap = new Map()
  const conflicts = []

  for (const shift of shifts) {
    const employeeKey = `${shift.employeeId}:${shift.day}`
    if (employeeDayMap.has(employeeKey)) {
      conflicts.push({ type: 'employee', shiftId: shift.id, key: employeeKey })
    } else {
      employeeDayMap.set(employeeKey, shift.id)
    }

    const positionKey = `${shift.dept}:${shift.day}:${shift.positionCode}`
    if (positionMap.has(positionKey)) {
      conflicts.push({ type: 'position', shiftId: shift.id, key: positionKey })
    } else {
      positionMap.set(positionKey, shift.id)
    }

    const employee = employeeDirectory[shift.employeeId]
    if (isEmployeeUnavailable(employee, shift.day)) {
      conflicts.push({ type: 'availability', shiftId: shift.id, key: employeeKey })
    }
  }

  return conflicts
}

export function getTopMissingPositions(shifts, limit = 8) {
  const { openSlots } = getCoverageSummary(shifts)
  const items = []

  for (const [dept, days] of Object.entries(openSlots)) {
    for (const day of weekDays) {
      for (const slot of days[day.key]) {
        items.push({ dept, day: day.short, positionCode: slot.positionCode })
      }
    }
  }

  return items.slice(0, limit)
}

export function getSmartAssignSuggestions({ shift, employees = [], shifts = [], limit = 3 }) {
  if (!shift || !shift.dept || !shift.day) return []

  const currentShiftId = shift.id
  const currentEmployeeId = shift.open ? null : shift.employeeId
  const relevantShifts = shifts.filter((entry) => entry.id !== currentShiftId)

  const employeeDayAssignments = new Map()
  const weeklyLoad = new Map()
  const positionExperience = new Map()

  for (const entry of relevantShifts) {
    if (!entry.employeeId) continue

    const dayKey = `${entry.employeeId}:${entry.day}`
    employeeDayAssignments.set(dayKey, (employeeDayAssignments.get(dayKey) || 0) + 1)
    weeklyLoad.set(entry.employeeId, (weeklyLoad.get(entry.employeeId) || 0) + 1)

    if (entry.dept === shift.dept && entry.positionCode === shift.positionCode) {
      positionExperience.set(entry.employeeId, (positionExperience.get(entry.employeeId) || 0) + 1)
    }
  }

  return employees
    .map((employee) => {
      const sameDayCount = employeeDayAssignments.get(`${employee.id}:${shift.day}`) || 0
      const load = weeklyLoad.get(employee.id) || 0
      const experience = positionExperience.get(employee.id) || 0
      const isCurrentAssignee = employee.id === currentEmployeeId
      const blocked = isEmployeeUnavailable(employee, shift.day)
      const available = (!blocked && sameDayCount === 0) || isCurrentAssignee
      const score = (available ? 120 : -40) + experience * 10 - load * 3 - (isCurrentAssignee ? 15 : 0) - (blocked ? 120 : 0)

      return {
        ...employee,
        available,
        blocked,
        load,
        experience,
        isCurrentAssignee,
        score,
        reason: blocked
          ? 'Unavailable that day'
          : available
            ? experience > 0
              ? `${experience} similar ${experience === 1 ? 'assignment' : 'assignments'} · ${load} this week`
              : `${load} assigned this week`
            : 'Already assigned this day',
      }
    })
    .filter((employee) => !employee.isCurrentAssignee)
    .sort((a, b) => b.score - a.score || a.load - b.load || b.experience - a.experience || a.name.localeCompare(b.name))
    .slice(0, limit)
}

function buildEmployeeWeeklyLoad(shifts) {
  const load = new Map()
  for (const shift of shifts) {
    if (!shift.employeeId) continue
    load.set(shift.employeeId, (load.get(shift.employeeId) || 0) + 1)
  }
  return load
}

function buildEmployeeDayAssignments(shifts) {
  const map = new Map()
  for (const shift of shifts) {
    if (!shift.employeeId) continue
    map.set(`${shift.employeeId}:${shift.day}`, shift.id)
  }
  return map
}

export function autoFillOpenSlots({ shifts, departments }) {
  const nextShifts = [...shifts]
  const load = buildEmployeeWeeklyLoad(nextShifts)
  const employeeDayAssignments = buildEmployeeDayAssignments(nextShifts)
  const created = []

  for (const dept of departments) {
    const employees = dept.employees || []
    const templates = positionTemplates[dept.id] || []

    for (const day of weekDays) {
      const assignedPositions = new Set(
        nextShifts
          .filter((shift) => shift.dept === dept.id && shift.day === day.key)
          .map((shift) => shift.positionCode),
      )

      for (const positionCode of templates) {
        if (assignedPositions.has(positionCode)) continue

        const bestEmployee = [...employees]
          .map((employee) => {
            const blocked = isEmployeeUnavailable(employee, day.key)
            const sameDayAssigned = employeeDayAssignments.has(`${employee.id}:${day.key}`)
            const weeklyLoad = load.get(employee.id) || 0
            const experience = nextShifts.filter(
              (shift) => shift.employeeId === employee.id && shift.dept === dept.id && shift.positionCode === positionCode,
            ).length

            return {
              employee,
              blocked,
              sameDayAssigned,
              weeklyLoad,
              experience,
              score: (blocked ? -1200 : 100) + (sameDayAssigned ? -1000 : 0) + experience * 12 - weeklyLoad * 4,
            }
          })
          .sort((a, b) => b.score - a.score || a.weeklyLoad - b.weeklyLoad || b.experience - a.experience || a.employee.name.localeCompare(b.employee.name))[0]

        if (!bestEmployee || bestEmployee.sameDayAssigned || bestEmployee.blocked) continue

        const newShift = {
          id: `shift-${day.key}-${positionCode}-${bestEmployee.employee.id}-${created.length + 1}`,
          employeeId: bestEmployee.employee.id,
          day: day.key,
          positionCode,
          dept: dept.id,
          autoFilled: true,
        }

        nextShifts.push(newShift)
        created.push(newShift)
        assignedPositions.add(positionCode)
        employeeDayAssignments.set(`${bestEmployee.employee.id}:${day.key}`, newShift.id)
        load.set(bestEmployee.employee.id, (load.get(bestEmployee.employee.id) || 0) + 1)
      }
    }
  }

  return {
    shifts: nextShifts,
    added: created,
  }
}

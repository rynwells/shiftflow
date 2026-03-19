export const weekDays = [
  { key: '2026-03-15', short: 'Sun', label: 'Mar 15' },
  { key: '2026-03-16', short: 'Mon', label: 'Mar 16' },
  { key: '2026-03-17', short: 'Tue', label: 'Mar 17' },
  { key: '2026-03-18', short: 'Wed', label: 'Mar 18' },
  { key: '2026-03-19', short: 'Thu', label: 'Mar 19' },
  { key: '2026-03-20', short: 'Fri', label: 'Mar 20' },
  { key: '2026-03-21', short: 'Sat', label: 'Mar 21' },
]

export const departments = [
  {
    id: 'cafeteria',
    name: 'Cafeteria',
    color: 'blue',
    employees: [
      { id: 'angela', name: 'Angela Brown', role: 'Cashier', unavailableDays: ['2026-03-17'] },
      { id: 'jordan', name: 'Jordan Long', role: 'Server', unavailableDays: ['2026-03-15', '2026-03-21'] },
      { id: 'mia', name: 'Mia Carter', role: 'Barista', unavailableDays: ['2026-03-20'] },
    ],
  },
  {
    id: 'cooks',
    name: 'Cooks',
    color: 'green',
    employees: [
      { id: 'chris', name: 'Chris Miller', role: 'Grill', unavailableDays: ['2026-03-18'] },
      { id: 'alicia', name: 'Alicia Ross', role: 'Prep', unavailableDays: ['2026-03-15', '2026-03-16'] },
      { id: 'david', name: 'David Hall', role: 'Lead Cook', unavailableDays: ['2026-03-21'] },
    ],
  },
  {
    id: 'utility',
    name: 'Utility',
    color: 'orange',
    employees: [
      { id: 'kevin', name: 'Kevin Green', role: 'Dishroom', unavailableDays: ['2026-03-16'] },
      { id: 'maria', name: 'Maria Lopez', role: 'Utility', unavailableDays: ['2026-03-19'] },
    ],
  },
  {
    id: 'ambassadors',
    name: 'Patient Ambassadors',
    color: 'purple',
    employees: [
      { id: 'nina', name: 'Nina Brooks', role: 'Ambassador', unavailableDays: ['2026-03-20'] },
      { id: 'omar', name: 'Omar Reed', role: 'Late Turn', unavailableDays: ['2026-03-17'] },
    ],
  },
]

export const positionTemplates = {
  cafeteria: ['C1', 'C2', 'C3'],
  cooks: ['CK1', 'CK2', 'CK3'],
  utility: ['U1', 'U2'],
  ambassadors: ['P1', 'P2', 'P3'],
}

export const initialShifts = [
  { id: 's1', employeeId: 'angela', day: '2026-03-15', positionCode: 'C1', dept: 'cafeteria' },
  { id: 's2', employeeId: 'angela', day: '2026-03-16', positionCode: 'C1', dept: 'cafeteria' },
  { id: 's3', employeeId: 'angela', day: '2026-03-18', positionCode: 'C1', dept: 'cafeteria' },
  { id: 's4', employeeId: 'angela', day: '2026-03-19', positionCode: 'C1', dept: 'cafeteria' },
  { id: 's5', employeeId: 'angela', day: '2026-03-20', positionCode: 'C1', dept: 'cafeteria' },
  { id: 's6', employeeId: 'jordan', day: '2026-03-16', positionCode: 'C2', dept: 'cafeteria' },
  { id: 's7', employeeId: 'jordan', day: '2026-03-17', positionCode: 'C2', dept: 'cafeteria' },
  { id: 's8', employeeId: 'jordan', day: '2026-03-18', positionCode: 'C2', dept: 'cafeteria' },
  { id: 's9', employeeId: 'mia', day: '2026-03-15', positionCode: 'C3', dept: 'cafeteria' },
  { id: 's10', employeeId: 'mia', day: '2026-03-17', positionCode: 'C3', dept: 'cafeteria' },
  { id: 's11', employeeId: 'mia', day: '2026-03-19', positionCode: 'C3', dept: 'cafeteria' },

  { id: 's12', employeeId: 'chris', day: '2026-03-15', positionCode: 'CK1', dept: 'cooks' },
  { id: 's13', employeeId: 'chris', day: '2026-03-16', positionCode: 'CK1', dept: 'cooks' },
  { id: 's14', employeeId: 'chris', day: '2026-03-17', positionCode: 'CK1', dept: 'cooks' },
  { id: 's15', employeeId: 'chris', day: '2026-03-19', positionCode: 'CK1', dept: 'cooks' },
  { id: 's16', employeeId: 'chris', day: '2026-03-20', positionCode: 'CK1', dept: 'cooks' },
  { id: 's17', employeeId: 'alicia', day: '2026-03-17', positionCode: 'CK2', dept: 'cooks' },
  { id: 's18', employeeId: 'alicia', day: '2026-03-18', positionCode: 'CK2', dept: 'cooks' },
  { id: 's19', employeeId: 'alicia', day: '2026-03-19', positionCode: 'CK2', dept: 'cooks' },
  { id: 's20', employeeId: 'david', day: '2026-03-15', positionCode: 'CK3', dept: 'cooks' },
  { id: 's21', employeeId: 'david', day: '2026-03-16', positionCode: 'CK3', dept: 'cooks' },
  { id: 's22', employeeId: 'david', day: '2026-03-18', positionCode: 'CK3', dept: 'cooks' },

  { id: 's23', employeeId: 'kevin', day: '2026-03-15', positionCode: 'U1', dept: 'utility' },
  { id: 's24', employeeId: 'kevin', day: '2026-03-17', positionCode: 'U1', dept: 'utility' },
  { id: 's25', employeeId: 'kevin', day: '2026-03-19', positionCode: 'U1', dept: 'utility' },
  { id: 's26', employeeId: 'kevin', day: '2026-03-20', positionCode: 'U1', dept: 'utility' },
  { id: 's27', employeeId: 'maria', day: '2026-03-16', positionCode: 'U2', dept: 'utility' },
  { id: 's28', employeeId: 'maria', day: '2026-03-18', positionCode: 'U2', dept: 'utility' },
  { id: 's29', employeeId: 'maria', day: '2026-03-20', positionCode: 'U2', dept: 'utility' },

  { id: 's30', employeeId: 'nina', day: '2026-03-15', positionCode: 'P1', dept: 'ambassadors' },
  { id: 's31', employeeId: 'nina', day: '2026-03-16', positionCode: 'P1', dept: 'ambassadors' },
  { id: 's32', employeeId: 'nina', day: '2026-03-17', positionCode: 'P1', dept: 'ambassadors' },
  { id: 's33', employeeId: 'omar', day: '2026-03-18', positionCode: 'P2', dept: 'ambassadors' },
  { id: 's34', employeeId: 'omar', day: '2026-03-19', positionCode: 'P2', dept: 'ambassadors' },
  { id: 's35', employeeId: 'omar', day: '2026-03-20', positionCode: 'P2', dept: 'ambassadors' },
]

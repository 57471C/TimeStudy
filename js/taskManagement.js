import {
  toConsole,
  parseTimeFromHHMMSSMS,
  formatDuration,
} from './functions.js'

// State management
let opCount = 0
let firstOp = 'y'
let taskCount = 0
const yama = []
const opNames = []
const opStartTimes = []

const updateTaskList = () => {
  toConsole('updateTaskList', 'Task list updated')
}

const addOp = () => {
  const player = document.getElementById('my_video')
  player.pause()
  toConsole('playPause', 'play paused to add operation')
  const opName = window.prompt('Please name the Operation')
  if (!opName) {
    window.alert('Operation name cannot be empty.')
    return
  }
  const startTime = player.currentTime
  toConsole('operation start time', startTime)
  if (firstOp === 'n') {
    opCount += 1
    toConsole('created operation, opCount incremented', opCount)
  } else {
    firstOp = 'n'
    toConsole('created first operation yama[0]', opCount)
  }
  opNames[opCount] = opName
  opStartTimes[opCount] = startTime
  taskCount = 0
  yama[opCount] = []
  toConsole('taskCount reset', taskCount)
  updateTaskList()
}

const addTask = () => {
  const player = document.getElementById('my_video')
  player.pause()
  toConsole('playPause', 'play paused to add task')
  if (yama.length === 0) {
    window.alert('No Operation yet! Please add an Operation first.')
    toConsole('tried to add task, no operation exists')
    addOp()
    if (yama.length === 0) {
      return
    }
  }
  const taskName = window.prompt('Please name the Task')
  if (!taskName) {
    window.alert('Task name cannot be empty.')
    return
  }
  toConsole('taskName', taskName)
  const taskEnd = player.currentTime * 1000
  toConsole('taskEnd', taskEnd)
  const opIndex = opCount
  const opStartTimeInputId = `opTimeInput-${opIndex}`
  const opTimeInput = document.getElementById(opStartTimeInputId)
  const opStartTime = parseTimeFromHHMMSSMS(opTimeInput.value) || 0
  toConsole('opStartTime from input', opStartTime)
  const taskStart =
    taskCount === 0 ? opStartTime * 1000 : yama[opCount][taskCount - 1].taskEnd
  toConsole('taskStart', taskStart)
  const taskHeight =
    taskCount === 0 ? taskEnd - opStartTime * 1000 : taskEnd - taskStart
  toConsole('taskHeight', taskHeight)
  let taskStatus = window.prompt('VA, NVA, W? (or 1=VA, 2=NVA, 3=W)')
  if (!taskStatus) {
    window.alert('Task status cannot be empty.')
    return
  }
  toConsole('taskStatus input', taskStatus)

  taskStatus = taskStatus.toUpperCase()
  if (taskStatus === '1') taskStatus = 'VA'
  if (taskStatus === '2') taskStatus = 'NVA'
  if (taskStatus === '3') taskStatus = 'W'

  if (!['VA', 'NVA', 'W'].includes(taskStatus)) {
    window.alert(
      'Invalid task status. Please enter VA, NVA, W, 1 (VA), 2 (NVA), or 3 (W).'
    )
    return
  }
  toConsole('taskStatus processed', taskStatus)
  yama[opCount][taskCount] = {
    taskName,
    taskStart,
    taskEnd,
    taskHeight,
    taskStatus,
  }
  taskCount += 1
  updateTaskList()
}

const insertTask = (opIndex, taskIndex) => {
  const player = document.getElementById('my_video')
  player.pause()
  toConsole('playPause', 'play paused to insert task')
  const taskName = window.prompt('Please name the new Task')
  if (!taskName) {
    window.alert('Task name cannot be empty.')
    return
  }
  toConsole('taskName', taskName)
  let taskStatus = window.prompt('VA, NVA, W? (or 1=VA, 2=NVA, 3=W)')
  if (!taskStatus) {
    window.alert('Task status cannot be empty.')
    return
  }
  toConsole('taskStatus input', taskStatus)

  taskStatus = taskStatus.toUpperCase()
  if (taskStatus === '1') taskStatus = 'VA'
  if (taskStatus === '2') taskStatus = 'NVA'
  if (taskStatus === '3') taskStatus = 'W'

  if (!['VA', 'NVA', 'W'].includes(taskStatus)) {
    window.alert(
      'Invalid task status. Please enter VA, NVA, W, 1 (VA), 2 (NVA), or 3 (W).'
    )
    return
  }
  toConsole('taskStatus processed', taskStatus)

  const currentTask = yama[opIndex][taskIndex]
  const originalDuration = currentTask.taskHeight

  if (originalDuration <= 0) {
    window.alert('Cannot split a task with zero or negative duration.')
    return
  }

  const newDuration = Math.floor(originalDuration / 2)
  const remainingDuration = originalDuration - newDuration

  currentTask.taskHeight = remainingDuration
  currentTask.taskEnd = currentTask.taskStart + remainingDuration

  const newTask = {
    taskName,
    taskStart: currentTask.taskEnd,
    taskEnd: currentTask.taskEnd + newDuration,
    taskHeight: newDuration,
    taskStatus,
  }

  yama[opIndex].splice(taskIndex + 1, 0, newTask)

  for (let i = taskIndex + 2; i < yama[opIndex].length; i++) {
    yama[opIndex][i].taskStart = yama[opIndex][i - 1].taskEnd
    yama[opIndex][i].taskEnd =
      yama[opIndex][i].taskStart + yama[opIndex][i].taskHeight
  }

  taskCount = yama[opIndex].length
  updateTaskList()
}

const editTask = (opIndex, taskIndex) => {
  const task = yama[opIndex][taskIndex]
  const newTaskName = window.prompt('Edit Task Name', task.taskName)
  if (!newTaskName) {
    window.alert('Task name cannot be empty.')
    return
  }
  const newTaskStatus = window.prompt(
    'Edit Task Status (VA, NVA, W)',
    task.taskStatus
  )
  if (!newTaskStatus) {
    window.alert('Task status cannot be empty.')
    return
  }
  yama[opIndex][taskIndex].taskName = newTaskName
  yama[opIndex][taskIndex].taskStatus = newTaskStatus
  updateTaskList()
}

const editTaskDuration = (opIndex, taskIndex) => {
  const task = yama[opIndex][taskIndex]
  const formattedDuration = formatDuration(task.taskHeight)
  const promptMessage =
    'Enter new duration (MM:SS:MS, e.g., 01:30:50 for 1m 30s 50ms)'
  const newDurationInput = window.prompt(promptMessage, formattedDuration)
  if (newDurationInput === null) {
    return
  }
  const newDurationMs = parseDuration(newDurationInput)
  if (newDurationMs === null) {
    window.alert(
      'Invalid duration. Ensure minutes, seconds (<60), and milliseconds (<100) are valid.'
    )
    return
  }

  yama[opIndex][taskIndex].taskHeight = newDurationMs
  yama[opIndex][taskIndex].taskEnd =
    yama[opIndex][taskIndex].taskStart + newDurationMs
  for (let i = taskIndex + 1; i < yama[opIndex].length; i++) {
    yama[opIndex][i].taskStart = yama[opIndex][i - 1].taskEnd
    yama[opIndex][i].taskEnd =
      yama[opIndex][i].taskStart + yama[opIndex][i].taskHeight
  }
  updateTaskList()
}

const parseDuration = (input) => {
  const parts = input.split(':')
  if (parts.length !== 3) return null
  const minutes = Number.parseInt(parts[0], 10)
  const seconds = Number.parseInt(parts[1], 10)
  const milliseconds = Number.parseInt(parts[2], 10) * 10
  if (
    Number.isNaN(minutes) ||
    Number.isNaN(seconds) ||
    Number.isNaN(milliseconds) ||
    seconds >= 60 ||
    milliseconds >= 1000
  ) {
    return null
  }
  return minutes * 60 * 1000 + seconds * 1000 + milliseconds
}

const deleteTask = (opIndex, taskIndex) => {
  const shouldDelete = window.confirm(
    'Are you sure you want to delete this task?'
  )
  if (!shouldDelete) return
  yama[opIndex].splice(taskIndex, 1)
  for (let i = taskIndex; i < yama[opIndex].length; i++) {
    yama[opIndex][i].taskStart = i === 0 ? 0 : yama[opIndex][i - 1].taskEnd
    yama[opIndex][i].taskEnd =
      yama[opIndex][i].taskStart + yama[opIndex][i].taskHeight
  }
  if (yama[opIndex].length === 0 && opIndex === opCount) {
    yama.splice(opIndex, 1)
    opNames.splice(opIndex, 1)
    opStartTimes.splice(opIndex, 1)
    opCount -= 1
    if (opCount < 0) {
      opCount = 0
      firstOp = 'y'
    }
  }
  taskCount = yama[opIndex] ? yama[opIndex].length : 0
  updateTaskList()
}

const deleteOperation = (opIndex) => {
  const shouldDelete = window.confirm(
    `Are you sure you want to delete the operation "${opNames[opIndex]}" and all its tasks? This action cannot be undone.`
  )
  if (!shouldDelete) return
  yama.splice(opIndex, 1)
  opNames.splice(opIndex, 1)
  opStartTimes.splice(opIndex, 1)
  opCount -= 1
  if (opCount < 0) {
    opCount = 0
    firstOp = 'y'
  }
  taskCount = yama[opCount] ? yama[opCount].length : 0
  toConsole(
    `Deleted operation at index ${opIndex}`,
    `opCount: ${opCount}, taskCount: ${taskCount}`
  )
  updateTaskList()
}

export {
  addOp,
  addTask,
  insertTask,
  editTask,
  editTaskDuration,
  deleteTask,
  deleteOperation,
  updateTaskList,
}

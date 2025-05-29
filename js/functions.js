import {
  initializePlayer,
  seektimeupdate,
  updateTimeDisplay,
  positionControls,
  updateLoadButtonColor,
  toggleVideoPlaceholder,
  startMarquee,
  drawMarquee,
  endMarquee,
  updateZoom,
  showEditControls,
  hideEditControls,
  processVideo,
  setupTimeline,
  updateTimeline,
} from './videoEditing.js'
import { addOp, addTask, updateTaskList } from './taskManagement.js'
import { importFromCSV, exportToCSV, drawTable } from './charting.js'

// State variables
const debuggin = 1
const opCount = 0
const taskCount = 0
const yama = []
const opNames = []
const opStartTimes = []
const taktTime = null
const useFormattedDuration = true
const playerReady = false
const zoomLevel = 1
const translateX = 0
const translateY = 0
const processEndTime = 0
const APP_VERSION = '0.3.0-beta'

// Logging utility
const toConsole = (message, detail) => {
  if (debuggin) {
    console.log(`[TimeStudy] ${message}`, detail)
  }
}

// Initialize application
window.onload = () => {
  const placeholder = document.getElementById('videoPlaceholder')
  const videoWrapper = document.getElementById('videoWrapper')
  if (placeholder && videoWrapper) {
    placeholder.style.display = 'flex'
    videoWrapper.style.display = 'none'
    toConsole('Forced placeholder visibility on load', 'Initial state')
  } else {
    toConsole('Placeholder or videoWrapper not found on load', 'DOM issue')
  }

  initializePlayer({
    debuggin,
    opCount,
    taskCount,
    yama,
    opNames,
    opStartTimes,
    taktTime,
    useFormattedDuration,
    playerReady,
    zoomLevel,
    translateX,
    translateY,
    processEndTime,
    APP_VERSION,
    seektimeupdate,
    updateTimeDisplay,
    positionControls,
    updateLoadButtonColor,
    toggleVideoPlaceholder,
    startMarquee,
    drawMarquee,
    endMarquee,
    updateZoom,
    addOp,
    addTask,
    importFromCSV,
    exportToCSV,
    drawTable,
    toConsole,
    showEditControls,
    hideEditControls,
    processVideo,
    setupTimeline,
    updateTimeline,
    updateTaskList,
  })
  toConsole('Initial toggleVideoPlaceholder call', 'Showing placeholder')
  toggleVideoPlaceholder(true)
}

const parseTaktTime = (input) => {
  const parts = input.split(':')
  if (parts.length !== 4) return null
  const hours = parseInt(parts[0], 10)
  const minutes = parseInt(parts[1], 10)
  const seconds = parseInt(parts[2], 10)
  const milliseconds = parseInt(parts[3], 10) * 10
  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    Number.isNaN(seconds) ||
    Number.isNaN(milliseconds) ||
    minutes >= 60 ||
    seconds >= 60 ||
    milliseconds >= 1000
  ) {
    return null
  }
  return (
    hours * 3600 * 1000 + minutes * 60 * 1000 + seconds * 1000 + milliseconds
  )
}

const formatTaktTime = (ms) => {
  if (!ms || ms <= 0) return '00:00:00:00'
  const hours = Math.floor(ms / (3600 * 1000))
  const minutes = Math.floor((ms % (3600 * 1000)) / (60 * 1000))
  const seconds = Math.floor((ms % (60 * 1000)) / 1000)
  const milliseconds = Math.floor((ms % 1000) / 10)
  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${milliseconds
    .toString()
    .padStart(2, '0')}`
}

const formatTimeToHHMMSSMS = (seconds) => {
  if (!seconds || seconds < 0) return '00:00:00:00'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  const milliseconds = Math.floor(((seconds % 1) * 1000) / 10)
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs
    .toString()
    .padStart(2, '0')}:${milliseconds.toString().padStart(2, '0')}`
}

const parseTimeFromHHMMSSMS = (input) => {
  const parts = input.split(':')
  if (parts.length !== 4) return null
  const hours = parseInt(parts[0], 10)
  const minutes = parseInt(parts[1], 10)
  const seconds = parseInt(parts[2], 10)
  const milliseconds = parseInt(parts[3], 10) * 10
  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    Number.isNaN(seconds) ||
    Number.isNaN(milliseconds) ||
    minutes >= 60 ||
    seconds >= 60 ||
    milliseconds >= 1000
  ) {
    return null
  }
  return hours * 3600 + minutes * 60 + seconds + milliseconds / 1000
}

const formatDuration = (ms) => {
  if (!ms || ms <= 0) return '00:00:00'
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  const milliseconds = Math.floor((ms % 1000) / 10)
  return `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}:${milliseconds.toString().padStart(2, '0')}`
}

export {
  debuggin,
  opCount,
  taskCount,
  yama,
  opNames,
  opStartTimes,
  taktTime,
  useFormattedDuration,
  playerReady,
  zoomLevel,
  translateX,
  translateY,
  processEndTime,
  APP_VERSION,
  parseTaktTime,
  formatTaktTime,
  formatTimeToHHMMSSMS,
  parseTimeFromHHMMSSMS,
  formatDuration,
  toConsole,
}

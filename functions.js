/* eslint-disable no-unused-vars */
function toConsole(message, value, debug) {
  if (debug) {
    console.log(`${message}:`, value);
  }
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function formatTimeToHHMMSSMS(seconds) {
  if (isNaN(seconds) || seconds < 0) return "00:00:00:00";
  const hours = Math.floor(seconds / 3600);
  seconds %= 3600;
  const minutes = Math.floor(seconds / 60);
  seconds = seconds % 60;
  const milliseconds = Math.floor((seconds % 1) * 100);
  seconds = Math.floor(seconds);
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}:${milliseconds.toString().padStart(2, "0")}`;
}

function parseTimeFromHHMMSSMS(timeStr) {
  if (!timeStr) return null;
  const parts = timeStr.split(":");
  if (parts.length !== 4) return null;
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  const seconds = parseInt(parts[2], 10);
  const milliseconds = parseInt(parts[3], 10);
  if (isNaN(hours) || isNaN(minutes) || isNaN(seconds) || isNaN(milliseconds)) return null;
  if (minutes >= 60 || seconds >= 60 || milliseconds >= 100) return null;
  return hours * 3600 + minutes * 60 + seconds + milliseconds / 100;
}

function formatTaktTime(taktTime) {
  if (isNaN(taktTime) || taktTime < 0) return "00:00:00:00";
  const hours = Math.floor(taktTime / 3600);
  taktTime %= 3600;
  const minutes = Math.floor(taktTime / 60);
  taktTime = taktTime % 60;
  const milliseconds = Math.floor((taktTime % 1) * 100);
  const seconds = Math.floor(taktTime);
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}:${milliseconds.toString().padStart(2, "0")}`;
}

function parseTaktTime(taktTimeStr) {
  if (!taktTimeStr) return null;
  const parts = taktTimeStr.split(":");
  if (parts.length !== 4) return null;
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  const seconds = parseInt(parts[2], 10);
  const milliseconds = parseInt(parts[3], 10);
  if (isNaN(hours) || isNaN(minutes) || isNaN(seconds) || isNaN(milliseconds)) return null;
  if (minutes >= 60 || seconds >= 60 || milliseconds >= 100) return null;
  return hours * 3600 + minutes * 60 + seconds + milliseconds / 100;
}

function formatDuration(milliseconds) {
  if (isNaN(milliseconds) || milliseconds < 0) return "00:00:00";
  const totalSeconds = milliseconds / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const ms = Math.floor((milliseconds % 1000) / 10);
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}:${ms.toString().padStart(2, "0")}`;
}

function formatDecimalMinutes(milliseconds) {
  if (isNaN(milliseconds) || milliseconds < 0) return "0.00";
  const minutes = milliseconds / (1000 * 60);
  return minutes.toFixed(2);
}

/* eslint-enable no-unused-vars */

// Initialize TimeStudy namespace
window.TimeStudy = {
  // Shared state
  player: null,
  yama: [],
  opNames: [],
  opStartTimes: [],
  opCount: 0,
  taskCount: 0,
  firstOp: "y",
  taktTime: null,
  addTaskButton: null,
  addChartButton: null,
  toggleFormatButton: null,
  DOM: null, // Initialized in video.js
  debuggin: 1,
  playerReady: false,
  processEndTime: 0,
  zoomLevel: 1,
  // Shared functions from functions.js
  toConsole: toConsole,
  debounce: debounce,
  formatTimeToHHMMSSMS: formatTimeToHHMMSSMS,
  parseTimeFromHHMMSSMS: parseTimeFromHHMMSSMS,
  formatTaktTime: formatTaktTime,
  parseTaktTime: parseTaktTime,
  formatDuration: formatDuration,
  formatDecimalMinutes: formatDecimalMinutes,
  // Placeholders for app.js and video.js
  initVideo: null,
  updateZoom: null,
  updateTaskList: null,
  exportToCSV: null,
};
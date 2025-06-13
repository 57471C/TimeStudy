const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const toConsole = (message, value, debuggin = 1) => {
  if (debuggin === 1) {
    console.log(`${message}:`, value);
  }
};

const parseTaktTime = input => {
  const parts = input.split(":");
  if (parts.length !== 4) return null;
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  const seconds = parseInt(parts[2], 10);
  const milliseconds = parseInt(parts[3], 10) * 10;
  if (
    isNaN(hours) ||
    isNaN(minutes) ||
    isNaN(seconds) ||
    isNaN(milliseconds) ||
    minutes >= 60 ||
    seconds >= 60 ||
    milliseconds >= 1000
  ) {
    return null;
  }
  return hours * 3600 * 1000 + minutes * 60 * 1000 + seconds * 1000 + milliseconds;
};

const formatTaktTime = ms => {
  if (!ms || ms <= 0) return "00:00:00:00";
  const hours = Math.floor(ms / (3600 * 1000));
  const minutes = Math.floor((ms % (3600 * 1000)) / (60 * 1000));
  const seconds = Math.floor((ms % (60 * 1000)) / 1000);
  const milliseconds = Math.floor((ms % 1000) / 10);
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}:${milliseconds.toString().padStart(2, "0")}`;
};

const formatTimeToHHMMSSMS = seconds => {
  if (!seconds || seconds < 0) return "00:00:00:00";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const milliseconds = Math.floor(((seconds % 1) * 1000) / 10);
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}:${milliseconds.toString().padStart(2, "0")}`;
};

const parseTimeFromHHMMSSMS = input => {
  const parts = input.split(":");
  if (parts.length !== 4) return null;
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  const seconds = parseInt(parts[2], 10);
  const milliseconds = parseInt(parts[3], 10) * 10;
  if (
    isNaN(hours) ||
    isNaN(minutes) ||
    isNaN(seconds) ||
    isNaN(milliseconds) ||
    minutes >= 60 ||
    seconds >= 60 ||
    milliseconds >= 1000
  ) {
    return null;
  }
  return hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;
};

const formatDuration = ms => {
  if (!ms || ms <= 0) return "00:00:00";
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const milliseconds = Math.floor((ms % 1000) / 10);
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}:${milliseconds.toString().padStart(2, "0")}`;
};

const formatDecimalMinutes = ms => {
  if (!ms || ms <= 0) return "0.00";
  const minutes = ms / (60 * 1000);
  return minutes.toFixed(2);
};

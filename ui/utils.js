const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const escapeHTML = (str) => {
  if (typeof str !== "string") return str;
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const sanitizeFilename = (name) => {
  if (typeof name !== "string") return "";
  // biome-ignore lint/suspicious/noControlCharactersInRegex: Needed for robust filename sanitization
  return name.replace(/[<>:"/\\|?*\x00-\x1F]/g, "_").trim();
};

const toConsole = (message, value, debuggin = 1) => {
  if (debuggin === 1) {
    console.log(`${message}:`, value);
  }
};

const parseTimeStr = (input) => {
  const parts = input.replace(".", ":").split(":");
  if (parts.length < 3 || parts.length > 4) {
    return null;
  }

  let hours = 0,
    minutes,
    seconds,
    milliseconds;
  if (parts.length === 4) {
    hours = Number.parseInt(parts[0], 10);
    minutes = Number.parseInt(parts[1], 10);
    seconds = Number.parseInt(parts[2], 10);
    milliseconds = Number.parseInt(parts[3], 10) * 10;
  } else {
    minutes = Number.parseInt(parts[0], 10);
    seconds = Number.parseInt(parts[1], 10);
    milliseconds = Number.parseInt(parts[2], 10) * 10;
  }

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    Number.isNaN(seconds) ||
    Number.isNaN(milliseconds) ||
    minutes >= 60 ||
    seconds >= 60 ||
    milliseconds >= 1000
  ) {
    return null;
  }
  return hours * 3600000 + minutes * 60000 + seconds * 1000 + milliseconds;
};

const parseTaktTime = parseTimeStr;

const parseTimeFromHHMMSSMS = (input) => {
  const ms = parseTimeStr(input);
  return ms !== null ? ms / 1000 : null;
};

const formatDuration = (ms) => {
  if (ms === undefined || ms === null || Number.isNaN(ms)) return "00:00:00.00";
  const isNeg = ms < 0;
  const absMs = Math.abs(ms);
  const hours = Math.floor(absMs / 3600000);
  const minutes = Math.floor((absMs % 3600000) / 60000);
  const seconds = Math.floor((absMs % 60000) / 1000);
  const milliseconds = Math.floor((absMs % 1000) / 10);
  const sign = isNeg ? "-" : "";
  return `${sign}${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${milliseconds.toString().padStart(2, "0")}`;
};

const formatTaktTime = formatDuration;

const formatTimeToHHMMSSMS = (seconds) => formatDuration(seconds ? seconds * 1000 : 0);

const formatDecimalMinutes = (ms) => {
  if (ms === undefined || ms === null || Number.isNaN(ms)) return "0.00";
  const minutes = ms / (60 * 1000);
  return minutes.toFixed(2);
};

const formatDurationValue = (val) => {
  if (durationMode === "hhmmssms") return formatDuration(val);
  if (durationMode === "ms") return `${val.toFixed(0)} ms`;
  return `${formatDecimalMinutes(val)} min`;
};

const parseTwoColumnCSV = (csvText) => {
  const lines = csvText.split(/\r?\n/).filter((line) => line.trim() !== "");
  const results = [];
  for (const line of lines) {
    const firstComma = line.indexOf(",");
    if (firstComma > -1) {
      const col1 = line.substring(0, firstComma).replace(/^"|"$/g, "").trim();
      const col2 = line
        .substring(firstComma + 1)
        .replace(/^"|"$/g, "")
        .trim();
      results.push(`${col1} - ${col2}`);
    } else {
      results.push(line.replace(/^"|"$/g, "").trim());
    }
  }
  return results;
};

const buildVTTContent = (projectData, videoId) => {
  let vttBlocks = [];
  let vttIndex = 1;

  if (!projectData || !projectData.trials) return "";

  // Find the trial matching the videoId (filename or full path)
  const trial = projectData.trials.find((t) => t.videoFileName === videoId || t.videoFilePath === videoId);
  if (!trial || !trial.appState || !trial.appState.operations) return "";

  const formatVTTTime = (seconds) => {
    if (seconds < 0) seconds = 0;
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.round((seconds % 1) * 1000);

    const pad = (num, size) => String(num).padStart(size, "0");
    return `${pad(hrs, 2)}:${pad(mins, 2)}:${pad(secs, 2)}.${pad(ms, 3)}`;
  };

  for (const op of trial.appState.operations) {
    const opStart = op.startTime || 0;

    // Operation Start block
    vttBlocks.push({
      time: opStart,
      vttTimeRange: `${formatVTTTime(opStart)} --> ${formatVTTTime(opStart + 2)}`,
      text: `O: <font color="yellow">${op.name}</font> start`,
    });

    // Process tasks under this operation
    let currentTaskStart = opStart;
    for (const task of op.tasks || []) {
      const taskDurationSec = (task.duration || 0) / 1000;

      // Task Start block
      vttBlocks.push({
        time: currentTaskStart,
        vttTimeRange: `${formatVTTTime(currentTaskStart)} --> ${formatVTTTime(currentTaskStart + 2)}`,
        text: `T: <font color="yellow">${task.name}</font> start`,
      });

      currentTaskStart += taskDurationSec;
    }
  }

  // Sort chronologically by time
  vttBlocks.sort((a, b) => a.time - b.time);

  // Map to VTT blocks and join
  return (
    "WEBVTT\n\n" +
    vttBlocks
      .map((block) => {
        const vttLine = `${vttIndex}\n${block.vttTimeRange}\n${block.text}`;
        vttIndex += 1;
        return vttLine;
      })
      .join("\n\n")
  );
};

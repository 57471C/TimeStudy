// DOM elements
let player;
let addTaskButton;
let addOpButton;
let addChartButton;
let loadVideoButton;
let toggleFormatButton;
let csvExportButton;
let csvImportButton;
let speedSlider;
let seekBar;
let playPauseButton;
let rewind5sButton;
let rewind1sButton;
let forward1sButton;
let forward5sButton;
let muteButton;
let volumeSlider;
let taktTimeInput;

// State variables
const debuggin = 1;
let opCount = 0;
let firstOp = "y";
let taskCount = 0;
let yama = [];
let opNames = [];
let opStartTimes = [];
let taktTime = null;
let durationMode = "hhmmssms"; // Options: "hhmmssms", "ms", "decimalMinutes"
let playerReady = false;
let zoomLevel = 1;
let translateX = 0;
let translateY = 0;
let processEndTime = 0; // Store process end time in seconds
const APP_VERSION = "0.2.0-beta";

// Marquee variables
let isDrawing = false;
let startX;
let startY;
let marqueeOverlay;
let marqueeRect;

const initializePlayer = () => {
  player = document.getElementById("my_video");
  playerReady = true;
  toConsole("Video element initialized", "Success");
  toConsole("App Version", APP_VERSION);

  // Marquee elements
  marqueeOverlay = document.getElementById("marqueeOverlay");
  marqueeRect = document.getElementById("marqueeRect");

  // Event listeners for video
  player.addEventListener("timeupdate", seektimeupdate);
  player.addEventListener("loadedmetadata", () => {
    const duration = player.duration;
    seekBar.max = duration;
    processEndTime = duration; // Set initial process end time to video duration
    updateTimeDisplay(duration, "durationTime");
    positionControls();
    updateLoadButtonColor();
    toggleVideoPlaceholder(false);
    updateProcessTimes(); // Update footer when video loads
    // Reset playback speed to 1x after loading
    player.playbackRate = 1;
    speedSlider.value = 1;
    document.getElementById("speedValue").textContent = "1x";
    toConsole("Playback speed reset to 1x after load", "Success");
    // Initialize volume slider
    volumeSlider.value = player.volume;
  });
  player.addEventListener("play", () => {
    playPauseButton.textContent = "Pause";
  });
  player.addEventListener("pause", () => {
    playPauseButton.textContent = "Play";
  });
  player.addEventListener("error", () => {
    toConsole("Video load error", "Failed to load video from URL");
    alert(
      "Failed to load the video from the provided URL. Please use the 'Load Video' button to select a video file manually."
    );
    toggleVideoPlaceholder(true);
    updateLoadButtonColor();
  });

  // DOM elements for buttons and controls
  addTaskButton = document.getElementById("addTaskButton");
  addOpButton = document.getElementById("addOpButton");
  addChartButton = document.getElementById("addChartButton");
  csvExportButton = document.getElementById("csvExportButton");
  csvImportButton = document.getElementById("csvImportButton");
  loadVideoButton = document.getElementById("loadVideoButton");
  toggleFormatButton = document.getElementById("toggleFormatButton");
  speedSlider = document.getElementById("speedSlider");
  seekBar = document.getElementById("seekBar");
  playPauseButton = document.getElementById("playPauseButton");
  rewind5sButton = document.getElementById("rewind5sButton");
  rewind1sButton = document.getElementById("rewind1sButton");
  forward1sButton = document.getElementById("forward1sButton");
  forward5sButton = document.getElementById("forward5sButton");
  muteButton = document.getElementById("muteButton");
  volumeSlider = document.getElementById("volumeSlider");
  taktTimeInput = document.getElementById("taktTimeInput");

  // Parse initial Takt Time
  taktTime = parseTaktTime(taktTimeInput.value);

  // Takt Time input event listener
  taktTimeInput.addEventListener("input", () => {
    const newTaktTime = parseTaktTime(taktTimeInput.value);
    if (newTaktTime !== null) {
      taktTime = newTaktTime;
      toConsole("Takt Time updated", taktTime);
    } else {
      alert("Invalid Takt Time format. Please use HH:MM:SS:MS (e.g., 00:01:00:00).");
      taktTimeInput.value = formatTaktTime(taktTime);
    }
  });

  // Enable Add Task button when an operation is added
  addOpButton.addEventListener("click", () => {
    addTaskButton.disabled = false;
  });

  // Check for video URL in GET parameters
  const urlParams = new URLSearchParams(window.location.search);
  const videoUrl = urlParams.get("v");
  if (videoUrl) {
    toConsole("Found video URL in GET parameter", videoUrl);
    player.src = videoUrl;
    player.load();
  }

  // Button event listeners
  addTaskButton.addEventListener("click", addTask, false);
  addOpButton.addEventListener("click", addOp, false);
  addChartButton.addEventListener("click", drawTable, false);
  csvExportButton.addEventListener("click", exportToCSV, false);
  csvImportButton.addEventListener("click", () => {
    document.getElementById("csvFileInput").click();
  });
  loadVideoButton.addEventListener("click", () => {
    document.getElementById("videoFileInput").click();
  });
  toggleFormatButton.addEventListener("click", () => {
    // Cycle through the three modes: hhmmssms -> ms -> decimalMinutes
    if (durationMode === "hhmmssms") {
      durationMode = "ms";
    } else if (durationMode === "ms") {
      durationMode = "decimalMinutes";
    } else {
      durationMode = "hhmmssms";
    }
    toggleFormatButton.textContent = `Format (${
      durationMode === "hhmmssms" ? "MM:SS:MS" : durationMode === "ms" ? "ms" : "min"
    })`;
    updateTaskList();
    drawTable();
  });
  playPauseButton.addEventListener("click", () => {
    if (player.paused) {
      player.play();
    } else {
      player.pause();
    }
  });

  // Nudge button event listeners
  rewind5sButton.addEventListener("click", () => {
    player.currentTime = Math.max(0, player.currentTime - 5);
    toConsole("Rewind 5s", player.currentTime);
  });
  rewind1sButton.addEventListener("click", () => {
    player.currentTime = Math.max(0, player.currentTime - 1);
    toConsole("Rewind 1s", player.currentTime);
  });
  forward1sButton.addEventListener("click", () => {
    player.currentTime = Math.min(player.duration, player.currentTime + 1);
    toConsole("Forward 1s", player.currentTime);
  });
  forward5sButton.addEventListener("click", () => {
    player.currentTime = Math.min(player.duration, player.currentTime + 5);
    toConsole("Forward 5s", player.currentTime);
  });

  // Mute button event listener
  muteButton.addEventListener("click", () => {
    player.muted = !player.muted;
    muteButton.textContent = player.muted ? "Unmute" : "Mute";
    toConsole("Mute toggled", player.muted);
    volumeSlider.value = player.muted ? 0 : player.volume;
  });

  // Volume slider event listener
  volumeSlider.addEventListener("input", () => {
    const volume = parseFloat(volumeSlider.value);
    player.volume = volume;
    player.muted = volume === 0;
    muteButton.textContent = player.muted ? "Unmute" : "Mute";
    toConsole("Volume adjusted", volume);
  });

  if (speedSlider) {
    speedSlider.addEventListener("input", function () {
      toConsole("Speed slider input event fired", this.value);
      const speed = parseFloat(this.value);
      player.playbackRate = speed;
      document.getElementById("speedValue").textContent = `${speed}x`;
      toConsole("Speed value label updated", `${speed}x`);
    });

    player.playbackRate = 1;
    toConsole("Initial playback rate set", 1);
    document.getElementById("speedValue").textContent = "1x";
  }

  if (seekBar) {
    seekBar.addEventListener("input", function () {
      toConsole("Seek bar input event fired", this.value);
      const time = parseFloat(this.value);
      player.currentTime = time;
      toConsole("Video seeked to", time);
    });
  }

  document.getElementById("videoFileInput").addEventListener("change", event => {
    const file = event.target.files[0];
    if (!file) {
      toConsole("No video file selected");
      return;
    }

    // Check if a video is already loaded and there is data
    if (player.src && yama.length > 0) {
      const save = confirm(
        "You have unsaved data. Would you like to save your current data as a CSV file before loading a new video?"
      );
      if (save) {
        exportToCSV();
        toConsole("Data exported to CSV before loading new video");
      }
      const proceed = confirm(
        "Loading a new video will clear all existing data and charts. Are you sure you want to proceed?"
      );
      if (!proceed) {
        toConsole("User cancelled loading new video");
        return;
      }
    }

    // Proceed to load the new video
    const fileURL = URL.createObjectURL(file);
    player.src = fileURL;
    player.load();

    // Clear all previous data and charts
    yama = [];
    opNames = [];
    opStartTimes = [];
    opCount = 0;
    taskCount = 0;
    firstOp = "y";
    taktTime = parseTaktTime(taktTimeInput.value);
    document.getElementById("chartBody").innerHTML = "";
    document.getElementById("taskList").innerHTML = "";
    document.getElementById("pieChartContainer").innerHTML = "";
    document.getElementById("chartContainer").innerHTML = "";
    document.getElementById("chartFoot").innerHTML = "";
    document.querySelector(".highchart").style.display = "none";
    addTaskButton.disabled = true; // Disable Add Task button after clearing data
    toConsole("Cleared all previous data and charts");

    // Reset playback speed to 1x after loading
    player.playbackRate = 1;
    speedSlider.value = 1;
    document.getElementById("speedValue").textContent = "1x";
    toConsole("Playback speed reset to 1x after manual load", "Success");

    updateLoadButtonColor();
  });

  document.getElementById("csvFileInput").addEventListener("change", event => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        importFromCSV(e.target.result);
      };
      reader.readAsText(file);
    }
  });

  document.getElementById("zoomIn").addEventListener("click", () => {
    zoomLevel += 0.1;
    updateZoom();
  });
  document.getElementById("zoomOut").addEventListener("click", () => {
    zoomLevel = Math.max(0.1, zoomLevel - 0.1);
    updateZoom();
  });
  document.getElementById("resetZoom").addEventListener("click", () => {
    zoomLevel = 1;
    translateX = 0;
    translateY = 0;
    updateZoom();
  });

  // Marquee event listeners
  marqueeOverlay.addEventListener("mousedown", startMarquee);
  marqueeOverlay.addEventListener("mousemove", drawMarquee);
  marqueeOverlay.addEventListener("mouseup", endMarquee);

  // Keyboard shortcuts
  document.addEventListener("keydown", e => {
    switch (e.key) {
      case " ":
        e.preventDefault();
        if (player.paused) {
          player.play();
        } else {
          player.pause();
        }
        break;
      case "ArrowLeft":
        e.preventDefault();
        player.currentTime = Math.max(0, player.currentTime - 1);
        toConsole("Rewind 1s (Left Arrow)", player.currentTime);
        break;
      case "ArrowDown":
        e.preventDefault();
        player.currentTime = Math.max(0, player.currentTime - 5);
        toConsole("Rewind 5s (Down Arrow)", player.currentTime);
        break;
      case "ArrowRight":
        e.preventDefault();
        player.currentTime = Math.min(player.duration, player.currentTime + 1);
        toConsole("Forward 1s (Right Arrow)", player.currentTime);
        break;
      case "ArrowUp":
        e.preventDefault();
        player.currentTime = Math.min(player.duration, player.currentTime + 5);
        toConsole("Forward 5s (Up Arrow)", player.currentTime);
        break;
      case "t":
        e.preventDefault();
        if (!addTaskButton.disabled) addTask();
        break;
      case "o":
        e.preventDefault();
        addOp();
        break;
      case "m":
        e.preventDefault();
        player.muted = !player.muted;
        muteButton.textContent = player.muted ? "Unmute" : "Mute";
        toConsole("Mute toggled (M key)", player.muted);
        volumeSlider.value = player.muted ? 0 : player.volume;
        break;
      case "=":
        e.preventDefault();
        zoomLevel += 0.1;
        updateZoom();
        break;
      case "-":
        e.preventDefault();
        zoomLevel = Math.max(0.1, zoomLevel - 0.1);
        updateZoom();
        break;
      case "Backspace":
        e.preventDefault();
        zoomLevel = 1;
        translateX = 0;
        translateY = 0;
        updateZoom();
        break;
    }
  });

  toConsole("jQuery version", $.fn.jquery);
  toConsole("Highcharts version", Highcharts.version);
  updateLoadButtonColor();
};

window.onload = () => {
  initializePlayer();
  toggleVideoPlaceholder(true);
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

const startMarquee = e => {
  if (e.target.closest(".zoom-controls")) return;
  isDrawing = true;
  const rect = marqueeOverlay.getBoundingClientRect();
  startX = e.clientX - rect.left;
  startY = e.clientY - rect.top;
  marqueeRect.style.left = `${startX}px`;
  marqueeRect.style.top = `${startY}px`;
  marqueeRect.style.width = "0px";
  marqueeRect.style.height = "0px";
  marqueeRect.style.display = "block";
  toConsole("Marquee start", `(${startX}, ${startY})`);
};

const drawMarquee = e => {
  if (!isDrawing) return;
  const rect = marqueeOverlay.getBoundingClientRect();
  const currentX = e.clientX - rect.left;
  const currentY = e.clientY - rect.top;

  const width = currentX - startX;
  const height = currentY - startY;

  if (width < 0) {
    marqueeRect.style.left = `${currentX}px`;
    marqueeRect.style.width = `${-width}px`;
  } else {
    marqueeRect.style.left = `${startX}px`;
    marqueeRect.style.width = `${width}px`;
  }

  if (height < 0) {
    marqueeRect.style.top = `${currentY}px`;
    marqueeRect.style.height = `${-height}px`;
  } else {
    marqueeRect.style.top = `${startY}px`;
    marqueeRect.style.height = `${height}px`;
  }
};

const endMarquee = e => {
  if (!isDrawing) return;
  isDrawing = false;
  marqueeRect.style.display = "none";

  const rect = marqueeOverlay.getBoundingClientRect();
  const endX = e.clientX - rect.left;
  const endY = e.clientY - rect.top;

  const x1 = Math.min(startX, endX);
  const x2 = Math.max(startX, endX);
  const y1 = Math.min(startY, endY);
  const y2 = Math.max(startY, endY);

  const marqueeWidth = x2 - x1;
  const marqueeHeight = y2 - y1;

  toConsole("Marquee end", `Box: (${x1}, ${y1}) to (${x2}, ${y2})`);

  if (marqueeWidth < 10 || marqueeHeight < 10) {
    toConsole("Marquee too small, ignoring zoom");
    return;
  }

  const videoWrapper = document.getElementById("videoWrapper");
  const wrapperWidth = videoWrapper.clientWidth;
  const wrapperHeight = videoWrapper.clientHeight;

  // Get video dimensions and account for object-fit: contain
  const video = document.getElementById("my_video");
  const videoRect = video.getBoundingClientRect();
  const wrapperRect = videoWrapper.getBoundingClientRect();
  const offsetX = videoRect.left - wrapperRect.left;
  const offsetY = videoRect.top - wrapperRect.top;
  const videoDisplayWidth = videoRect.width;
  const videoDisplayHeight = videoRect.height;
  toConsole(
    "Video display",
    `Width: ${videoDisplayWidth}, Height: ${videoDisplayHeight}, Offset: (${offsetX}, ${offsetY})`
  );

  // Adjust marquee coordinates to video display coordinates (remove offsets)
  const marqueeX1 = x1 - offsetX;
  const marqueeY1 = y1 - offsetY;
  const marqueeX2 = x2 - offsetX;
  const marqueeY2 = y2 - offsetY;

  // Calculate the center of the marquee in video display coordinates
  const marqueeCenterX = (marqueeX1 + marqueeX2) / 2;
  const marqueeCenterY = (marqueeY1 + marqueeY2) / 2;
  toConsole("Marquee center (display)", `(${marqueeCenterX}, ${marqueeCenterY})`);

  // Calculate new zoom level based on the marquee size
  const zoomX = videoDisplayWidth / marqueeWidth;
  const zoomY = videoDisplayHeight / marqueeHeight;
  const newZoomLevel = Math.min(zoomX, zoomY);
  toConsole("New zoom level (relative)", newZoomLevel);

  // Compute the cumulative zoom level
  const previousZoomLevel = zoomLevel;
  zoomLevel *= newZoomLevel;
  toConsole("Cumulative zoom level", zoomLevel);

  // Convert the marquee center to the video's coordinate system, accounting for previous zoom and translation
  const videoCoordX = (marqueeCenterX - translateX * previousZoomLevel) / previousZoomLevel;
  const videoCoordY = (marqueeCenterY - translateY * previousZoomLevel) / previousZoomLevel;
  toConsole("Marquee center (video coords)", `(${videoCoordX}, ${videoCoordY})`);

  // Scale the video coordinates by the new cumulative zoom level
  const scaledVideoCoordX = videoCoordX * zoomLevel;
  const scaledVideoCoordY = videoCoordY * zoomLevel;
  toConsole("Scaled video coordinates", `(${scaledVideoCoordX}, ${scaledVideoCoordY})`);

  // Calculate new translation to center the scaled point in the wrapper
  translateX = (wrapperWidth / 2 - scaledVideoCoordX) / zoomLevel;
  translateY = (wrapperHeight / 2 - scaledVideoCoordY) / zoomLevel;
  toConsole("New translation", `(${translateX}, ${translateY})`);

  // Log final position for debugging
  const finalX = videoCoordX * zoomLevel + translateX * zoomLevel;
  const finalY = videoCoordY * zoomLevel + translateY * zoomLevel;
  toConsole("Final center position", `(${finalX}, ${finalY})`);

  updateZoom();
};

const updateZoom = () => {
  const video = document.getElementById("my_video");
  video.style.transform = `scale(${zoomLevel}) translate(${translateX}px, ${translateY}px)`;
  toConsole("Zoom updated", `Level: ${zoomLevel}, Translate: (${translateX}, ${translateY})`);
};

const seektimeupdate = () => {
  if (player && playerReady) {
    const currentTime = player.currentTime;
    const duration = player.duration;
    if (seekBar) {
      seekBar.value = currentTime;
      seekBar.max = duration || 0;
    }
    updateTimeDisplay(currentTime, "currentTime");
    if (duration) {
      updateTimeDisplay(duration, "durationTime");
    }
  }
};

const updateTimeDisplay = (seconds, elementId) => {
  document.getElementById(elementId).textContent = formatTimeToHHMMSSMS(seconds);
};

const positionControls = () => {
  const controlsBar = document.getElementById("video_controls_bar");
  if (controlsBar) {
    controlsBar.style.position = "relative";
    toConsole("Controls repositioned after video load", "Success");
  }
};

const updateLoadButtonColor = () => {
  if (loadVideoButton && player && playPauseButton) {
    const src = player.src;
    if (!src) {
      loadVideoButton.classList.remove("btn-orange");
      loadVideoButton.classList.add("btn-yellow");
      playPauseButton.disabled = true;
      rewind5sButton.disabled = true;
      rewind1sButton.disabled = true;
      forward1sButton.disabled = true;
      forward5sButton.disabled = true;
      muteButton.disabled = true;
      volumeSlider.disabled = true;
    } else {
      loadVideoButton.classList.remove("btn-yellow");
      loadVideoButton.classList.add("btn-orange");
      playPauseButton.disabled = false;
      rewind5sButton.disabled = false;
      rewind1sButton.disabled = false;
      forward1sButton.disabled = false;
      forward5sButton.disabled = false;
      muteButton.disabled = false;
      volumeSlider.disabled = false;
    }
  }
};

const toggleVideoPlaceholder = show => {
  const placeholder = document.getElementById("videoPlaceholder");
  const videoWrapper = document.getElementById("videoWrapper");
  if (placeholder && videoWrapper) {
    if (show) {
      toConsole("Showing placeholder, hiding video wrapper");
      placeholder.style.display = "flex";
      videoWrapper.style.display = "none";
    } else {
      toConsole("Hiding placeholder, showing video wrapper");
      placeholder.style.display = "none";
      videoWrapper.style.display = "block";
    }
  }
};

const addOp = () => {
  player.pause();
  const opName = prompt("Please name the Operation");
  if (!opName) {
    alert("Operation name cannot be empty.");
    return;
  }
  const startTime = player.currentTime;
  toConsole("Operation start time", startTime);
  if (firstOp === "n") {
    opCount += 1;
    toConsole("Creating Operation opCount has increased by 1", opCount);
  } else {
    firstOp = "n";
    toConsole("Creating first operation yama[0]", opCount);
  }
  opNames[opCount] = opName;
  opStartTimes[opCount] = startTime;
  taskCount = 0;
  yama[opCount] = [];
  toConsole("taskCount has been reset", taskCount);
  updateTaskList();
};

const addTask = () => {
  player.pause();
  toConsole("playPause", "play paused to add task");
  if (yama.length === 0) {
    alert("There's no Operation yet! Please add an Operation first.");
    toConsole("Tried to add a Task, but No Operation exists");
    addOp();
    if (yama.length === 0) {
      return;
    }
  }
  const taskName = prompt("Please name the Task");
  if (!taskName) {
    alert("Task name cannot be empty.");
    return;
  }
  toConsole("taskName", taskName);
  const taskEnd = player.currentTime * 1000;
  toConsole("taskEnd", taskEnd);
  const opIndex = opCount;
  const opStartTimeInputId = `opTimeInput-${opIndex}`;
  const opTimeInput = document.getElementById(opStartTimeInputId);
  const opStartTime = parseTimeFromHHMMSSMS(opTimeInput.value) || 0;
  toConsole("opStartTime from input", opStartTime);
  const taskStart = taskCount === 0 ? opStartTime * 1000 : yama[opCount][taskCount - 1].taskEnd;
  toConsole("taskStart", taskStart);
  const taskHeight = taskCount === 0 ? taskEnd - opStartTime * 1000 : taskEnd - taskStart;
  toConsole("taskHeight", taskHeight);
  let taskStatus = prompt("VA, NVA, W? (or 1=VA, 2=NVA, 3=W)");
  if (!taskStatus) {
    alert("Task status cannot be empty.");
    return;
  }
  toConsole("taskStatus input", taskStatus);

  // Convert lowercase to uppercase and handle numeric shortcuts
  taskStatus = taskStatus.toUpperCase();
  if (taskStatus === "1") taskStatus = "VA";
  if (taskStatus === "2") taskStatus = "NVA";
  if (taskStatus === "3") taskStatus = "W";

  // Validate task status
  if (!["VA", "NVA", "W"].includes(taskStatus)) {
    alert("Invalid task status. Please enter VA, NVA, W, 1 (VA), 2 (NVA), or 3 (W).");
    return;
  }
  toConsole("taskStatus processed", taskStatus);
  yama[opCount][taskCount] = {
    taskName,
    taskStart,
    taskEnd,
    taskHeight,
    taskStatus,
  };
  console.table(yama[opCount][taskCount]);
  taskCount += 1;
  updateTaskList();
};

// eslint-disable-next-line no-unused-vars
const insertTask = (opIndex, taskIndex) => {
  player.pause();
  toConsole("playPause", "play paused to insert task");
  const taskName = prompt("Please name the new Task");
  if (!taskName) {
    alert("Task name cannot be empty.");
    return;
  }
  toConsole("taskName", taskName);
  let taskStatus = prompt("VA, NVA, W? (or 1=VA, 2=NVA, 3=W)");
  if (!taskStatus) {
    alert("Task status cannot be empty.");
    return;
  }
  toConsole("taskStatus input", taskStatus);

  // Convert lowercase to uppercase and handle numeric shortcuts
  taskStatus = taskStatus.toUpperCase();
  if (taskStatus === "1") taskStatus = "VA";
  if (taskStatus === "2") taskStatus = "NVA";
  if (taskStatus === "3") taskStatus = "W";

  // Validate task status
  if (!["VA", "NVA", "W"].includes(taskStatus)) {
    alert("Invalid task status. Please enter VA, NVA, W, 1 (VA), 2 (NVA), or 3 (W).");
    return;
  }
  toConsole("taskStatus processed", taskStatus);

  const currentTask = yama[opIndex][taskIndex];
  const originalDuration = currentTask.taskHeight;

  if (originalDuration <= 0) {
    alert("Cannot split a task with zero or negative duration.");
    return;
  }

  // Split the duration evenly
  const newDuration = Math.floor(originalDuration / 2);
  const remainingDuration = originalDuration - newDuration;

  // Update the current task's duration
  currentTask.taskHeight = remainingDuration;
  currentTask.taskEnd = currentTask.taskStart + remainingDuration;

  // Create the new task
  const newTask = {
    taskName,
    taskStart: currentTask.taskEnd,
    taskEnd: currentTask.taskEnd + newDuration,
    taskHeight: newDuration,
    taskStatus,
  };

  // Insert the new task
  yama[opIndex].splice(taskIndex + 1, 0, newTask);

  // Update subsequent task start and end times
  for (let i = taskIndex + 2; i < yama[opIndex].length; i++) {
    yama[opIndex][i].taskStart = yama[opIndex][i - 1].taskEnd;
    yama[opIndex][i].taskEnd = yama[opIndex][i].taskStart + yama[opIndex][i].taskHeight;
  }

  taskCount = yama[opIndex].length;
  updateTaskList();
  drawTable();
};

// eslint-disable-next-line no-unused-vars
const editTask = (opIndex, taskIndex) => {
  const task = yama[opIndex][taskIndex];
  const newTaskName = prompt("Edit Task Name", task.taskName);
  if (!newTaskName) {
    alert("Task name cannot be empty.");
    return;
  }
  const newTaskStatus = prompt("Edit Task Status (VA, NVA, W)", task.taskStatus);
  if (!newTaskStatus) {
    alert("Task status cannot be empty.");
    return;
  }
  yama[opIndex][taskIndex].taskName = newTaskName;
  yama[opIndex][taskIndex].taskStatus = newTaskStatus;
  updateTaskList();
  drawTable();
};

// eslint-disable-next-line no-unused-vars
const editTaskDuration = (opIndex, taskIndex) => {
  const task = yama[opIndex][taskIndex];
  const currentDuration =
    durationMode === "hhmmssms"
      ? formatDuration(task.taskHeight)
      : durationMode === "ms"
        ? `${task.taskHeight.toFixed(3)} ms`
        : `${formatDecimalMinutes(task.taskHeight)} min`;
  const promptMessage =
    durationMode === "hhmmssms"
      ? "Enter new duration (MM:SS:MS, e.g., 01:30:50 for 1m 30s 50ms)"
      : durationMode === "ms"
        ? "Enter new duration (milliseconds, e.g., 90500 for 90.5s)"
        : "Enter new duration (decimal minutes, e.g., 1.51 for 1.51 min)";
  const newDurationInput = prompt(promptMessage, currentDuration);
  if (newDurationInput === null) {
    return;
  }
  let newDurationMs;
  if (durationMode === "hhmmssms") {
    const parts = newDurationInput.split(":");
    if (parts.length !== 3) {
      alert("Invalid format. Please use MM:SS:MS (e.g., 01:30:50).");
      return;
    }
    const minutes = parseInt(parts[0], 10);
    const seconds = parseInt(parts[1], 10);
    const milliseconds = parseInt(parts[2], 10) * 10;
    if (
      isNaN(minutes) ||
      isNaN(seconds) ||
      isNaN(milliseconds) ||
      seconds >= 60 ||
      milliseconds >= 1000
    ) {
      alert("Invalid duration. Ensure minutes, seconds (<60), and milliseconds (<100) are valid.");
      return;
    }
    newDurationMs = minutes * 60 * 1000 + seconds * 1000 + milliseconds;
  } else if (durationMode === "ms") {
    newDurationMs = parseFloat(newDurationInput);
    if (isNaN(newDurationMs) || newDurationMs < 0) {
      alert("Invalid duration. Please enter a non-negative number.");
      return;
    }
  } else {
    // decimalMinutes mode
    const decimalMinutes = parseFloat(newDurationInput);
    if (isNaN(decimalMinutes) || decimalMinutes < 0) {
      alert("Invalid duration. Please enter a non-negative number.");
      return;
    }
    newDurationMs = decimalMinutes * 60 * 1000; // Convert minutes to milliseconds
  }
  yama[opIndex][taskIndex].taskHeight = newDurationMs;
  yama[opIndex][taskIndex].taskEnd = yama[opIndex][taskIndex].taskStart + newDurationMs;
  for (let i = taskIndex + 1; i < yama[opIndex].length; i += 1) {
    yama[opIndex][i].taskStart = yama[opIndex][i - 1].taskEnd;
    yama[opIndex][i].taskEnd = yama[opIndex][i].taskStart + yama[opIndex][i].taskHeight;
  }
  updateTaskList();
  drawTable();
};

// eslint-disable-next-line no-unused-vars
const deleteTask = (opIndex, taskIndex) => {
  if (confirm("Are you sure you want to delete this task?")) {
    yama[opIndex].splice(taskIndex, 1);
    for (let i = taskIndex; i < yama[opIndex].length; i += 1) {
      yama[opIndex][i].taskStart = i === 0 ? 0 : yama[opIndex][i - 1].taskEnd;
      yama[opIndex][i].taskEnd = yama[opIndex][i].taskStart + yama[opIndex][i].taskHeight;
    }
    if (yama[opIndex].length === 0 && opIndex === opCount) {
      yama.splice(opIndex, 1);
      opNames.splice(opIndex, 1);
      opStartTimes.splice(opIndex, 1);
      opCount -= 1;
      if (opCount < 0) {
        opCount = 0;
        firstOp = "y";
        addTaskButton.disabled = true; // Disable Add Task button if no operations remain
      }
    }
    taskCount = yama[opIndex] ? yama[opIndex].length : 0;
    updateTaskList();
    drawTable();
  }
};

// eslint-disable-next-line no-unused-vars
const deleteOperation = opIndex => {
  if (
    confirm(
      `Are you sure you want to delete the operation "${opNames[opIndex]}" and all its tasks? This action cannot be undone.`
    )
  ) {
    // Remove the operation and its tasks
    yama.splice(opIndex, 1);
    opNames.splice(opIndex, 1);
    opStartTimes.splice(opIndex, 1);
    opCount -= 1;
    if (opCount < 0) {
      opCount = 0;
      firstOp = "y";
      addTaskButton.disabled = true; // Disable Add Task button if no operations remain
    }
    // Adjust taskCount if the deleted operation was the last one
    taskCount = yama[opCount] ? yama[opCount].length : 0;
    toConsole(
      `Deleted operation at index ${opIndex}`,
      `opCount: ${opCount}, taskCount: ${taskCount}`
    );
    updateTaskList();
    drawTable();
  }
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
  const minutes = ms / (60 * 1000); // Convert milliseconds to minutes
  // Round to 2 decimal places (e.g., "1.51", "10.00")
  return minutes.toFixed(2);
};

const updateTaskList = () => {
  const taskList = document.getElementById("taskList");
  let html = "";
  for (let i = 0; i < yama.length; i += 1) {
    const opTimeInputId = `opTimeInput-${i}`;
    const formattedTime = formatTimeToHHMMSSMS(opStartTimes[i]);
    html += `
      <h4 class="mt-3">
        <a href="javascript:void(0)" onclick="jumpToOperationTime('${opTimeInputId}')">
          Operation: ${opNames[i]}
        </a>
        <span class="op-time-container">
          <label for="${opTimeInputId}" class="form-label" style="width: auto;">Start:</label>
          <input type="text" id="${opTimeInputId}" class="form-control op-time-input" value="${formattedTime}">
          <button onclick="deleteOperation(${i})" class="btn btn-danger" style="margin-left: 10px;">Delete Operation</button>
        </span>
      </h4>
      <ul class="list-group mb-3">
    `;
    for (let j = 0; j < yama[i].length; j += 1) {
      const task = yama[i][j];
      const duration =
        durationMode === "hhmmssms"
          ? formatDuration(task.taskHeight)
          : durationMode === "ms"
            ? `${task.taskHeight.toFixed(3)} ms`
            : `${formatDecimalMinutes(task.taskHeight)} min`;
      html += `<li class="list-group-item">
        Task: ${task.taskName}, Duration: ${duration}, Status: ${task.taskStatus}
        <button onclick="editTask(${i}, ${j})" class="btn btn-sm btn-outline-primary">Edit</button>
        <button onclick="editTaskDuration(${i}, ${j})" class="btn btn-sm btn-outline-primary">Edit Duration</button>
        <button onclick="deleteTask(${i}, ${j})" class="btn btn-sm btn-outline-danger">Delete</button>
        <button onclick="insertTask(${i}, ${j})" class="btn btn-sm btn-outline-secondary">Split Task</button>
      </li>`;
    }
    html += "</ul>";
  }
  taskList.innerHTML = html;

  // Show the table if there are operations
  const table = document.querySelector(".highchart");
  if (yama.length > 0) {
    table.style.display = "table";
    updateProcessTimes();
  } else {
    table.style.display = "none";
    addTaskButton.disabled = true; // Disable Add Task button if no operations
  }

  // Add event listeners to each operation time input
  for (let i = 0; i < yama.length; i += 1) {
    const opTimeInput = document.getElementById(`opTimeInput-${i}`);
    opTimeInput.addEventListener("input", () => {
      const newTime = parseTimeFromHHMMSSMS(opTimeInput.value);
      if (newTime !== null) {
        opStartTimes[i] = newTime;
        toConsole(`Operation ${i} start time updated`, opStartTimes[i]);
        updateProcessTimes(); // Update total process time when start time changes
      } else {
        alert("Invalid time format. Please use HH:MM:SS:MS (e.g., 00:01:00:00).");
        opTimeInput.value = formatTimeToHHMMSSMS(opStartTimes[i]);
      }
    });
  }
};

const updateProcessTimes = () => {
  if (yama.length === 0) return;

  const chartFoot = document.getElementById("chartFoot");
  const formattedEndTime = formatTimeToHHMMSSMS(processEndTime);
  let totalProcessTime = "00:00:00:00";
  if (opStartTimes.length > 0) {
    const durationSeconds = Math.max(0, processEndTime - opStartTimes[0]);
    totalProcessTime = formatTimeToHHMMSSMS(durationSeconds);
  }

  chartFoot.innerHTML = `
    <tr>
      <td colspan="4" class="table-foot">
        <span class="process-time-container">
          <label for="processEndTimeInput" class="form-label" style="width: auto;">Process end time:</label>
          <input type="text" id="processEndTimeInput" class="form-control process-time-input" value="${formattedEndTime}">
        </span>
        <span class="process-time-container">
          <label for="totalProcessTimeInput" class="form-label" style="width: auto;">Total Process time:</label>
          <input type="text" id="totalProcessTimeInput" class="form-control process-time-input" value="${totalProcessTime}" disabled>
        </span>
      </td>
    </tr>
  `;

  // Add event listener for Process end time input
  const processEndTimeInput = document.getElementById("processEndTimeInput");
  processEndTimeInput.addEventListener("input", () => {
    const newEndTime = parseTimeFromHHMMSSMS(processEndTimeInput.value);
    if (newEndTime !== null) {
      processEndTime = newEndTime;
      toConsole("Process end time updated", processEndTime);
      const durationSeconds =
        opStartTimes.length > 0 ? Math.max(0, processEndTime - opStartTimes[0]) : 0;
      document.getElementById("totalProcessTimeInput").value =
        formatTimeToHHMMSSMS(durationSeconds);
    } else {
      alert("Invalid time format. Please use HH:MM:SS:MS (e.g., 00:01:00:00).");
      processEndTimeInput.value = formatTimeToHHMMSSMS(processEndTime);
    }
  });
};

// eslint-disable-next-line no-unused-vars
const jumpToOperationTime = inputId => {
  const opTimeInput = document.getElementById(inputId);
  const time = parseTimeFromHHMMSSMS(opTimeInput.value);
  if (time !== null) {
    if (player.src) {
      player.currentTime = time;
      toConsole("Jumped to operation time", time);
    } else {
      alert("Please load a video first.");
    }
  } else {
    alert("Invalid time format in the input field.");
  }
};

const importFromCSV = csvText => {
  const lines = csvText
    .split("\n")
    .map(line => line.trim())
    .filter(line => line);
  if (lines.length < 2) {
    alert("CSV file is empty or missing metadata.");
    return;
  }
  const header = lines[0].split(",").map(h => h.trim());
  if (header[0] !== "ProcessEndTime" || !header[1].startsWith("OpStartTime")) {
    alert("Invalid CSV format. Expected header: ProcessEndTime,OpStartTime-0,...");
    return;
  }

  // Parse metadata (Process end time and operation start times)
  const metaDataLine = lines[1].split(",").map(val => val.trim());
  processEndTime = parseTimeFromHHMMSSMS(metaDataLine[0]) || 0;
  toConsole("Imported Process end time", processEndTime);

  const opStartTimeHeaders = header.slice(1);
  opStartTimes = [];
  for (let i = 0; i < opStartTimeHeaders.length; i++) {
    let timeStr = metaDataLine[i + 1];
    // Fix the time format: if it looks like 00:00:MM:SS, reinterpret as 00:MM:SS:00
    const parts = timeStr.split(":");
    if (parts.length === 4) {
      const hours = parseInt(parts[0], 10);
      const minutes = parseInt(parts[1], 10);
      const seconds = parseInt(parts[2], 10);
      const milliseconds = parseInt(parts[3], 10);
      if (hours === 0 && minutes === 0 && seconds >= 60) {
        // Reinterpret as 00:MM:SS:00
        const newMinutes = Math.floor(seconds / 60);
        const newSeconds = seconds % 60;
        timeStr = `00:${newMinutes.toString().padStart(2, "0")}:${newSeconds.toString().padStart(2, "0")}:${milliseconds.toString().padStart(2, "0")}`;
        toConsole(`Fixed OpStartTime-${i}`, `${metaDataLine[i + 1]} -> ${timeStr}`);
      }
    }
    const time = parseTimeFromHHMMSSMS(timeStr);
    if (time !== null) {
      opStartTimes[i] = time;
    } else {
      opStartTimes[i] = 0;
      toConsole("Invalid OpStartTime, defaulting to 0", `OpStartTime-${i}`);
    }
  }
  toConsole("Imported OpStartTimes", opStartTimes);

  // Clear existing data
  yama = [];
  opNames = [];
  opCount = -1;
  taskCount = 0;
  firstOp = "y";
  taktTime = parseTaktTime(taktTimeInput.value);

  // Parse task data starting from line 3
  const taskHeaders = lines[2].split(",").map(h => h.trim());
  const expectedTaskHeaders = ["Operation", "Task", "VA", "NVA", "W"];
  if (
    taskHeaders.length !== expectedTaskHeaders.length ||
    !taskHeaders.every((h, i) => h === expectedTaskHeaders[i])
  ) {
    alert("Invalid CSV format. Expected task headers: Operation,Task,VA,NVA,W");
    return;
  }
  let currentOpName = "";
  let taskIndex = 0;
  let lastEndTime = 0;
  for (let i = 3; i < lines.length; i += 1) {
    const row = lines[i].split(",").map(cell => cell.trim());
    if (row.length < 5) {
      toConsole("Skipping invalid row", `Line ${i + 1}: ${lines[i]}`);
      continue;
    }
    const opName = row[0].replace(/^"|"$/g, "");
    const taskName = row[1].replace(/^"|"$/g, "");
    const va = parseFloat(row[2]);
    const nva = parseFloat(row[3]);
    const w = parseFloat(row[4]);
    const durations = [va, nva, w];
    const nonZeroCount = durations.filter(d => d > 0).length;
    if (nonZeroCount !== 1) {
      alert(`Invalid row ${i + 1}: Exactly one of VA, NVA, W must be non-zero.`);
      return;
    }
    if (durations.some(d => isNaN(d) || d < 0)) {
      alert(`Invalid row ${i + 1}: Durations must be non-negative numbers.`);
      return;
    }
    const taskHeight = durations.find(d => d > 0);
    const taskStatus = va > 0 ? "VA" : nva > 0 ? "NVA" : "W";
    if (opName !== currentOpName) {
      opCount += 1;
      opNames[opCount] = opName;
      yama[opCount] = [];
      taskIndex = 0;
      currentOpName = opName;
      firstOp = "n";
    }
    const taskStart = lastEndTime;
    const taskEnd = taskStart + taskHeight;
    yama[opCount][taskIndex] = {
      taskName,
      taskStart,
      taskEnd,
      taskHeight,
      taskStatus,
    };
    lastEndTime = taskEnd;
    taskIndex += 1;
    taskCount = taskIndex;
  }
  if (yama.length === 0) {
    alert("No valid tasks found in CSV.");
    return;
  }
  document.getElementById("chartBody").innerHTML = "";
  document.getElementById("pieChartContainer").innerHTML = "";
  updateTaskList();
  toConsole("CSV imported successfully", `Operations: ${opCount + 1}, Tasks: ${taskCount}`);
};

const exportToCSV = () => {
  if (yama.length === 0) {
    alert("No operations or tasks to export.");
    return;
  }
  let csvContent = "ProcessEndTime";
  for (let i = 0; i <= opCount; i++) {
    csvContent += `,OpStartTime-${i}`;
  }
  csvContent += "\n";
  csvContent += `${formatTimeToHHMMSSMS(processEndTime)}`;
  for (let i = 0; i <= opCount; i++) {
    csvContent += `,${formatTimeToHHMMSSMS(opStartTimes[i] || 0)}`;
  }
  csvContent += "\n";
  csvContent += "Operation,Task,VA,NVA,W\n";

  for (let i = 0; i < yama.length; i += 1) {
    for (let j = 0; j < yama[i].length; j += 1) {
      const task = yama[i][j];
      const status = task.taskStatus.toUpperCase();
      const vaDuration = status === "VA" ? task.taskHeight : 0;
      const nvaDuration = status === "NVA" ? task.taskHeight : 0;
      const wDuration = status === "W" ? task.taskHeight : 0;
      const escapedOpName = opNames[i].includes(",") ? `"${opNames[i]}"` : opNames[i];
      const escapedTaskName = task.taskName.includes(",") ? `"${task.taskName}"` : task.taskName;
      csvContent += `${escapedOpName},${escapedTaskName},${vaDuration},${nvaDuration},${wDuration}\n`;
    }
  }
  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", "operation_task_durations.csv");
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const drawTable = () => {
  if (yama.length === 0) {
    alert("No operations or tasks to chart.");
    return;
  }
  if (taktTime === null || taktTime <= 0) {
    alert("Invalid Takt Time. Please set a valid Takt Time (HH:MM:SS:MS).");
    return;
  }
  const series = [];
  for (let j = 0; j < yama.length; j += 1) {
    if (yama[j] && Array.isArray(yama[j])) {
      for (let i = 0; i < yama[j].length; i += 1) {
        const task = yama[j][i];
        const status = task.taskStatus.toUpperCase();
        const color = status === "VA" ? "#00FF00" : status === "NVA" ? "#FFFF00" : "#FF0000";
        const dataPoint = new Array(opNames.length).fill(0);
        dataPoint[j] = task.taskHeight;
        series.push({
          name: `${opNames[j]}: ${task.name || task.taskName} (${status})`,
          data: dataPoint,
          stack: opNames[j],
          color,
        });
      }
    } else {
      toConsole("Invalid task array for operation", j);
    }
  }
  toConsole("Generated series", JSON.stringify(series));
  toConsole("xAxis categories", JSON.stringify(opNames));
  Highcharts.chart("chartContainer", {
    chart: { type: "column" },
    accessibility: { enabled: false },
    title: { text: "Operation Task Durations by Status" },
    xAxis: { categories: opNames },
    yAxis: {
      title: {
        text: `Duration (${
          durationMode === "hhmmssms"
            ? "MM:SS:MS"
            : durationMode === "ms"
              ? "Milliseconds"
              : "Minutes"
        })`,
      },
      labels: {
        formatter() {
          return durationMode === "hhmmssms"
            ? formatDuration(this.value)
            : durationMode === "ms"
              ? this.value.toFixed(3)
              : formatDecimalMinutes(this.value);
        },
      },
      plotLines: [
        {
          value: taktTime,
          color: "#0000FF",
          width: 2,
          label: {
            text: `Takt: ${
              durationMode === "hhmmssms"
                ? formatDuration(taktTime)
                : durationMode === "ms"
                  ? `${taktTime.toFixed(3)} ms`
                  : `${formatDecimalMinutes(taktTime)} min`
            }`,
            align: "right",
            style: { color: "#0000FF" },
          },
        },
      ],
    },
    tooltip: {
      formatter() {
        const duration =
          durationMode === "hhmmssms"
            ? formatDuration(this.y)
            : durationMode === "ms"
              ? `${this.y.toFixed(3)} ms`
              : `${formatDecimalMinutes(this.y)} min`;
        return `<b>Operation: ${this.x}</b><br>Task: ${this.series.name}<br>Duration: ${duration}`;
      },
    },
    plotOptions: {
      column: {
        stacking: "normal",
        grouping: false,
        pointWidth: 50,
        dataLabels: {
          enabled: true,
          formatter() {
            return this.y > 0
              ? durationMode === "hhmmssms"
                ? formatDuration(this.y)
                : durationMode === "ms"
                  ? this.y.toFixed(3)
                  : formatDecimalMinutes(this.y)
              : "";
          },
        },
      },
    },
    series,
  });
  const outputHead = "<tr><th>Operation</th><th>VA</th><th>NVA</th><th>W</th></tr>";
  document.getElementById("chartHead").innerHTML = outputHead;
  let outputRow = "";
  for (let i = 0; i < yama.length; i += 1) {
    const statusDurations = { VA: 0, NVA: 0, W: 0 };
    if (yama[i] && Array.isArray(yama[i])) {
      for (let j = 0; j < yama[i].length; j += 1) {
        const status = yama[i][j].taskStatus.toUpperCase();
        if (status in statusDurations) {
          statusDurations[status] += yama[i][j].taskHeight;
        }
      }
    }
    outputRow += `<tr><td>${opNames[i]}</td>`;
    outputRow += `<td>${
      durationMode === "hhmmssms"
        ? formatDuration(statusDurations.VA)
        : durationMode === "ms"
          ? `${statusDurations.VA.toFixed(3)} ms`
          : `${formatDecimalMinutes(statusDurations.VA)} min`
    }</td>`;
    outputRow += `<td>${
      durationMode === "hhmmssms"
        ? formatDuration(statusDurations.NVA)
        : durationMode === "ms"
          ? `${statusDurations.NVA.toFixed(3)} ms`
          : `${formatDecimalMinutes(statusDurations.NVA)} min`
    }</td>`;
    outputRow += `<td>${
      durationMode === "hhmmssms"
        ? formatDuration(statusDurations.W)
        : durationMode === "ms"
          ? `${statusDurations.W.toFixed(3)} ms`
          : `${formatDecimalMinutes(statusDurations.W)} min`
    }</td>`;
    outputRow += "</tr>";
  }
  document.getElementById("chartBody").innerHTML = outputRow;
  updateProcessTimes();
  const pieChartContainer = document.getElementById("pieChartContainer");
  pieChartContainer.innerHTML = "";
  for (let i = 0; i < yama.length; i += 1) {
    const statusDurations = { VA: 0, NVA: 0, W: 0 };
    if (yama[i] && Array.isArray(yama[i])) {
      for (let j = 0; j < yama[i].length; j += 1) {
        if (yama[i][j] && yama[i][j].taskStatus) {
          const status = yama[i][j].taskStatus.toUpperCase();
          if (status in statusDurations) {
            statusDurations[status] += yama[i][j].taskHeight;
          }
        } else {
          toConsole("Invalid task data at", `Operation ${i}, Task ${j}`);
        }
      }
    } else {
      toConsole("No tasks for operation", opNames[i]);
      continue;
    }
    toConsole(
      "Pie chart data for operation",
      `${opNames[i]}: VA=${statusDurations.VA}, NVA=${statusDurations.NVA}, W=${statusDurations.W}`
    );
    const pieData = [
      { name: "VA", y: statusDurations.VA, color: "#00FF00" },
      { name: "NVA", y: statusDurations.NVA, color: "#FFFF00" },
      { name: "W", y: statusDurations.W, color: "#FF0000" },
    ].filter(item => item.y > 0);
    if (pieData.length === 0) {
      toConsole("No valid pie chart data for operation", opNames[i]);
      continue;
    }
    const pieDiv = document.createElement("div");
    pieDiv.id = `pieChart${i}`;
    pieDiv.className = "pieChart";
    pieChartContainer.appendChild(pieDiv);
    Highcharts.chart(`pieChart${i}`, {
      chart: { type: "pie", height: 200 },
      accessibility: { enabled: false },
      title: { text: `${opNames[i]} Duration by Status` },
      tooltip: {
        pointFormatter() {
          const duration =
            durationMode === "hhmmssms"
              ? formatDuration(this.y)
              : durationMode === "ms"
                ? `${this.y.toFixed(3)} ms`
                : `${formatDecimalMinutes(this.y)} min`;
          return `Duration: <b>${duration} (${this.percentage.toFixed(1)}%)</b>`;
        },
      },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: "pointer",
          dataLabels: {
            enabled: true,
            formatter() {
              return `${this.point.name}: ${
                durationMode === "hhmmssms"
                  ? formatDuration(this.y)
                  : durationMode === "ms"
                    ? this.y.toFixed(3)
                    : formatDecimalMinutes(this.y)
              }`;
            },
          },
        },
      },
      series: [
        {
          name: "Duration",
          data: pieData,
        },
      ],
    });
  }
};

const toConsole = (label, value) => {
  if (debuggin) {
    console.log(`${label}:`, value);
  }
};

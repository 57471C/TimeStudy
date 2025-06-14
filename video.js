let player;
let seekBar;
let playPauseButton;
let rewind5sButton;
let rewind1sButton;
let forward1sButton;
let forward5sButton;
let muteButton;
let volumeSlider;
let speedSlider;
let loadVideoButton;
let zoomLevel = 1;
let translateX = 0;
let translateY = 0;
let isDrawing = false;
let startX;
let startY;
let marqueeOverlay;
let marqueeRect;

const initializeVideo = () => {
  // Initialize TimeStudy.DOM
  TimeStudy.DOM = {
    taskList: document.getElementById("taskList"),
    videoPlaceholder: document.getElementById("videoPlaceholder"),
    videoWrapper: document.getElementById("videoWrapper"),
    chartContainer: document.getElementById("chartContainer"),
    pieChartContainer: document.getElementById("pieChartContainer"),
    taskTableFoot: null,
    darkModeToggle: document.getElementById("darkModeToggle"),
    darkModeIcon: document.getElementById("darkModeIcon"),
    currentTime: document.getElementById("currentTime"),
    durationTime: document.getElementById("durationTime"),
    speedValue: document.getElementById("speedValue"),
    video: document.getElementById("my_video"),
    marqueeOverlay: document.getElementById("marqueeOverlay"),
    marqueeRect: document.getElementById("marqueeRect"),
    videoFileInput: document.getElementById("videoFileInput"),
    csvFileInput: document.getElementById("csvFileInput"),
    zoomIn: document.getElementById("zoomIn"),
    zoomOut: document.getElementById("zoomOut"),
    resetZoom: document.getElementById("resetZoom"),
  };

  // Validate critical DOM elements
  if (!TimeStudy.DOM.video) {
    TimeStudy.toConsole("Video element not found", "id='my_video'", TimeStudy.debuggin);
    alert("Failed to initialize video player. Video element not found.");
    return;
  }
  if (!TimeStudy.DOM.videoWrapper || !TimeStudy.DOM.videoPlaceholder) {
    TimeStudy.toConsole("Video wrapper or placeholder not found", null, TimeStudy.debuggin);
    alert("Failed to initialize video controls. Wrapper or placeholder missing.");
    return;
  }

  player = TimeStudy.DOM.video;
  TimeStudy.player = player; // Shared via TimeStudy.player
  TimeStudy.playerReady = true;
  TimeStudy.toConsole("Video element initialized", "Success", TimeStudy.debuggin);

  marqueeOverlay = TimeStudy.DOM.marqueeOverlay;
  marqueeRect = TimeStudy.DOM.marqueeRect;

  player.addEventListener("timeupdate", seektimeupdate);
  player.addEventListener("loadedmetadata", () => {
    const duration = player.duration;
    if (seekBar) {
      seekBar.max = duration;
    }
    TimeStudy.processEndTime = duration; // Shared via TimeStudy.processEndTime
    updateTimeDisplay(duration, "durationTime");
    positionControls();
    updateLoadButtonColor();
    toggleVideoPlaceholder(false);
    player.playbackRate = 1;
    if (speedSlider) {
      speedSlider.value = 1;
      if (TimeStudy.DOM.speedValue) {
        TimeStudy.DOM.speedValue.textContent = "1x";
      }
    }
    TimeStudy.toConsole("Playback speed reset to 1x after load", "Success", TimeStudy.debuggin);
    if (volumeSlider) {
      volumeSlider.value = player.volume;
    } else {
      TimeStudy.toConsole("Volume slider not found", "id='volumeSlider'", TimeStudy.debuggin);
    }
    // Reset zoom on load
    zoomLevel = 1;
    translateX = 0;
    translateY = 0;
    TimeStudy.zoomLevel = zoomLevel; // Shared via TimeStudy.zoomLevel
    updateZoom();
  });
  player.addEventListener("play", () => {
    if (playPauseButton) {
      playPauseButton.textContent = "Pause";
    }
  });
  player.addEventListener("pause", () => {
    if (playPauseButton) {
      playPauseButton.textContent = "Play";
    }
  });
  player.addEventListener("error", () => {
    TimeStudy.toConsole("Video load error", "Failed to load video from URL", TimeStudy.debuggin);
    alert("Failed to load the video from the provided URL. Please use the 'Load' button to select a video file manually.");
    toggleVideoPlaceholder(true);
    updateLoadButtonColor();
  });

  loadVideoButton = document.getElementById("loadVideoButton");
  speedSlider = document.getElementById("speedSlider");
  seekBar = document.getElementById("seekBar");
  playPauseButton = document.getElementById("playPauseButton");
  rewind5sButton = document.getElementById("rewind5sButton");
  rewind1sButton = document.getElementById("rewind1sButton");
  forward1sButton = document.getElementById("forward1sButton");
  forward5sButton = document.getElementById("forward5sButton");
  muteButton = document.getElementById("muteButton");
  volumeSlider = document.getElementById("volumeSlider");

  // Validate control elements
  if (!loadVideoButton || !playPauseButton || !seekBar) {
    TimeStudy.toConsole("Video control elements missing", "loadVideoButton, playPauseButton, or seekBar", TimeStudy.debuggin);
    alert("Failed to initialize video controls. Critical elements not found.");
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  let videoUrl = urlParams.get("v");
  if (videoUrl) {
    TimeStudy.toConsole("Found video URL in GET parameter", videoUrl, TimeStudy.debuggin);
    player.src = videoUrl;
    player.load();
  } else {
    const hash = window.location.hash;
    if (hash.startsWith("#v=")) {
      videoUrl = decodeURIComponent(hash.substring(3));
      TimeStudy.toConsole("Found video URL in hash", videoUrl, TimeStudy.debuggin);
      player.src = videoUrl;
      player.load();
    }
  }

  if (TimeStudy.DOM.videoPlaceholder) {
    TimeStudy.DOM.videoPlaceholder.addEventListener("click", () => {
      if (TimeStudy.DOM.videoFileInput) {
        TimeStudy.DOM.videoFileInput.click();
        TimeStudy.toConsole("Video placeholder clicked", "Triggered Load Video", TimeStudy.debuggin);
      }
    });
  }

  if (playPauseButton) {
    playPauseButton.addEventListener("click", () => {
      if (player.paused) {
        player.play();
      } else {
        player.pause();
      }
    });
  }

  if (rewind5sButton) {
    rewind5sButton.addEventListener("click", () => {
      player.currentTime = Math.max(0, player.currentTime - 5);
      TimeStudy.toConsole("Rewind 5s", player.currentTime, TimeStudy.debuggin);
    });
  }
  if (rewind1sButton) {
    rewind1sButton.addEventListener("click", () => {
      player.currentTime = Math.max(0, player.currentTime - 1);
      TimeStudy.toConsole("Rewind 1s", player.currentTime, TimeStudy.debuggin);
    });
  }
  if (forward1sButton) {
    forward1sButton.addEventListener("click", () => {
      player.currentTime = Math.min(player.duration, player.currentTime + 1);
      TimeStudy.toConsole("Forward 1s", player.currentTime, TimeStudy.debuggin);
    });
  }
  if (forward5sButton) {
    forward5sButton.addEventListener("click", () => {
      player.currentTime = Math.min(player.duration, player.currentTime + 5);
      TimeStudy.toConsole("Forward 5s", player.currentTime, TimeStudy.debuggin);
    });
  }

  if (muteButton) {
    muteButton.addEventListener("click", () => {
      player.muted = !player.muted;
      muteButton.innerHTML = player.muted ? "🔇" : "🔊";
      muteButton.setAttribute("aria-label", player.muted ? "Unmute audio" : "Mute audio");
      TimeStudy.toConsole("Mute toggled", player.muted, TimeStudy.debuggin);
      if (volumeSlider) {
        volumeSlider.value = player.muted ? 0 : player.volume;
      }
    });
  }

  if (volumeSlider) {
    volumeSlider.addEventListener("input", TimeStudy.debounce(event => {
      const volume = parseFloat(event.target.value);
      if (!isNaN(volume)) {
        player.volume = volume;
        player.muted = volume === 0;
        if (muteButton) {
          muteButton.innerHTML = player.muted ? "🔇" : "🔊";
          muteButton.setAttribute("aria-label", player.muted ? "Unmute audio" : "Mute audio");
        }
        TimeStudy.toConsole("Volume adjusted", volume, TimeStudy.debuggin);
      }
    }, 100));
  }

  if (speedSlider) {
    speedSlider.addEventListener("input", TimeStudy.debounce(event => {
      const speed = parseFloat(event.target.value);
      if (!isNaN(speed)) {
        player.playbackRate = speed;
        if (TimeStudy.DOM.speedValue) {
          TimeStudy.DOM.speedValue.textContent = `${speed}x`;
        }
        TimeStudy.toConsole("Speed slider input event fired", speed, TimeStudy.debuggin);
        TimeStudy.toConsole("Speed value label updated", `${speed}x`, TimeStudy.debuggin);
      }
    }, 100));

    player.playbackRate = 1;
    TimeStudy.toConsole("Initial playback rate set", 1, TimeStudy.debuggin);
    if (TimeStudy.DOM.speedValue) {
      TimeStudy.DOM.speedValue.textContent = "1x";
    }
  }

  if (seekBar) {
    seekBar.addEventListener("input", TimeStudy.debounce(event => {
      const time = parseFloat(event.target.value);
      if (!isNaN(time)) {
        player.currentTime = time;
        TimeStudy.toConsole("Seek bar input event fired", time, TimeStudy.debuggin);
        TimeStudy.toConsole("Video seeked to", time, TimeStudy.debuggin);
      }
    }, 100));
  }

  if (TimeStudy.DOM.videoFileInput) {
    TimeStudy.DOM.videoFileInput.addEventListener("change", event => {
      const file = event.target.files[0];
      if (!file) {
        TimeStudy.toConsole("No video file selected", null, TimeStudy.debuggin);
        return;
      }

      if (player.src && TimeStudy.yama.length > 0) {
        const save = confirm(
          "You have unsaved data. Would you like to save your data as a CSV file before loading a new video?"
        );
        if (save) {
          TimeStudy.exportToCSV();
          TimeStudy.toConsole("Data exported to CSV before loading new video", null, TimeStudy.debuggin);
        }
        const proceed = confirm(
          "Loading a new video will clear all existing data and charts. Are you sure you want to proceed?"
        );
        if (!proceed) {
          TimeStudy.toConsole("User cancelled loading new video", null, TimeStudy.debuggin);
          return;
        }
      }

      const fileURL = URL.createObjectURL(file);
      player.src = fileURL;
      player.load();

      TimeStudy.yama = [];
      TimeStudy.opNames = [];
      TimeStudy.opStartTimes = [];
      TimeStudy.opCount = 0;
      TimeStudy.taskCount = 0;
      TimeStudy.firstOp = "y";
      if (TimeStudy.DOM.taktTimeInput) {
        TimeStudy.taktTime = parseTaktTime(TimeStudy.DOM.taktTimeInput.value);
      }
      TimeStudy.DOM.taskList.innerHTML = "";
      TimeStudy.DOM.pieChartContainer.innerHTML = "";
      TimeStudy.DOM.chartContainer.innerHTML = "";
      TimeStudy.updateTaskList();
      TimeStudy.addTaskButton.disabled = true;
      TimeStudy.addChartButton.disabled = true;
      TimeStudy.toggleFormatButton.disabled = true;
      TimeStudy.toConsole("Cleared all previous data and charts", null, TimeStudy.debuggin);

      player.playbackRate = 1;
      if (speedSlider) {
        speedSlider.value = 1;
        if (TimeStudy.DOM.speedValue) {
          TimeStudy.DOM.speedValue.textContent = "1x";
        }
      }
      TimeStudy.toConsole("Playback speed reset to 1x after manual load", "Success", TimeStudy.debuggin);

      updateLoadButtonColor();
    });
  }

  if (TimeStudy.DOM.zoomIn) {
    TimeStudy.DOM.zoomIn.addEventListener("click", () => {
      zoomLevel += 0.1;
      TimeStudy.zoomLevel = zoomLevel; // Shared via TimeStudy.zoomLevel
      updateZoom();
    });
  }
  if (TimeStudy.DOM.zoomOut) {
    TimeStudy.DOM.zoomOut.addEventListener("click", () => {
      zoomLevel = Math.max(0.1, zoomLevel - 0.1);
      TimeStudy.zoomLevel = zoomLevel; // Shared via TimeStudy.zoomLevel
      updateZoom();
    });
  }
  if (TimeStudy.DOM.resetZoom) {
    TimeStudy.DOM.resetZoom.addEventListener("click", () => {
      zoomLevel = 1;
      translateX = 0;
      translateY = 0;
      TimeStudy.zoomLevel = zoomLevel; // Shared via TimeStudy.zoomLevel
      updateZoom();
    });
  }

  if (marqueeOverlay) {
    marqueeOverlay.addEventListener("mousedown", startMarquee);
    marqueeOverlay.addEventListener("mousemove", drawMarquee);
    marqueeOverlay.addEventListener("mouseup", endMarquee);
  }

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
        TimeStudy.toConsole("Rewind 1s (Left Arrow)", player.currentTime, TimeStudy.debuggin);
        break;
      case "ArrowDown":
        e.preventDefault();
        player.currentTime = Math.max(0, player.currentTime - 5);
        TimeStudy.toConsole("Rewind 5s (Down Arrow)", player.currentTime, TimeStudy.debuggin);
        break;
      case "ArrowRight":
        e.preventDefault();
        player.currentTime = Math.min(player.duration, player.currentTime + 1);
        TimeStudy.toConsole("Forward 1s (Right Arrow)", player.currentTime, TimeStudy.debuggin);
        break;
      case "ArrowUp":
        e.preventDefault();
        player.currentTime = Math.min(player.duration, player.currentTime + 5);
        TimeStudy.toConsole("Forward 5s (Up Arrow)", player.currentTime, TimeStudy.debuggin);
        break;
      case "m":
        e.preventDefault();
        player.muted = !player.muted;
        if (muteButton) {
          muteButton.innerHTML = player.muted ? "🔇" : "🔊";
          muteButton.setAttribute("aria-label", player.muted ? "Unmute audio" : "Mute audio");
        }
        TimeStudy.toConsole("Mute toggled (M key)", player.muted, TimeStudy.debuggin);
        if (volumeSlider) {
          volumeSlider.value = player.muted ? 0 : player.volume;
        }
        break;
      case "=":
        e.preventDefault();
        zoomLevel += 0.1;
        TimeStudy.zoomLevel = zoomLevel; // Shared via TimeStudy.zoomLevel
        updateZoom();
        break;
      case "-":
        e.preventDefault();
        zoomLevel = Math.max(0.1, zoomLevel - 0.1);
        TimeStudy.zoomLevel = zoomLevel; // Shared via TimeStudy.zoomLevel
        updateZoom();
        break;
      case "Backspace":
        e.preventDefault();
        zoomLevel = 1;
        translateX = 0;
        translateY = 0;
        TimeStudy.zoomLevel = zoomLevel; // Shared via TimeStudy.zoomLevel
        updateZoom();
        break;
    }
  });

  if (loadVideoButton) {
    loadVideoButton.addEventListener("click", () => {
      if (TimeStudy.DOM.videoFileInput) {
        TimeStudy.DOM.videoFileInput.click();
      }
    });
  }

  updateLoadButtonColor();
  toggleVideoPlaceholder(true);
};

// Expose initVideo to TimeStudy
TimeStudy.initVideo = initializeVideo; // Shared via TimeStudy.initVideo

const seektimeupdate = () => {
  if (player && TimeStudy.playerReady) {
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
  if (TimeStudy.DOM[elementId]) {
    TimeStudy.DOM[elementId].textContent = TimeStudy.formatTimeToHHMMSSMS(seconds);
  }
};

const positionControls = () => {
  const controlsBar = document.getElementById("video_controls_bar");
  if (controlsBar) {
    controlsBar.style.position = "relative";
    TimeStudy.toConsole("Controls repositioned after video load", "Success", TimeStudy.debuggin);
  }
};

const updateLoadButtonColor = () => {
  if (loadVideoButton && player && playPauseButton) {
    const src = player.src;
    if (!src) {
      loadVideoButton.classList.remove("btn-yellow");
      loadVideoButton.classList.add("btn-orange");
      playPauseButton.disabled = true;
      if (rewind5sButton) rewind5sButton.disabled = true;
      if (rewind1sButton) rewind1sButton.disabled = true;
      if (forward1sButton) forward1sButton.disabled = true;
      if (forward5sButton) forward5sButton.disabled = true;
      if (muteButton) muteButton.disabled = true;
      if (volumeSlider) volumeSlider.disabled = true;
    } else {
      loadVideoButton.classList.remove("btn-orange");
      loadVideoButton.classList.add("btn-yellow");
      playPauseButton.disabled = false;
      if (rewind5sButton) rewind5sButton.disabled = false;
      if (rewind1sButton) rewind1sButton.disabled = false;
      if (forward1sButton) forward1sButton.disabled = false;
      if (forward5sButton) forward5sButton.disabled = false;
      if (muteButton) muteButton.disabled = false;
      if (volumeSlider) volumeSlider.disabled = false;
    }
  }
};

const toggleVideoPlaceholder = show => {
  try {
    if (!TimeStudy.DOM.videoPlaceholder || !TimeStudy.DOM.videoWrapper) {
      throw new Error("Video placeholder or wrapper element not found");
    }
    if (show) {
      TimeStudy.toConsole("Showing placeholder, hiding video wrapper", null, TimeStudy.debuggin);
      TimeStudy.DOM.videoPlaceholder.style.display = "flex";
      TimeStudy.DOM.videoWrapper.style.display = "none";
    } else {
      TimeStudy.toConsole("Hiding placeholder, showing video wrapper", null, TimeStudy.debuggin);
      TimeStudy.DOM.videoPlaceholder.style.display = "none";
      TimeStudy.DOM.videoWrapper.style.display = "block";
    }
  } catch (error) {
    TimeStudy.toConsole("toggleVideoPlaceholder error", error.message, TimeStudy.debuggin);
    alert("Failed to toggle video placeholder. Please check the console for details.");
  }
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
  TimeStudy.toConsole("Marquee start", `(${startX}, ${startY})`, TimeStudy.debuggin);
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

  TimeStudy.toConsole("Marquee end", `Box: (${x1}, ${y1}) to (${x2}, ${y2})`, TimeStudy.debuggin);

  if (marqueeWidth < 10 || marqueeHeight < 10) {
    TimeStudy.toConsole("Marquee too small, ignoring zoom", null, TimeStudy.debuggin);
    return;
  }

  const videoWrapper = TimeStudy.DOM.videoWrapper;
  const wrapperWidth = videoWrapper.clientWidth;
  const wrapperHeight = videoWrapper.clientHeight;

  const video = TimeStudy.DOM.video;
  const videoRect = video.getBoundingClientRect();
  const wrapperRect = videoWrapper.getBoundingClientRect();
  const offsetX = videoRect.left - wrapperRect.left;
  const offsetY = videoRect.top - wrapperRect.top;
  const videoDisplayWidth = videoRect.width;
  const videoDisplayHeight = videoRect.height;
  TimeStudy.toConsole(
    "Video display",
    `Width: ${videoDisplayWidth}, Height: ${videoDisplayHeight}, Offset: (${offsetX}, ${offsetY})`,
    TimeStudy.debuggin
  );

  const marqueeX1 = x1 - offsetX;
  const marqueeY1 = y1 - offsetY;
  const marqueeX2 = x2 - offsetX;
  const marqueeY2 = y2 - offsetY;

  const marqueeCenterX = (marqueeX1 + marqueeX2) / 2;
  const marqueeCenterY = (marqueeY1 + marqueeY2) / 2;
  TimeStudy.toConsole("Marquee center (display)", `(${marqueeCenterX}, ${marqueeCenterY})`, TimeStudy.debuggin);

  const zoomX = videoDisplayWidth / marqueeWidth;
  const zoomY = videoDisplayHeight / marqueeHeight;
  const newZoomLevel = Math.min(zoomX, zoomY);
  TimeStudy.toConsole("New zoom level (relative)", newZoomLevel, TimeStudy.debuggin);

  const previousZoomLevel = zoomLevel;
  zoomLevel *= newZoomLevel;
  TimeStudy.zoomLevel = zoomLevel; // Shared via TimeStudy.zoomLevel
  TimeStudy.toConsole("Cumulative zoom level", zoomLevel, TimeStudy.debuggin);

  const videoCoordX = (marqueeCenterX - translateX * previousZoomLevel) / previousZoomLevel;
  const videoCoordY = (marqueeCenterY - translateY * previousZoomLevel) / previousZoomLevel;
  TimeStudy.toConsole("Marquee center (video coords)", `(${videoCoordX}, ${videoCoordY})`, TimeStudy.debuggin);

  const scaledVideoCoordX = videoCoordX * zoomLevel;
  const scaledVideoCoordY = videoCoordY * zoomLevel;
  TimeStudy.toConsole("Scaled video coordinates", `(${scaledVideoCoordX}, ${scaledVideoCoordY})`, TimeStudy.debuggin);

  translateX = (wrapperWidth / 2 - scaledVideoCoordX) / zoomLevel;
  translateY = (wrapperHeight / 2 - scaledVideoCoordY) / zoomLevel;
  TimeStudy.toConsole("New translation", `(${translateX}, ${translateY})`, TimeStudy.debuggin);

  const finalX = videoCoordX * zoomLevel + translateX * zoomLevel;
  const finalY = videoCoordY * zoomLevel + translateY * zoomLevel;
  TimeStudy.toConsole("Final center position", `(${finalX}, ${finalY})`, TimeStudy.debuggin);

  updateZoom();
};

const updateZoom = () => {
  const video = TimeStudy.DOM.video;
  if (video) {
    video.style.transform = `scale(${zoomLevel}) translate(${translateX}px, ${translateY}px)`;
    TimeStudy.toConsole("Zoom updated", `Level: ${zoomLevel}, Translate: (${translateX}, ${translateY})`, TimeStudy.debuggin);
  }
};

// Expose updateZoom to TimeStudy
TimeStudy.updateZoom = updateZoom; // Shared via TimeStudy.updateZoom
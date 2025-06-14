let addTaskButton;
let addOpButton;
let addChartButton;
let toggleFormatButton;
let csvExportButton;
let csvImportButton;
let taktTimeInput;

const debuggin = 1;
let opCount = 0;
let firstOp = "y";
let taskCount = 0;
let yama = [];
let opNames = [];
let opStartTimes = [];
let taktTime = null;
let durationMode = "hhmmssms";
let playerReady = false;
let processEndTime = 0;
const APP_VERSION = "0.3.3";

const loadHighcharts = () => {
  return new Promise((resolve, reject) => {
    if (typeof Highcharts !== "undefined") {
      TimeStudy.toConsole("Highcharts already loaded", Highcharts.version, debuggin);
      resolve();
      return;
    }
    const scripts = [
      "https://code.highcharts.com/highcharts.js",
      "https://code.highcharts.com/modules/accessibility.js",
    ];
    let loaded = 0;
    scripts.forEach(src => {
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.onload = () => {
        loaded += 1;
        TimeStudy.toConsole("Highcharts script loaded", src, debuggin);
        if (loaded === scripts.length) {
          TimeStudy.toConsole("Highcharts fully loaded", Highcharts.version, debuggin);
          resolve();
        }
      };
      script.onerror = () => {
        TimeStudy.toConsole("Highcharts script load error", src, debuggin);
        reject(new Error(`Failed to load Highcharts script: ${src}`));
      };
      document.head.appendChild(script);
    });
  });
};

const setHighchartsTheme = isDark => {
  Highcharts.setOptions({
    chart: { backgroundColor: isDark ? "#1c2526" : "#ffffff" },
    title: { style: { color: isDark ? "#d1d5db" : "#212529" } },
    xAxis: {
      labels: { style: { color: isDark ? "#d1d5db" : "#212529" } },
      lineColor: isDark ? "#374151" : "#dee2e6",
      tickColor: isDark ? "#374151" : "#dee2e6",
    },
    yAxis: {
      labels: { style: { color: isDark ? "#d1d5db" : "#212529" } },
      title: { style: { color: isDark ? "#d1d5db" : "#212529" } },
      gridLineColor: isDark ? "#374151" : "#dee2e6",
    },
    tooltip: {
      backgroundColor: isDark ? "#1c2526" : "#ffffff",
      borderColor: isDark ? "#374151" : "#dee2e6",
      style: { color: isDark ? "#d1d5db" : "#212529" },
    },
    plotOptions: {
      series: { dataLabels: { style: { color: isDark ? "#d1d5db" : "#212529" } } },
    },
    legend: {
      itemStyle: { color: isDark ? "#d1d5db" : "#212529" },
      itemHoverStyle: { color: isDark ? "#60a5fa" : "#0d6efd" },
    },
  });
  TimeStudy.toConsole("Highcharts theme set", isDark ? "Dark" : "Light", debuggin);
};

const initializeApp = () => {
  playerReady = true;
  TimeStudy.playerReady = playerReady; // Shared via TimeStudy.playerReady
  TimeStudy.toConsole("App initialized", "Success", debuggin);
  TimeStudy.toConsole("App Version", APP_VERSION, debuggin);

  const isDarkMode = localStorage.getItem("darkMode") === "true";
  if (typeof Highcharts !== "undefined") {
    setHighchartsTheme(isDarkMode);
  }
  if (isDarkMode) {
    document.body.classList.add("dark-mode");
    TimeStudy.DOM.darkModeIcon.textContent = "🌙";
  } else {
    document.body.classList.remove("dark-mode");
    TimeStudy.DOM.darkModeIcon.textContent = "☀️";
  }

  // Initialize history state to intercept back button
  history.pushState(null, null, document.URL);
  window.onpopstate = () => {
    if (yama.length > 0) {
      const leave = confirm("You have unsaved data. Are you sure you want to go back?");
      if (!leave) {
        history.pushState(null, null, document.URL);
      } else {
        history.back();
      }
    } else {
      history.back();
    }
  };

  // Warn on tab close if unsaved data exists
  window.onbeforeunload = () => {
    if (yama.length > 0) {
      return "You have unsaved data. Are you sure you want to leave?";
    }
    return null;
  };

  TimeStudy.DOM.darkModeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    const isDark = document.body.classList.contains("dark-mode");
    TimeStudy.DOM.darkModeIcon.textContent = isDark ? "🌙" : "☀️";
    localStorage.setItem("darkMode", isDark);
    TimeStudy.toConsole("Dark mode toggled", isDark ? "On" : "Off", debuggin);
    if (typeof Highcharts !== "undefined") {
      setHighchartsTheme(isDark);
    }
    updateTaskList();
    if (yama.length > 0) {
      drawTable();
    }
  });

  addTaskButton = document.getElementById("addTaskButton");
  addOpButton = document.getElementById("addOpButton");
  addChartButton = document.getElementById("addChartButton");
  csvExportButton = document.getElementById("csvExportButton");
  csvImportButton = document.getElementById("csvImportButton");
  toggleFormatButton = document.getElementById("toggleFormatButton");
  taktTimeInput = document.getElementById("taktTimeInput");

  // Shared via TimeStudy
  TimeStudy.addTaskButton = addTaskButton;
  TimeStudy.addChartButton = addChartButton;
  TimeStudy.toggleFormatButton = toggleFormatButton;
  TimeStudy.taktTimeInput = taktTimeInput;

  // Initialize button states
  addTaskButton.disabled = true;
  addChartButton.disabled = true;
  toggleFormatButton.disabled = true;

  taktTime = parseTaktTime(taktTimeInput.value);
  TimeStudy.taktTime = taktTime; // Shared via TimeStudy.taktTime

  taktTimeInput.addEventListener(
    "input",
    TimeStudy.debounce(event => {
      const newTaktTime = parseTaktTime(event.target.value);
      if (newTaktTime !== null) {
        taktTime = newTaktTime;
        TimeStudy.taktTime = taktTime;
        TimeStudy.toConsole("Takt Time updated", taktTime, debuggin);
      } else {
        alert("Invalid Takt Time format. Please use HH:MM:SS:MS (e.g., 00:01:00:00).");
        taktTimeInput.value = formatTaktTime(taktTime);
      }
    }, 100)
  );

  addOpButton.addEventListener("click", addOp);
  addTaskButton.addEventListener("click", addTask, false);
  addChartButton.addEventListener("click", drawTable, false);
  csvExportButton.addEventListener("click", exportToCSV, false);
  csvImportButton.addEventListener("click", () => {
    TimeStudy.DOM.csvFileInput.click();
  });

  TimeStudy.DOM.csvFileInput.addEventListener("change", event => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        importFromCSV(e.target.result);
      };
      reader.readAsText(file);
    }
  });

  toggleFormatButton.addEventListener("click", () => {
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

  document.addEventListener("keydown", e => {
    switch (e.key) {
      case "t":
        e.preventDefault();
        if (!addTaskButton.disabled) addTask();
        break;
      case "o":
        e.preventDefault();
        addOp();
        break;
    }
  });

  TimeStudy.toConsole("jQuery version", $.fn.jquery, debuggin);
};

window.onload = () => {
  TimeStudy.initVideo();
  initializeApp();
};

const addOp = () => {
  TimeStudy.player.pause();
  const opName = prompt("Please name the Operation");
  if (!opName) {
    alert("Operation name cannot be empty.");
    return;
  }
  const startTime = TimeStudy.player.currentTime;
  TimeStudy.toConsole("Operation start time", startTime, debuggin);
  if (firstOp === "n") {
    opCount += 1;
    TimeStudy.toConsole("Creating Operation opCount has increased by 1", opCount, debuggin);
  } else {
    firstOp = "n";
    TimeStudy.toConsole("Creating first operation yama[0]", opCount, debuggin);
  }
  opNames[opCount] = opName;
  opStartTimes[opCount] = startTime;
  taskCount = 0;
  yama[opCount] = [];
  TimeStudy.toConsole("taskCount has been reset", taskCount, debuggin);
  addTaskButton.disabled = false;
  addChartButton.disabled = false;
  toggleFormatButton.disabled = false;

  // Update shared state
  TimeStudy.opCount = opCount;
  TimeStudy.firstOp = firstOp;
  TimeStudy.taskCount = taskCount;
  TimeStudy.yama = yama;
  TimeStudy.opNames = opNames;
  TimeStudy.opStartTimes = opStartTimes;

  updateTaskList();
};

const addTask = () => {
  TimeStudy.player.pause();
  TimeStudy.toConsole("playPause", "play paused to add task", debuggin);
  if (yama.length === 0) {
    alert("There's no Operation yet! Please add an Operation first.");
    TimeStudy.toConsole("Tried to add a Task, but No Operation exists", null, debuggin);
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
  TimeStudy.toConsole("taskName", taskName, debuggin);
  const taskEnd = TimeStudy.player.currentTime * 1000;
  TimeStudy.toConsole("taskEnd", taskEnd, debuggin);
  const opIndex = opCount;
  const opStartTimeInputId = `opTimeInput-${opIndex}`;
  const opTimeInput = document.getElementById(opStartTimeInputId);
  const opStartTime = parseTimeFromHHMMSSMS(opTimeInput.value) || 0;
  TimeStudy.toConsole("opStartTime from input", opStartTime, debuggin);
  const taskStart = taskCount === 0 ? opStartTime * 1000 : yama[opCount][taskCount - 1].taskEnd;
  TimeStudy.toConsole("taskStart", taskStart, debuggin);
  const taskHeight = taskCount === 0 ? taskEnd - opStartTime * 1000 : taskEnd - taskStart;
  TimeStudy.toConsole("taskHeight", taskHeight, debuggin);
  let taskStatus = prompt("VA, NVA, W? (or 1=VA, 2=NVA, 3=W)");
  if (!taskStatus) {
    alert("Task status cannot be empty.");
    return;
  }
  TimeStudy.toConsole("taskStatus input", taskStatus, debuggin);

  taskStatus = taskStatus.toUpperCase();
  if (taskStatus === "1") taskStatus = "VA";
  if (taskStatus === "2") taskStatus = "NVA";
  if (taskStatus === "3") taskStatus = "W";

  if (!["VA", "NVA", "W"].includes(taskStatus)) {
    alert("Invalid task status. Please enter VA, NVA, W, 1 (VA), 2 (NVA), or 3 (W).");
    return;
  }
  TimeStudy.toConsole("taskStatus processed", taskStatus, debuggin);
  yama[opCount][taskCount] = {
    taskName,
    taskStart,
    taskEnd,
    taskHeight,
    taskStatus,
  };
  console.table(yama[opCount][taskCount]);
  taskCount += 1;

  // Update shared state
  TimeStudy.taskCount = taskCount;
  TimeStudy.yama = yama;

  updateTaskList();
};

const insertTask = (opIndex, taskIndex) => {
  TimeStudy.player.pause();
  TimeStudy.toConsole("playPause", "play paused to insert task", debuggin);
  const taskName = prompt("Please name the new Task");
  if (!taskName) {
    alert("Task name cannot be empty.");
    return;
  }
  TimeStudy.toConsole("taskName", taskName, debuggin);
  let taskStatus = prompt("VA, NVA, W? (or 1=VA, 2=NVA, 3=W)");
  if (!taskStatus) {
    alert("Task status cannot be empty.");
    return;
  }
  TimeStudy.toConsole("taskStatus input", taskStatus, debuggin);

  taskStatus = taskStatus.toUpperCase();
  if (taskStatus === "1") taskStatus = "VA";
  if (taskStatus === "2") taskStatus = "NVA";
  if (taskStatus === "3") taskStatus = "W";

  if (!["VA", "NVA", "W"].includes(taskStatus)) {
    alert("Invalid task status. Please enter VA, NVA, W, 1 (VA), 2 (NVA), or 3 (W).");
    return;
  }
  TimeStudy.toConsole("taskStatus processed", taskStatus, debuggin);

  const currentTask = yama[opIndex][taskIndex];
  const originalDuration = currentTask.taskHeight;

  if (originalDuration <= 0) {
    alert("Cannot split a task with zero or negative duration.");
    return;
  }

  const newDuration = Math.floor(originalDuration / 2);
  const remainingDuration = originalDuration - newDuration;

  currentTask.taskHeight = remainingDuration;
  currentTask.taskEnd = currentTask.taskStart + remainingDuration;

  const newTask = {
    taskName,
    taskStart: currentTask.taskEnd,
    taskEnd: currentTask.taskEnd + newDuration,
    taskHeight: newDuration,
    taskStatus,
  };

  yama[opIndex].splice(taskIndex + 1, 0, newTask);

  for (let i = taskIndex + 2; i < yama[opIndex].length; i += 1) {
    yama[opIndex][i].taskStart = yama[opIndex][i - 1].taskEnd;
    yama[opIndex][i].taskEnd = yama[opIndex][i].taskStart + yama[opIndex][i].taskHeight;
  }

  taskCount = yama[opIndex].length;
  TimeStudy.taskCount = taskCount; // Shared via TimeStudy.taskCount
  TimeStudy.yama = yama; // Shared via TimeStudy.yama

  updateTaskList();
  drawTable();
};

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
  TimeStudy.yama = yama; // Shared via TimeStudy.yama
  updateTaskList();
  drawTable();
};

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
    if (isNaN(minutes) || isNaN(seconds) || isNaN(milliseconds) || seconds >= 60 || milliseconds >= 1000) {
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
    const decimalMinutes = parseFloat(newDurationInput);
    if (isNaN(decimalMinutes) || decimalMinutes < 0) {
      alert("Invalid duration. Please enter a non-negative number.");
      return;
    }
    newDurationMs = decimalMinutes * 60 * 1000;
  }
  yama[opIndex][taskIndex].taskHeight = newDurationMs;
  yama[opIndex][taskIndex].taskEnd = yama[opIndex][taskIndex].taskStart + newDurationMs;
  for (let i = taskIndex + 1; i < yama[opIndex].length; i += 1) {
    yama[opIndex][i].taskStart = yama[opIndex][i - 1].taskEnd;
    yama[opIndex][i].taskEnd = yama[opIndex][i].taskStart + yama[opIndex][i].taskHeight;
  }
  TimeStudy.yama = yama; // Shared via TimeStudy.yama
  updateTaskList();
  drawTable();
};

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
        addTaskButton.disabled = true;
        addChartButton.disabled = true;
        toggleFormatButton.disabled = true;
      }
    }
    taskCount = yama[opIndex] ? yama[opIndex].length : 0;

    // Update shared state
    TimeStudy.opCount = opCount;
    TimeStudy.firstOp = firstOp;
    TimeStudy.taskCount = taskCount;
    TimeStudy.yama = yama;
    TimeStudy.opNames = opNames;
    TimeStudy.opStartTimes = opStartTimes;
    TimeStudy.addTaskButton.disabled = addTaskButton.disabled;
    TimeStudy.addChartButton.disabled = addChartButton.disabled;
    TimeStudy.toggleFormatButton.disabled = toggleFormatButton.disabled;

    updateTaskList();
    drawTable();
  }
};

const deleteOperation = opIndex => {
  if (
    confirm(
      `Are you sure you want to delete the operation "${opNames[opIndex]}" and all its tasks? This action cannot be undone.`
    )
  ) {
    yama.splice(opIndex, 1);
    opNames.splice(opIndex, 1);
    opStartTimes.splice(opIndex, 1);
    opCount -= 1;
    if (opCount < 0) {
      opCount = 0;
      firstOp = "y";
      addTaskButton.disabled = true;
      addChartButton.disabled = true;
      toggleFormatButton.disabled = true;
    }
    taskCount = yama[opCount] ? yama[opCount].length : 0;

    // Update shared state
    TimeStudy.opCount = opCount;
    TimeStudy.firstOp = firstOp;
    TimeStudy.taskCount = taskCount;
    TimeStudy.yama = yama;
    TimeStudy.opNames = opNames;
    TimeStudy.opStartTimes = opStartTimes;
    TimeStudy.addTaskButton.disabled = addTaskButton.disabled;
    TimeStudy.addChartButton.disabled = addChartButton.disabled;
    TimeStudy.toggleFormatButton.disabled = toggleFormatButton.disabled;

    TimeStudy.toConsole(
      `Deleted operation at index ${opIndex}`,
      `opCount: ${opCount}, taskCount: ${taskCount}`,
      debuggin
    );
    updateTaskList();
    drawTable();
  }
};

const jumpToOperationTime = inputId => {
  const opTimeInput = document.getElementById(inputId);
  const time = parseTimeFromHHMMSSMS(opTimeInput.value);
  if (time !== null) {
    if (TimeStudy.player.src) {
      TimeStudy.player.currentTime = time;
      TimeStudy.toConsole("Jumped to operation time", time, debuggin);
    } else {
      alert("Please load a video first.");
    }
  } else {
    alert("Invalid time format in the input field.");
  }
};

const updateTaskList = () => {
  try {
    if (!TimeStudy.DOM.taskList) throw new Error("Task list element not found");
    const isDarkMode = document.body.classList.contains("dark-mode");
    const rows = [
      `<table class="table table-bordered task-table${isDarkMode ? " table-dark" : ""}">
         <thead>
           <tr>
             <th scope="col">Operation</th>
             <th scope="col">Task</th>
             <th scope="col">Duration</th>
             <th scope="col">Status</th>
             <th scope="col">Actions</th>
           </tr>
         </thead>
         <tbody>`,
    ];
    for (let i = 0; i < yama.length; i += 1) {
      const opTimeInputId = `opTimeInput-${i}`;
      const formattedTime = formatTimeToHHMMSSMS(opStartTimes[i]);
      rows.push(`
        <tr>
          <td colspan="4">
            <a href="javascript:void(0)" onclick="jumpToOperationTime('${opTimeInputId}')">
              Operation: ${opNames[i]}
            </a>
            <span class="op-time-container">
              <label for="${opTimeInputId}" class="form-label" style="width: auto;">Start:</label>
              <input type="text" id="${opTimeInputId}" class="form-control op-time-input" value="${formattedTime}">
            </span>
          </td>
          <td>
            <button onclick="deleteOperation(${i})" class="btn btn-danger">Delete Operation</button>
          </td>
        </tr>
      `);
      for (let j = 0; j < yama[i].length; j += 1) {
        const task = yama[i][j];
        const duration =
          durationMode === "hhmmssms"
            ? formatDuration(task.taskHeight)
            : durationMode === "ms"
              ? `${task.taskHeight.toFixed(3)} ms`
              : `${formatDecimalMinutes(task.taskHeight)} min`;
        rows.push(`
          <tr>
            <td></td>
            <td>${task.taskName}</td>
            <td>${duration}</td>
            <td>${task.taskStatus}</td>
            <td>
              <button onclick="editTask(${i}, ${j})" class="btn btn-sm btn-outline-primary">Edit</button>
              <button onclick="editTaskDuration(${i}, ${j})" class="btn btn-sm btn-outline-primary">Edit Duration</button>
              <button onclick="deleteTask(${i}, ${j})" class="btn btn-sm btn-outline-danger">Delete</button>
              <button onclick="insertTask(${i}, ${j})" class="btn btn-sm btn-outline-secondary">Split Task</button>
            </td>
          </tr>
        `);
      }
    }
    rows.push(`
        </tbody>
        <tfoot id="taskTableFoot"></tfoot>
      </table>
    `);
    TimeStudy.DOM.taskList.innerHTML = rows.join("");

    TimeStudy.DOM.taskTableFoot = document.getElementById("taskTableFoot");

    const table = document.querySelector(".task-table");
    if (!table) throw new Error("Task table element not found");
    if (yama.length > 0) {
      table.style.display = "table";
      addTaskButton.disabled = false;
      addChartButton.disabled = false;
      toggleFormatButton.disabled = false;
      TimeStudy.addTaskButton.disabled = false;
      TimeStudy.addChartButton.disabled = false;
      TimeStudy.toggleFormatButton.disabled = false;
      updateProcessTimes();
    } else {
      table.style.display = "none";
      addTaskButton.disabled = true;
      addChartButton.disabled = true;
      toggleFormatButton.disabled = true;
      TimeStudy.addTaskButton.disabled = true;
      TimeStudy.addChartButton.disabled = true;
      TimeStudy.toggleFormatButton.disabled = true;
    }

    for (let i = 0; i < yama.length; i += 1) {
      const opTimeInput = document.getElementById(`opTimeInput-${i}`);
      if (!opTimeInput) throw new Error(`Operation time input opTimeInput-${i} not found`);
      opTimeInput.addEventListener(
        "input",
        TimeStudy.debounce(event => {
          const newTime = parseTimeFromHHMMSSMS(event.target.value);
          if (newTime !== null) {
            opStartTimes[i] = newTime;
            TimeStudy.opStartTimes[i] = newTime;
            TimeStudy.toConsole(`Operation ${i} start time updated`, opStartTimes[i], debuggin);
            updateProcessTimes();
          } else {
            alert("Invalid time format. Please use HH:MM:SS:MS (e.g., 00:01:00:00).");
            opTimeInput.value = formatTimeToHHMMSSMS(opStartTimes[i]);
          }
        }, 100)
      );
    }
  } catch (error) {
    TimeStudy.toConsole("updateTaskList error", error.message, debuggin);
    alert("Failed to update task list. Please check the console for details.");
  }
};

// Expose updateTaskList to TimeStudy
TimeStudy.updateTaskList = updateTaskList; // Shared via TimeStudy.updateTaskList

const updateProcessTimes = () => {
  try {
    if (yama.length === 0) return;

    if (!TimeStudy.DOM.taskTableFoot) {
      TimeStudy.toConsole("updateProcessTimes skipped", "taskTableFoot is null", debuggin);
      return;
    }

    const formattedEndTime = formatTimeToHHMMSSMS(processEndTime);
    let totalProcessTime = "00:00:00:00";
    if (opStartTimes.length > 0) {
      const durationSeconds = Math.max(0, processEndTime - opStartTimes[0]);
      totalProcessTime = formatTimeToHHMMSSMS(durationSeconds);
    }

    TimeStudy.DOM.taskTableFoot.innerHTML = `
      <tr>
        <td colspan="5" class="table-foot">
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

    const processEndTimeInput = document.getElementById("processEndTimeInput");
    if (!processEndTimeInput) throw new Error("Process end time input not found");
    processEndTimeInput.addEventListener(
      "input",
      TimeStudy.debounce(event => {
        const newEndTime = parseTimeFromHHMMSSMS(event.target.value);
        if (newEndTime !== null) {
          processEndTime = newEndTime;
          TimeStudy.processEndTime = processEndTime; // Shared via TimeStudy.processEndTime
          TimeStudy.toConsole("Process end time updated", processEndTime, debuggin);
          const durationSeconds = opStartTimes.length > 0 ? Math.max(0, processEndTime - opStartTimes[0]) : 0;
          document.getElementById("totalProcessTimeInput").value = formatTimeToHHMMSSMS(durationSeconds);
        } else {
          alert("Invalid time format. Please use HH:MM:SS:MS (e.g., 00:01:00:00).");
          processEndTimeInput.value = formatTimeToHHMMSSMS(processEndTime);
        }
      }, 100)
    );
  } catch (error) {
    TimeStudy.toConsole("updateProcessTimes error", error.message, debuggin);
    alert("Failed to update process times. Please check the console for details.");
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

  const metaDataLine = lines[1].split(",").map(val => val.trim());
  processEndTime = parseTimeFromHHMMSSMS(metaDataLine[0]) || 0;
  TimeStudy.processEndTime = processEndTime; // Shared via TimeStudy.processEndTime
  TimeStudy.toConsole("Imported Process end time", processEndTime, debuggin);

  const opStartTimeHeaders = header.slice(1);
  opStartTimes = [];
  for (let i = 0; i < opStartTimeHeaders.length; i++) {
    let timeStr = metaDataLine[i + 1];
    const parts = timeStr.split(":");
    if (parts.length === 4) {
      const hours = parseInt(parts[0], 10);
      const minutes = parseInt(parts[1], 10);
      const seconds = parseInt(parts[2], 10);
      const milliseconds = parseInt(parts[3], 10);
      if (hours === 0 && minutes === 0 && seconds >= 60) {
        const newMinutes = Math.floor(seconds / 60);
        const newSeconds = seconds % 60;
        timeStr = `00:${newMinutes.toString().padStart(2, "0")}:${newSeconds.toString().padStart(2, "0")}:${milliseconds.toString().padStart(2, "0")}`;
        TimeStudy.toConsole(`Fixed OpStartTime-${i}`, `${metaDataLine[i + 1]} -> ${timeStr}`, debuggin);
      }
    }
    const time = parseTimeFromHHMMSSMS(timeStr);
    if (time !== null) {
      opStartTimes[i] = time;
    } else {
      opStartTimes[i] = 0;
      TimeStudy.toConsole("Invalid OpStartTime, defaulting to 0", `OpStartTime-${i}`, debuggin);
    }
  }
  TimeStudy.opStartTimes = opStartTimes; // Shared via TimeStudy.opStartTimes
  TimeStudy.toConsole("Imported OpStartTimes", opStartTimes, debuggin);

  yama = [];
  opNames = [];
  opCount = -1;
  taskCount = 0;
  firstOp = "y";
  taktTime = parseTaktTime(taktTimeInput.value);

  TimeStudy.DOM.taskList.innerHTML = "";
  TimeStudy.DOM.pieChartContainer.innerHTML = "";
  TimeStudy.DOM.chartContainer.innerHTML = "";

  const taskHeaders = lines[2].split(",").map(h => h.trim());
  const expectedTaskHeaders = ["Operation", "Task", "VA", "NVA", "W"];
  if (taskHeaders.length !== expectedTaskHeaders.length || !taskHeaders.every((h, i) => h === expectedTaskHeaders[i])) {
    alert("Invalid CSV format. Expected task headers: Operation,Task,VA,NVA,W");
    return;
  }
  let currentOpName = "";
  let taskIndex = 0;
  let lastEndTime = 0;
  for (let i = 3; i < lines.length; i += 1) {
    const row = lines[i].split(",").map(cell => cell.trim());
    if (row.length < 5) {
      TimeStudy.toConsole("Skipping invalid row", `Line ${i + 1}: ${lines[i]}`, debuggin);
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

  // Update shared state
  TimeStudy.opCount = opCount;
  TimeStudy.firstOp = firstOp;
  TimeStudy.taskCount = taskCount;
  TimeStudy.yama = yama;
  TimeStudy.opNames = opNames;
  TimeStudy.taktTime = taktTime;
  TimeStudy.addTaskButton.disabled = false;
  TimeStudy.addChartButton.disabled = false;
  TimeStudy.toggleFormatButton.disabled = false;

  updateTaskList();
  TimeStudy.toConsole("CSV imported successfully", `Operations: ${opCount + 1}, Tasks: ${taskCount}`, debuggin);
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

// Expose exportToCSV to TimeStudy
TimeStudy.exportToCSV = exportToCSV; // Shared via TimeStudy.exportToCSV

const drawTable = () => {
  try {
    if (!TimeStudy.DOM.chartContainer || !TimeStudy.DOM.pieChartContainer) {
      throw new Error("Chart container elements not found");
    }
    if (yama.length === 0) {
      alert("No operations or tasks to chart.");
      return;
    }
    if (taktTime === null || taktTime <= 0) {
      alert("Invalid Takt Time. Please set a valid Takt Time (HH:MM:SS:MS).");
      return;
    }
    loadHighcharts()
      .then(() => {
        const isDarkMode = document.body.classList.contains("dark-mode");
        setHighchartsTheme(isDarkMode);
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
            TimeStudy.toConsole("Invalid task array for operation", j, debuggin);
          }
        }
        TimeStudy.toConsole("Generated series", JSON.stringify(series), debuggin);
        TimeStudy.toConsole("xAxis categories", JSON.stringify(opNames), debuggin);
        Highcharts.chart(TimeStudy.DOM.chartContainer, {
          chart: { type: "column" },
          accessibility: { enabled: false },
          title: { text: "Operation Task Durations by Status" },
          xAxis: { categories: opNames },
          yAxis: {
            title: {
              text: `Duration (${
                durationMode === "hhmmssms" ? "MM:SS:MS" : durationMode === "ms" ? "Milliseconds" : "Minutes"
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

        TimeStudy.DOM.pieChartContainer.innerHTML = "";
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
                TimeStudy.toConsole("Invalid task data at", `Operation ${i}, Task ${j}`, debuggin);
              }
            }
          } else {
            TimeStudy.toConsole("No tasks for operation", opNames[i], debuggin);
            continue;
          }
          TimeStudy.toConsole(
            "Pie chart data for operation",
            `${opNames[i]}: VA=${statusDurations.VA}, NVA=${statusDurations.NVA}, W=${statusDurations.W}`,
            debuggin
          );
          const pieData = [
            { name: "VA", y: statusDurations.VA, color: "#00FF00" },
            { name: "NVA", y: statusDurations.NVA, color: "#FFFF00" },
            { name: "W", y: statusDurations.W, color: "#FF0000" },
          ].filter(item => item.y > 0);
          if (pieData.length === 0) {
            TimeStudy.toConsole("No valid pie chart data for operation", opNames[i], debuggin);
            continue;
          }
          const pieDiv = document.createElement("div");
          pieDiv.id = `pieChart${i}`;
          pieDiv.className = "pieChart";
          TimeStudy.DOM.pieChartContainer.appendChild(pieDiv);
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
      })
      .catch(error => {
        TimeStudy.toConsole("drawTable error", error.message, debuggin);
        alert("Failed to load Highcharts for chart rendering. Please check the console for details.");
      });
  } catch (error) {
    TimeStudy.toConsole("drawTable error", error.message, debuggin);
    alert("Failed to render charts. Please check the console for details.");
  }
};

// Autosave logic to be added here

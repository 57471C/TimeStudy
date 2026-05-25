let player;
let loadVideoButton;
let addTaskButton;
let addOpButton;
let toggleFormatButton;
let csvExportButton;
let projectExportButton;
let projectSaveAsButton;
let projectImportButton;
let newProjectButton;
let speedSlider;
let seekBar;
let playPauseButton;
let jumpToStartButton;
let rewind5sButton;
let rewind1sButton;
let forward1sButton;
let forward5sButton;
let muteButton;
let volumeSlider;

const debuggin = 1;
let opCount = 0;
let firstOp = true;
let taskCount = 0;
let videoFileName = "";
let videoFilePath = "";
let projectName = "";
let projectComments = "";
let masterParts = [];
let masterLabour = [];
let projectFilePath = "";
let trials = [];
let activeTrialIndex = 0;
const videoBlobCache = {};
let yama = [];
let opNames = [];
let opStartTimes = [];
let opPartTags = [];
let taktTime = 60000;
let durationMode = "hhmmssms";
let playerReady = false;
let zoomLevel = 1;
let translateX = 0;
let translateY = 0;
let processEndTime = 0;
let chartMode = "column";
let hourlyRate = 0;
let shiftLength = 480;
let targetEfficiency = 100;
let unitsPerCycle = 1;
let playbackSpeed = 1;
let volumeLevel = 1;

const APP_VERSION = "0.4.6";

let isDrawing = false;
let startX;
let startY;
let marqueeOverlay;
let marqueeRect;

let currentStatusEdit = null;

const openStatusModal = (e, opIndex, taskIndex) => {
  currentStatusEdit = { opIndex, taskIndex };
  const dialog = DOM.statusModal;

  dialog.style.inset = "auto";
  dialog.style.margin = "0";
  dialog.showModal();

  const rect = dialog.getBoundingClientRect();
  let top = e.clientY + 5;
  let left = e.clientX + 5;

  if (left + rect.width > window.innerWidth) left = window.innerWidth - rect.width - 5;
  if (top + rect.height > window.innerHeight) top = window.innerHeight - rect.height - 5;

  dialog.style.left = `${left}px`;
  dialog.style.top = `${top}px`;
};

const openTagModal = async (type, opIndex, taskIndex) => {
  let title = "Assign Tag";
  let message = "Select or type a new tag:";
  let suggestions = [];

  if (type.includes("part")) {
    title = "Assign Part Number";
    message = "Select a Part Number or enter a new one (Format: [number] - [desc]):";
    suggestions = masterParts;
  } else if (type.includes("labour")) {
    title = "Assign Labour Code";
    message = "Select a Labour Code or enter a new one (Format: [code] - [desc]):";
    suggestions = masterLabour;
  }

  const result = await asyncPrompt(message, "", title, suggestions);

  if (result && result.trim() !== "") {
    const newTag = result.trim();
    let addedNewMaster = false;

    if (type.includes("part")) {
      if (!masterParts.includes(newTag)) {
        masterParts.push(newTag);
        addedNewMaster = true;
      }
      if (type === "op-parts") {
        if (!opPartTags[opIndex].includes(newTag)) opPartTags[opIndex].push(newTag);
      } else if (type === "task-parts") {
        if (!yama[opIndex][taskIndex].partTags.includes(newTag)) yama[opIndex][taskIndex].partTags.push(newTag);
      }
    } else if (type.includes("labour")) {
      if (!masterLabour.includes(newTag)) {
        masterLabour.push(newTag);
        addedNewMaster = true;
      }
      if (type === "task-labour") {
        if (!yama[opIndex][taskIndex].labourTags.includes(newTag)) yama[opIndex][taskIndex].labourTags.push(newTag);
      }
    }

    if (addedNewMaster) {
      showToast("New tag added to Master Data.", "success");
    }

    saveLocalState();
    updateTaskList();
  }
};

const removeTag = (target, opIndex, taskIndex, tagType, tagIdx) => {
  if (target === "op") {
    opPartTags[opIndex].splice(tagIdx, 1);
  } else if (target === "task") {
    if (tagType === "part") {
      yama[opIndex][taskIndex].partTags.splice(tagIdx, 1);
    } else if (tagType === "labour") {
      yama[opIndex][taskIndex].labourTags.splice(tagIdx, 1);
    }
  }
  saveLocalState();
  updateTaskList();
};

const deleteMasterDataTag = async (type, index) => {
  const arr = type === "part" ? masterParts : masterLabour;
  const title = type === "part" ? "Part Numbers" : "Labour Codes";
  const tag = arr[index];

  if (await asyncConfirm(`Are you sure you want to delete "${tag}" from the master list?`, "Delete Master Tag")) {
    arr.splice(index, 1);
    saveLocalState();
    showMasterDataModal(title, arr, type);
  }
};

const clearMasterData = async (type) => {
  const title = type === "part" ? "Part Numbers" : "Labour Codes";
  if (await asyncConfirm(`Are you sure you want to clear ALL ${title}? This action cannot be undone.`, "Clear All")) {
    if (type === "part") masterParts = [];
    else masterLabour = [];
    saveLocalState();
    showMasterDataModal(title, type === "part" ? masterParts : masterLabour, type);
  }
};

const showMasterDataModal = (title, dataArray, type) => {
  DOM.masterDataModalTitle.textContent = `${title} (${dataArray.length})`;
  DOM.masterDataList.innerHTML = dataArray.length
    ? dataArray
        .map(
          (item, idx) =>
            `<li class="px-4 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors flex justify-between items-center group"><span>${escapeHTML(item)}</span><button type="button" onclick="deleteMasterDataTag('${type}', ${idx})" class="text-zinc-400 hover:text-red-500 dark:hover:text-red-400 focus:outline-none transition-colors opacity-0 group-hover:opacity-100" title="Delete Tag"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg></button></li>`,
        )
        .join("")
    : `<li class="px-4 py-4 text-sm text-zinc-500 italic text-center">No data loaded.</li>`;

  DOM.clearMasterDataBtn.onclick = () => clearMasterData(type);
  DOM.clearMasterDataBtn.style.display = dataArray.length ? "inline-block" : "none";
  if (!DOM.masterDataModal.open) DOM.masterDataModal.showModal();
};

const openOpPartDropdown = (e, opIndex) => {
  e.stopPropagation();
  let dropdown = document.getElementById("op-part-dropdown");
  if (!dropdown) {
    dropdown = document.createElement("div");
    dropdown.id = "op-part-dropdown";
    dropdown.className =
      "absolute bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md shadow-lg z-50 flex flex-col w-96 max-h-64";
    document.body.appendChild(dropdown);

    document.addEventListener("click", (ev) => {
      if (dropdown && !dropdown.classList.contains("hidden") && !dropdown.contains(ev.target)) {
        dropdown.classList.add("hidden");
      }
    });
  }

  const rect = e.currentTarget.getBoundingClientRect();
  dropdown.style.left = `${rect.left + window.scrollX}px`;
  dropdown.style.top = `${rect.bottom + 4 + window.scrollY}px`;
  dropdown.classList.remove("hidden");

  const renderList = (filter = "") => {
    const currentParts = (opPartTags[opIndex] || []).map((t) => {
      const idx = t.indexOf(" x ");
      return idx !== -1 ? t.substring(idx + 3) : t;
    });
    const filtered = masterParts.filter(
      (p) => p.toLowerCase().includes(filter.toLowerCase()) && !currentParts.includes(p),
    );
    if (filtered.length === 0 && filter.trim() === "") {
      return `<li class="px-2 py-1 text-sm text-zinc-500 italic">No part numbers available. Type to add one.</li>`;
    }
    return filtered
      .map(
        (p) =>
          `<li class="px-2 py-1 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-700 cursor-pointer rounded truncate" data-part="${escapeHTML(p)}" title="${escapeHTML(p)}">${escapeHTML(p)}</li>`,
      )
      .join("");
  };

  dropdown.innerHTML = `
    <div class="p-2 border-b border-zinc-200 dark:border-zinc-700 flex gap-1.5">
      <input type="text" id="op-part-qty" class="form-control text-sm w-10 text-center" value="01" maxlength="4" title="Part Quantity" onfocus="this.select()">
      <input type="text" id="op-part-search" class="form-control text-sm flex-1" placeholder="Search or add new... (Enter)">
    </div>
    <ul id="op-part-list" class="overflow-y-auto flex-1 p-1 m-0 list-none space-y-0.5 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-300 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-600 [&::-webkit-scrollbar-thumb]:rounded-full">
      ${renderList()}
    </ul>
  `;

  const input = document.getElementById("op-part-search");
  const qtyInput = document.getElementById("op-part-qty");
  const list = document.getElementById("op-part-list");

  input.focus();

  const attachListEvents = () => {
    for (const li of list.querySelectorAll("li[data-part]")) {
      li.addEventListener("click", () => {
        addTag(li.getAttribute("data-part"));
      });
    }
  };

  const addTag = (newTag) => {
    if (!newTag) return;

    const qtyValue = qtyInput ? qtyInput.value.trim() : "01";
    const finalQty = qtyValue === "" ? "01" : qtyValue;

    let addedNewMaster = false;
    if (!masterParts.includes(newTag)) {
      masterParts.push(newTag);
      addedNewMaster = true;
    }
    if (!opPartTags[opIndex]) {
      opPartTags[opIndex] = [];
    }

    const displayTag = `${finalQty} x ${newTag}`;

    if (!opPartTags[opIndex].includes(displayTag)) {
      opPartTags[opIndex].push(displayTag);
    }
    if (addedNewMaster) {
      showToast("New part number added to Master Data.", "success");
    }
    saveLocalState();
    updateTaskList();

    input.value = "";
    if (qtyInput) qtyInput.value = "01";
    list.innerHTML = renderList("");
    attachListEvents();
    input.focus();
  };

  input.addEventListener("input", (ev) => {
    list.innerHTML = renderList(ev.target.value);
    attachListEvents();
  });

  input.addEventListener("keydown", (ev) => {
    if (ev.key === "Enter") {
      ev.preventDefault();
      addTag(input.value.trim());
    } else if (ev.key === "Escape") {
      dropdown.classList.add("hidden");
    }
  });

  qtyInput.addEventListener("keydown", (ev) => {
    if (ev.key === "Enter") {
      ev.preventDefault();
      addTag(input.value.trim());
    } else if (ev.key === "Escape") {
      dropdown.classList.add("hidden");
    }
  });

  attachListEvents();
};

const renderTags = (tags, type, target, opIndex, taskIndex = -1, size = "normal") => {
  if (!tags || tags.length === 0) return "";
  const typeClass = type === "part" ? "tag-pill-part" : "tag-pill-labour";

  let sizeClasses = "";
  if (size === "xs") {
    sizeClasses = "text-[10px] py-0.5 px-1.5 leading-none";
  }

  const icon =
    size === "xs"
      ? ""
      : type === "part"
        ? `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="opacity-70"><path d="M12.586 2.586a2 2 0 0 0-2.828 0L2.586 9.757a2 2 0 0 0 0 2.828l9.172 9.172a2 2 0 0 0 2.828 0l7.172-7.172a2 2 0 0 0 0-2.828L12.586 2.586z"/><circle cx="8.5" cy="8.5" r="1.5"/></svg>`
        : `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="opacity-70"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>`;

  return `<div class="tag-container ${size === "xs" ? "gap-1 mt-0" : ""}">
    ${tags.map((tag, idx) => `<span class="tag-pill ${typeClass} ${sizeClasses}">${icon ? `${icon} ` : ""}<span class="${size === "xs" ? "translate-y-[1px]" : ""}">${escapeHTML(tag)}</span><button type="button" onclick="removeTag('${target}', ${opIndex}, ${taskIndex}, '${type}', ${idx})" class="hover:text-red-500 dark:hover:text-red-400 font-bold ml-0.5 leading-none focus:outline-none transition-colors" title="Remove Tag">&times;</button></span>`).join("")}
  </div>`;
};

const DOM = {
  taskList: document.getElementById("taskList"),
  videoPlaceholder: document.getElementById("videoPlaceholder"),
  videoWrapper: document.getElementById("videoWrapper"),
  chartContainer: document.getElementById("chartContainer"),
  ganttChartContainer: document.getElementById("ganttChartContainer"),
  pieChartContainer: document.getElementById("pieChartContainer"),
  taskTableFoot: null, // Initialize as null, set dynamically in updateTaskList
  darkModeToggle: document.getElementById("darkModeToggle"),
  sunIcon: document.getElementById("sunIcon"),
  moonIcon: document.getElementById("moonIcon"),
  currentTime: document.getElementById("currentTime"),
  durationTime: document.getElementById("durationTime"),
  playIcon: document.getElementById("playIcon"),
  pauseIcon: document.getElementById("pauseIcon"),
  speedValue: document.getElementById("speedValue"),
  volumeOnIcon: document.getElementById("volumeOnIcon"),
  volumeOffIcon: document.getElementById("volumeOffIcon"),
  volumeValue: document.getElementById("volumeValue"),
  video: document.getElementById("my_video"),
  marqueeOverlay: document.getElementById("marqueeOverlay"),
  marqueeRect: document.getElementById("marqueeRect"),
  videoFileInput: document.getElementById("videoFileInput"),
  projectFileInput: document.getElementById("projectFileInput"),
  zoomIn: document.getElementById("zoomIn"),
  zoomOut: document.getElementById("zoomOut"),
  resetZoom: document.getElementById("resetZoom"),
  projectNameInput: document.getElementById("projectNameInput"),
  trialSelect: document.getElementById("trialSelect"),
  addTrialBtn: document.getElementById("addTrialBtn"),
  editTrialBtn: document.getElementById("editTrialBtn"),
  compareTrialsBtn: document.getElementById("compareTrialsBtn"),
  compareModal: document.getElementById("compareModal"),
  closeCompareBtn: document.getElementById("closeCompareBtn"),
  projectCommentsInput: document.getElementById("projectCommentsInput"),
  openSettingsBtn: document.getElementById("openSettingsBtn"),
  settingsBackdrop: document.getElementById("settingsBackdrop"),
  settingsPanel: document.getElementById("settingsPanel"),
  closeSettingsBtn: document.getElementById("closeSettingsBtn"),
  saveSettingsBtn: document.getElementById("saveSettingsBtn"),
  hourlyRateInput: document.getElementById("hourlyRateInput"),
  shiftLengthInput: document.getElementById("shiftLengthInput"),
  targetEfficiencyInput: document.getElementById("targetEfficiencyInput"),
  unitsPerCycleInput: document.getElementById("unitsPerCycleInput"),
  partsFileInput: document.getElementById("partsFileInput"),
  labourFileInput: document.getElementById("labourFileInput"),
  partsUploadBtn: document.getElementById("partsUploadBtn"),
  labourUploadBtn: document.getElementById("labourUploadBtn"),
  partsViewBtn: document.getElementById("partsViewBtn"),
  labourViewBtn: document.getElementById("labourViewBtn"),
  masterDataModal: document.getElementById("masterDataModal"),
  masterDataModalTitle: document.getElementById("masterDataModalTitle"),
  masterDataList: document.getElementById("masterDataList"),
  clearMasterDataBtn: document.getElementById("clearMasterDataBtn"),
  closeMasterDataBtn: document.getElementById("closeMasterDataBtn"),
  closeMasterDataBtnX: document.getElementById("closeMasterDataBtnX"),
  statusModal: document.getElementById("statusModal"),
};

const toggleChartMode = () => {
  chartMode = chartMode === "column" ? "gantt" : "column";
  updateTaskList();
  drawTable();
};

const setHighchartsTheme = (isDark) => {
  Highcharts.setOptions({
    chart: {
      backgroundColor: "transparent",
      style: { fontFamily: "'Inter', system-ui, sans-serif" },
    },
    title: { style: { color: isDark ? "#e4e4e7" : "#27272a" } },
    xAxis: {
      labels: { style: { color: isDark ? "#a1a1aa" : "#52525b" } },
      lineColor: isDark ? "#3f3f46" : "#e4e4e7",
      tickColor: isDark ? "#3f3f46" : "#e4e4e7",
    },
    yAxis: {
      labels: { style: { color: isDark ? "#a1a1aa" : "#52525b" } },
      title: { style: { color: isDark ? "#e4e4e7" : "#27272a" } },
      gridLineColor: isDark ? "#3f3f46" : "#e4e4e7",
    },
    tooltip: {
      backgroundColor: isDark ? "#27272a" : "#ffffff",
      borderColor: isDark ? "#3f3f46" : "#e4e4e7",
      style: { color: isDark ? "#e4e4e7" : "#27272a" },
    },
    plotOptions: {
      series: { dataLabels: { style: { color: isDark ? "#e4e4e7" : "#27272a" } } },
    },
    legend: {
      itemStyle: { color: isDark ? "#e4e4e7" : "#27272a" },
      itemHoverStyle: { color: isDark ? "#60a5fa" : "#0d6efd" },
    },
  });
  toConsole("Highcharts theme set", isDark ? "Dark" : "Light", debuggin);
};

const saveLocalState = () => {
  if (!trials[activeTrialIndex]) {
    trials[activeTrialIndex] = {
      trialId: activeTrialIndex + 1,
      trialName: `Trial ${activeTrialIndex + 1}`,
      costingConfig: {},
      appState: {},
    };
  }

  // Sync active global variables to the current trial object
  trials[activeTrialIndex].videoFileName = videoFileName;
  trials[activeTrialIndex].videoFilePath = videoFilePath;
  trials[activeTrialIndex].processEndTime = processEndTime;
  trials[activeTrialIndex].taktTime = taktTime;
  trials[activeTrialIndex].costingConfig = { hourlyRate, shiftLength, targetEfficiency, unitsPerCycle };
  trials[activeTrialIndex].appState = { yama, opNames, opStartTimes, opCount, taskCount, firstOp };

  const state = {
    projectMeta: {
      projectName,
      projectComments,
      masterParts,
      masterLabour,
      lastSaved: new Date().toISOString(),
      appVersion: APP_VERSION,
    },
    appConfig: {
      playbackSpeed,
      volumeLevel,
    },
    trials,
    activeTrialIndex,
  };

  localStorage.setItem("timeStudyData", JSON.stringify(state));
};

const renderTrialSelect = () => {
  if (!DOM.trialSelect) return;
  DOM.trialSelect.innerHTML = "";
  trials.forEach((trial, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = trial.trialName;
    option.className = "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white";
    if (index === activeTrialIndex) {
      option.selected = true;
    }
    DOM.trialSelect.appendChild(option);
  });
};

const switchTrial = async (index) => {
  if (index === activeTrialIndex) return;

  saveLocalState();

  activeTrialIndex = index;
  const currentTrial = trials[activeTrialIndex];

  videoFileName = currentTrial.videoFileName || "";
  videoFilePath = currentTrial.videoFilePath || "";
  processEndTime = currentTrial.processEndTime || 0;
  taktTime = currentTrial.taktTime || 60000;
  hourlyRate = currentTrial.costingConfig?.hourlyRate || 0;
  shiftLength = currentTrial.costingConfig?.shiftLength || 480;
  targetEfficiency = currentTrial.costingConfig?.targetEfficiency || 100;
  unitsPerCycle = currentTrial.costingConfig?.unitsPerCycle || 1;
  yama = currentTrial.appState?.yama || [];
  opNames = currentTrial.appState?.opNames || [];
  opStartTimes = currentTrial.appState?.opStartTimes || [];
  opPartTags = currentTrial.appState?.opPartTags || [];
  opCount = currentTrial.appState?.opCount !== undefined ? currentTrial.appState.opCount : 0;
  taskCount = currentTrial.appState?.taskCount !== undefined ? currentTrial.appState.taskCount : 0;
  firstOp = currentTrial.appState?.firstOp !== undefined ? currentTrial.appState.firstOp : true;

  renderTrialSelect();
  updateTaskList();
  drawTable();

  player.pause();
  const isTauri = window.__TAURI__ !== undefined;

  if (isTauri && videoFilePath) {
    const tauriAssetUrl = window.__TAURI__.core.convertFileSrc(videoFilePath);
    player.src = tauriAssetUrl;
    player.preload = "auto";
    toggleVideoPlaceholder(false);
  } else if (videoFileName && videoBlobCache[videoFileName]) {
    player.src = videoBlobCache[videoFileName];
    player.preload = "metadata";
    toggleVideoPlaceholder(false);
  } else {
    player.removeAttribute("src");
    DOM.videoPlaceholder.textContent = videoFileName
      ? `Trial switched. Click here to locate video: ${videoFileName}`
      : "Load a video to get started";
    toggleVideoPlaceholder(true);
  }
  updateLoadButtonColor();

  if (!DOM.settingsPanel.classList.contains("translate-x-full")) {
    toggleSettings(true);
  }

  showToast(`Switched to: ${currentTrial.trialName}`, "success");
};

const addTrial = async () => {
  const trialName = await asyncPrompt("Enter a name for the new trial:", `Trial ${trials.length + 1}`, "New Trial");
  if (!trialName) return;
  const duplicate = await asyncConfirm(
    "Would you like to duplicate the current trial's tasks and video? (Click 'Cancel' to create a blank trial)",
    "Duplicate Data?",
  );

  saveLocalState();
  const newTrialId = trials.length > 0 ? Math.max(...trials.map((t) => t.trialId)) + 1 : 1;

  const newTrial = duplicate
    ? { ...JSON.parse(JSON.stringify(trials[activeTrialIndex])), trialId: newTrialId, trialName }
    : {
        trialId: newTrialId,
        trialName,
        videoFileName: "",
        videoFilePath: "",
        processEndTime: 0,
        taktTime,
        costingConfig: { hourlyRate, shiftLength, targetEfficiency },
        appState: { yama: [], opNames: [], opStartTimes: [], opPartTags: [], opCount: 0, taskCount: 0, firstOp: true },
      };

  trials.push(newTrial);
  await switchTrial(trials.length - 1);
};

const editTrial = async () => {
  const currentName = trials[activeTrialIndex].trialName;
  const newName = await asyncPrompt("Rename Trial:", currentName, "Edit Trial Name");
  if (!newName || newName.trim() === "") return;

  trials[activeTrialIndex].trialName = newName.trim();
  saveLocalState();
  renderTrialSelect();
  showToast("Trial renamed successfully.", "success");
};

const openCompareDashboard = () => {
  saveLocalState();

  const categories = [];
  const vaData = [];
  const nvaData = [];
  const wData = [];
  const unitsData = [];
  const costData = [];

  for (const trial of trials) {
    categories.push(trial.trialName);

    let va = 0;
    let nva = 0;
    let w = 0;
    const yamaData = trial.appState.yama || [];
    for (const op of yamaData) {
      if (Array.isArray(op)) {
        for (const task of op) {
          const height = task.taskHeight || 0;
          if (task.taskStatus === "VA") va += height;
          else if (task.taskStatus === "NVA") nva += height;
          else if (task.taskStatus === "W") w += height;
        }
      }
    }

    vaData.push(va);
    nvaData.push(nva);
    wData.push(w);

    const totalMs = va + nva + w;

    // Calculate Units per Shift (Shift Length * Efficiency / Total Task Time)
    const shiftMs = (trial.costingConfig?.shiftLength || 480) * 60 * 1000;
    const efficiency = (trial.costingConfig?.targetEfficiency || 100) / 100;
    const effectiveMs = shiftMs * efficiency;

    const cycleUnits = trial.costingConfig?.unitsPerCycle || 1;
    const units = totalMs > 0 ? Math.floor((effectiveMs / totalMs) * cycleUnits) : 0;
    unitsData.push(units);

    const rate = trial.costingConfig?.hourlyRate || 0;
    // Cost = (Total time in hours) * Hourly Rate
    const cycleCost = (totalMs / 3600000) * rate;
    const costPerUnit = cycleCost / cycleUnits;
    costData.push(costPerUnit);
  }

  DOM.compareModal.showModal();

  const isDark = document.documentElement.classList.contains("dark");
  setHighchartsTheme(isDark);

  const formatVal = (val) => {
    if (durationMode === "hhmmssms") return formatDuration(val);
    if (durationMode === "ms") return `${val.toFixed(0)} ms`;
    return `${formatDecimalMinutes(val)} min`;
  };

  // Render charts *after* modal is shown so Highcharts can calculate width properly
  setTimeout(() => {
    Highcharts.chart("compareVaNvaChart", {
      chart: { type: "column" },
      title: { text: "Value Analysis Breakdown" },
      xAxis: { categories },
      yAxis: {
        title: { text: "Time" },
        labels: {
          formatter: function () {
            return formatVal(this.value);
          },
        },
        stackLabels: {
          enabled: true,
          formatter: function () {
            return formatVal(this.total);
          },
          style: { color: isDark ? "#e4e4e7" : "#27272a", textOutline: "none", fontWeight: "bold" },
        },
        plotLines: [
          {
            value: taktTime,
            color: "#0000FF",
            width: 2,
            zIndex: 5,
            label: { text: `Takt: ${formatVal(taktTime)}`, align: "right", style: { color: "#0000FF" } },
          },
        ],
      },
      tooltip: {
        formatter: function () {
          return `<b>${this.series.name}</b>: ${formatVal(this.y)}<br/><b>Total Time</b>: ${formatVal(this.point.stackTotal)}`;
        },
      },
      plotOptions: { column: { stacking: "normal" } },
      series: [
        { name: "Value-Add (VA)", data: vaData, color: "#10b981" },
        { name: "Non-Value-Add (NVA)", data: nvaData, color: "#f59e0b" },
        { name: "Waste (W)", data: wData, color: "#f43f5e" },
      ],
    });

    Highcharts.chart("compareUnitsChart", {
      chart: { type: "column" },
      title: { text: "Estimated Units per Shift" },
      xAxis: { categories },
      yAxis: {
        title: { text: "Units" },
      },
      tooltip: {
        formatter: function () {
          return `<b>Est. Capacity</b>: ${this.y} units`;
        },
      },
      plotOptions: { column: { dataLabels: { enabled: true } } },
      series: [{ name: "Units", data: unitsData, color: "#3b82f6", showInLegend: false }],
    });

    Highcharts.chart("compareCostChart", {
      chart: { type: "column" },
      title: { text: "Estimated Labor Cost per Unit" },
      xAxis: { categories },
      yAxis: { title: { text: "Cost ($)" }, labels: { format: "${value:.4f}" } },
      tooltip: { pointFormat: "<b>${point.y:.4f}</b>" },
      plotOptions: { column: { dataLabels: { enabled: true, format: "${y:.4f}" } } },
      series: [{ name: "Cost", data: costData, color: "#8b5cf6", showInLegend: false }],
    });
  }, 10);
};

const loadLocalState = () => {
  projectFilePath = localStorage.getItem("projectFilePath") || "";
  const data = localStorage.getItem("timeStudyData");
  if (data) {
    try {
      const state = JSON.parse(data);

      // Backward Compatibility & Migration for old flat save states
      if (!state.trials) {
        trials = [
          {
            trialId: 1,
            trialName: "Current State",
            videoFileName: state.videoFileName || "",
            videoFilePath: state.videoFilePath || "",
            processEndTime: state.processEndTime || 0,
            taktTime: state.taktTime || 60000,
            costingConfig: {
              hourlyRate: state.hourlyRate || 0,
              shiftLength: state.shiftLength || 480,
              targetEfficiency: state.targetEfficiency || 100,
              unitsPerCycle: state.unitsPerCycle || 1,
            },
            appState: {
              yama: state.yama || [],
              opNames: state.opNames || [],
              opStartTimes: state.opStartTimes || [],
              opPartTags: state.opPartTags || [],
              opCount: state.opCount !== undefined ? state.opCount : 0,
              taskCount: state.taskCount !== undefined ? state.taskCount : 0,
              firstOp: state.firstOp !== undefined ? state.firstOp : true,
            },
          },
        ];
        activeTrialIndex = 0;
        projectName = state.projectName || "";
        projectComments = "";
        masterParts = state.masterParts || [];
        masterLabour = state.masterLabour || [];
        playbackSpeed = state.playbackSpeed !== undefined ? state.playbackSpeed : 1;
        volumeLevel = state.volumeLevel !== undefined ? state.volumeLevel : 1;
      } else {
        // Load new Multi-Trial format
        trials = state.trials || [];
        activeTrialIndex = state.activeTrialIndex || 0;
        projectName = state.projectMeta?.projectName || "";
        projectComments = state.projectMeta?.projectComments || "";
        masterParts = state.projectMeta?.masterParts || [];
        masterLabour = state.projectMeta?.masterLabour || [];
        playbackSpeed = state.appConfig?.playbackSpeed !== undefined ? state.appConfig.playbackSpeed : 1;
        volumeLevel = state.appConfig?.volumeLevel !== undefined ? state.appConfig.volumeLevel : 1;
      }

      // Hydrate memory with the active trial data
      const currentTrial = trials[activeTrialIndex] || trials[0];
      videoFileName = currentTrial.videoFileName || "";
      videoFilePath = currentTrial.videoFilePath || "";
      processEndTime = currentTrial.processEndTime || 0;
      taktTime = currentTrial.taktTime || 60000;

      hourlyRate = currentTrial.costingConfig?.hourlyRate || 0;
      shiftLength = currentTrial.costingConfig?.shiftLength || 480;
      if (shiftLength <= 24) shiftLength *= 60; // Auto-migrate old hours format
      targetEfficiency = currentTrial.costingConfig?.targetEfficiency || 100;
      unitsPerCycle = currentTrial.costingConfig?.unitsPerCycle || 1;

      yama = currentTrial.appState?.yama || [];
      opNames = currentTrial.appState?.opNames || [];
      opStartTimes = currentTrial.appState?.opStartTimes || [];
      opPartTags = currentTrial.appState?.opPartTags || [];
      opCount = currentTrial.appState?.opCount !== undefined ? currentTrial.appState.opCount : 0;
      taskCount = currentTrial.appState?.taskCount !== undefined ? currentTrial.appState.taskCount : 0;
      firstOp = currentTrial.appState?.firstOp !== undefined ? currentTrial.appState.firstOp : true;

      // Sync UI
      if (DOM.projectNameInput) DOM.projectNameInput.value = projectName;
      renderTrialSelect();

      toConsole("Local state loaded", "Success", debuggin);
      showToast("Local session state restored.", "success");
    } catch (e) {
      toConsole("Error parsing local state", e, debuggin);
    }
  } else {
    // Initialize a blank trial if no prior state exists
    trials = [
      {
        trialId: 1,
        trialName: "Current State",
        videoFileName: "",
        videoFilePath: "",
        processEndTime: 0,
        taktTime: 60000,
        costingConfig: { hourlyRate: 0, shiftLength: 480, targetEfficiency: 100, unitsPerCycle: 1 },
        appState: { yama: [], opNames: [], opStartTimes: [], opPartTags: [], opCount: 0, taskCount: 0, firstOp: true },
      },
    ];
    activeTrialIndex = 0;
    projectComments = "";
  }
};

const processNewVideoFile = async (fileOrPath, isTauriPath = false) => {
  if (player.src && yama.length > 0) {
    const save = await asyncConfirm(
      "You have unsaved data. Would you like to save your data as a CSV file before loading a new video?",
      "Unsaved Data",
    );
    if (save) {
      exportToCSV();
      toConsole("Data exported to CSV before loading new video", null, debuggin);
    }
    const proceed = await asyncConfirm(
      "Loading a new video will clear all existing data and charts. Are you sure you want to proceed?",
      "Load New Video",
    );
    if (!proceed) {
      toConsole("User cancelled loading new video", null, debuggin);
      return;
    }
  }

  const isRelinking = !player.src && yama.length > 0;

  if (isTauriPath) {
    const filePath = fileOrPath;
    videoFileName = filePath.split(/[/\\]/).pop();
    videoFilePath = filePath;

    const tauriAssetUrl = window.__TAURI__.core.convertFileSrc(videoFilePath);
    player.src = tauriAssetUrl;
    player.preload = "auto";
  } else {
    const file = fileOrPath;
    videoFileName = file.name;
    videoFilePath = file.path || ""; // Tauri injects the absolute path here

    const isTauri = window.__TAURI__ !== undefined;
    if (isTauri && videoFilePath) {
      const tauriAssetUrl = window.__TAURI__.core.convertFileSrc(videoFilePath);
      player.src = tauriAssetUrl;
      player.preload = "auto";
    } else {
      const fileURL = URL.createObjectURL(file);
      videoBlobCache[videoFileName] = fileURL;
      player.src = fileURL;
      player.preload = "metadata";
    }
  }

  player.load();

  if (!isRelinking) {
    yama = [];
    opNames = [];
    opStartTimes = [];
    opPartTags = [];
    opCount = 0;
    taskCount = 0;
    firstOp = true;
    projectName = "";
    if (DOM.projectNameInput) {
      DOM.projectNameInput.value = "";
    }
    DOM.taskList.innerHTML = "";
    DOM.pieChartContainer.innerHTML = "";
    DOM.chartContainer.innerHTML = "";
    DOM.ganttChartContainer.innerHTML = "";
    updateTaskList();
    addTaskButton.disabled = true;
    toConsole("Cleared all previous data and charts", null, debuggin);
  } else {
    toConsole("Re-linked video to existing project", videoFileName, debuggin);
  }

  DOM.videoPlaceholder.textContent = "Load a video to get started";
  saveLocalState();

  updateLoadButtonColor();
};

const initializePlayer = () => {
  player = DOM.video;
  playerReady = true;
  toConsole("Video element initialized", "Success", debuggin);
  toConsole("App Version", APP_VERSION, debuggin);

  marqueeOverlay = DOM.marqueeOverlay;
  marqueeRect = DOM.marqueeRect;

  const isDarkMode = localStorage.getItem("darkMode") === "true";
  if (typeof Highcharts !== "undefined") {
    setHighchartsTheme(isDarkMode);
  }
  if (isDarkMode) {
    document.documentElement.classList.add("dark");
    DOM.sunIcon.classList.add("hidden");
    DOM.moonIcon.classList.remove("hidden");
  } else {
    document.documentElement.classList.remove("dark");
    DOM.sunIcon.classList.remove("hidden");
    DOM.moonIcon.classList.add("hidden");
  }

  DOM.darkModeToggle.addEventListener("click", () => {
    document.documentElement.classList.toggle("dark");
    const isDark = document.documentElement.classList.contains("dark");
    DOM.sunIcon.classList.toggle("hidden", isDark);
    DOM.moonIcon.classList.toggle("hidden", !isDark);
    localStorage.setItem("darkMode", isDark);
    toConsole("Dark mode toggled", isDark ? "On" : "Off", debuggin);
    if (typeof Highcharts !== "undefined") {
      setHighchartsTheme(isDark);
    }
    updateTaskList();
    if (yama.length > 0) {
      drawTable();
    }
  });

  if (DOM.trialSelect) {
    DOM.trialSelect.addEventListener("change", (e) => {
      switchTrial(Number.parseInt(e.target.value, 10));
    });
  }
  if (DOM.addTrialBtn) {
    DOM.addTrialBtn.addEventListener("click", addTrial);
  }
  if (DOM.editTrialBtn) {
    DOM.editTrialBtn.addEventListener("click", editTrial);
  }
  if (DOM.compareTrialsBtn) {
    DOM.compareTrialsBtn.addEventListener("click", openCompareDashboard);
  }
  if (DOM.closeCompareBtn) {
    DOM.closeCompareBtn.addEventListener("click", () => DOM.compareModal.close());
  }
  if (DOM.projectNameInput) {
    DOM.projectNameInput.addEventListener("blur", (e) => {
      e.target.value = sanitizeFilename(e.target.value);
      projectName = e.target.value;
      saveLocalState();
    });
    DOM.projectNameInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.target.blur();
      }
    });
  }

  // Settings Panel Logic
  if (DOM.openSettingsBtn) {
    const saveSettingsData = () => {
      hourlyRate = Number.parseFloat(DOM.hourlyRateInput.value) || 0;
      shiftLength = Number.parseFloat(DOM.shiftLengthInput.value) || 480;
      targetEfficiency = Number.parseFloat(DOM.targetEfficiencyInput.value) || 100;
      unitsPerCycle = Number.parseFloat(DOM.unitsPerCycleInput.value) || 1;
      if (DOM.projectCommentsInput) projectComments = DOM.projectCommentsInput.value;
      saveLocalState();
    };

    DOM.openSettingsBtn.addEventListener("click", () => toggleSettings(true));

    DOM.closeSettingsBtn.addEventListener("click", () => {
      saveSettingsData();
      toggleSettings(false);
    });

    DOM.settingsBackdrop.addEventListener("click", () => {
      saveSettingsData();
      toggleSettings(false);
    });

    DOM.saveSettingsBtn.addEventListener("click", () => {
      saveSettingsData();
      toggleSettings(false);
      showToast("Project variables saved successfully.", "success");
    });

    // Basic CSV parser for 2 columns: [ID], [Description]
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

    DOM.partsUploadBtn.addEventListener("click", () => DOM.partsFileInput.click());
    DOM.partsFileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        masterParts = parseTwoColumnCSV(evt.target.result);
        showToast(`Loaded ${masterParts.length} Part Numbers`, "success");
        saveLocalState();
      };
      reader.readAsText(file);
    });

    DOM.labourUploadBtn.addEventListener("click", () => DOM.labourFileInput.click());
    DOM.labourFileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        masterLabour = parseTwoColumnCSV(evt.target.result);
        showToast(`Loaded ${masterLabour.length} Labour Codes`, "success");
        saveLocalState();
      };
      reader.readAsText(file);
    });

    DOM.partsViewBtn.addEventListener("click", () => showMasterDataModal("Part Numbers", masterParts, "part"));
    DOM.labourViewBtn.addEventListener("click", () => showMasterDataModal("Labour Codes", masterLabour, "labour"));
    const closeMasterModal = () => DOM.masterDataModal.close();
    DOM.closeMasterDataBtnX.addEventListener("click", closeMasterModal);
    DOM.closeMasterDataBtn.addEventListener("click", closeMasterModal);
  }

  if (DOM.statusModal) {
    for (const btn of DOM.statusModal.querySelectorAll(".status-btn")) {
      btn.addEventListener("click", (e) => {
        if (currentStatusEdit) {
          handleInlineStatusEdit(
            currentStatusEdit.opIndex,
            currentStatusEdit.taskIndex,
            e.target.getAttribute("data-status"),
          );
        }
        DOM.statusModal.close();
        currentStatusEdit = null;
      });
    }
    DOM.statusModal.addEventListener("click", (e) => {
      if (e.target === DOM.statusModal) {
        DOM.statusModal.close();
        currentStatusEdit = null;
      }
    });
  }

  player.addEventListener("timeupdate", seektimeupdate);
  player.addEventListener("loadedmetadata", () => {
    const duration = player.duration;
    seekBar.max = duration;
    if (duration > 0) {
      let tickSeconds = 60;
      if (duration <= 15)
        tickSeconds = 2; // e.g. 10s video = 5 ticks
      else if (duration <= 30)
        tickSeconds = 5; // e.g. 25s video = 5 ticks
      else if (duration <= 60)
        tickSeconds = 10; // e.g. 50s video = 5 ticks
      else if (duration <= 180)
        tickSeconds = 30; // e.g. 2m video = 4 ticks
      else if (duration <= 300)
        tickSeconds = 60; // e.g. 4m video = 4 ticks
      else if (duration <= 600)
        tickSeconds = 120; // e.g. 8m video = 4 ticks
      else if (duration <= 1800)
        tickSeconds = 300; // e.g. 25m video = 5 ticks
      else tickSeconds = 600; // 10m intervals for anything longer

      const tickInterval = (tickSeconds / duration) * 100;
      seekBar.style.setProperty("--tick-interval", `${tickInterval}%`);
    }
    processEndTime = duration;
    if (duration > 0 && duration < 60 && yama.length === 0) {
      taktTime = Math.max(1000, Math.round(duration * 0.9) * 1000);
      saveLocalState();
      toConsole("Takt time auto-adjusted for short video", taktTime, debuggin);
    }
    updateTimeDisplay(duration, "durationTime");
    positionControls();
    updateLoadButtonColor();
    toggleVideoPlaceholder(false);
    updateProcessTimes();

    player.playbackRate = playbackSpeed;
    speedSlider.value = playbackSpeed;
    DOM.speedValue.textContent = `${playbackSpeed.toFixed(1)}x`;
    toConsole("Playback speed restored", playbackSpeed, debuggin);

    player.volume = volumeLevel;
    player.muted = true;
    DOM.volumeOnIcon.classList.add("hidden");
    DOM.volumeOffIcon.classList.remove("hidden");
    volumeSlider.value = 0;
    DOM.volumeValue.textContent = "0";
    toConsole("Video muted on load", "Success", debuggin);
  });
  player.addEventListener("play", () => {
    DOM.playIcon.classList.add("hidden");
    DOM.pauseIcon.classList.remove("hidden");
  });
  player.addEventListener("pause", () => {
    DOM.playIcon.classList.remove("hidden");
    DOM.pauseIcon.classList.add("hidden");
  });
  player.addEventListener("error", () => {
    toConsole("Video load error", "Failed to load video from URL", debuggin);
    alert(
      "Failed to load the video from the provided URL. Please use the 'Load' button to select a video file manually.",
    );
    toggleVideoPlaceholder(true);
    updateLoadButtonColor();
  });

  addTaskButton = document.getElementById("addTaskButton");
  addOpButton = document.getElementById("addOpButton");
  csvExportButton = document.getElementById("csvExportButton");
  projectExportButton = document.getElementById("projectExportButton");
  projectSaveAsButton = document.getElementById("projectSaveAsButton");
  projectImportButton = document.getElementById("projectImportButton");
  newProjectButton = document.getElementById("newProjectButton");
  loadVideoButton = document.getElementById("loadVideoButton");
  toggleFormatButton = document.getElementById("toggleFormatButton");
  speedSlider = document.getElementById("speedSlider");
  seekBar = document.getElementById("seekBar");
  playPauseButton = document.getElementById("playPauseButton");
  jumpToStartButton = document.getElementById("jumpToStartButton");
  rewind5sButton = document.getElementById("rewind5sButton");
  rewind1sButton = document.getElementById("rewind1sButton");
  forward1sButton = document.getElementById("forward1sButton");
  forward5sButton = document.getElementById("forward5sButton");
  muteButton = document.getElementById("muteButton");
  volumeSlider = document.getElementById("volumeSlider");

  loadLocalState();
  if (!taktTime) {
    taktTime = 60000;
  }
  if (yama.length > 0) {
    updateTaskList();
    drawTable();
  }

  const urlParams = new URLSearchParams(window.location.search);
  const videoUrl = urlParams.get("v");
  if (videoUrl) {
    toConsole("Found video URL in GET parameter", videoUrl, debuggin);
    videoFileName = videoUrl.split("/").pop().split("?")[0] || videoUrl;
    player.src = videoUrl;
    player.load();
    saveLocalState();
  }

  addTaskButton.addEventListener("click", addTask, false);
  addOpButton.addEventListener("click", addOp, false);
  csvExportButton.addEventListener("click", exportToCSV, false);
  projectExportButton.addEventListener("click", () => exportToJSON(false), false);
  if (projectSaveAsButton) {
    projectSaveAsButton.addEventListener("click", () => exportToJSON(true), false);
  }

  projectImportButton.addEventListener("click", async () => {
    const isTauri = window.__TAURI__ !== undefined;
    if (isTauri && window.__TAURI__.dialog && window.__TAURI__.fs) {
      try {
        const selected = await window.__TAURI__.dialog.open({
          multiple: false,
          filters: [{ name: "JSON", extensions: ["json"] }],
        });
        if (selected) {
          projectFilePath = selected;
          localStorage.setItem("projectFilePath", projectFilePath);
          const contents = await window.__TAURI__.fs.readTextFile(selected);
          importFromJSON(contents);
        }
      } catch (e) {
        toConsole("Error loading project via Tauri", e, debuggin);
        showToast("Error loading project file.", "error");
      }
    } else {
      DOM.projectFileInput.click();
    }
  });

  newProjectButton.addEventListener("click", async () => {
    if (yama.length > 0 || player.src) {
      const proceed = await asyncConfirm(
        "Are you sure you want to start a new project? All unsaved data will be lost.",
        "New Project",
      );
      if (!proceed) return;
    }

    player.pause();
    player.removeAttribute("src");
    player.load();

    yama = [];
    videoFileName = "";
    videoFilePath = "";
    projectFilePath = "";
    localStorage.removeItem("projectFilePath");
    opNames = [];
    opStartTimes = [];
    opPartTags = [];
    opCount = 0;
    taskCount = 0;
    firstOp = true;
    projectName = "";
    projectComments = "";
    masterParts = [];
    masterLabour = [];
    processEndTime = 0;

    trials = [
      {
        trialId: 1,
        trialName: "Current State",
        videoFileName: "",
        videoFilePath: "",
        processEndTime: 0,
        taktTime: taktTime,
        costingConfig: { hourlyRate, shiftLength, targetEfficiency, unitsPerCycle },
        appState: { yama: [], opNames: [], opStartTimes: [], opPartTags: [], opCount: 0, taskCount: 0, firstOp: true },
      },
    ];
    activeTrialIndex = 0;
    renderTrialSelect();

    if (DOM.projectNameInput) DOM.projectNameInput.value = "";
    DOM.taskList.innerHTML = "";
    DOM.pieChartContainer.innerHTML = "";
    DOM.chartContainer.innerHTML = "";
    DOM.ganttChartContainer.innerHTML = "";

    DOM.videoPlaceholder.textContent = "Load a video to get started";
    toggleVideoPlaceholder(true);
    updateLoadButtonColor();
    updateTaskList();
    saveLocalState();

    showToast("New project started.", "success");
  });
  loadVideoButton.addEventListener("click", async () => {
    const isTauri = window.__TAURI__ !== undefined;
    if (isTauri && window.__TAURI__.dialog) {
      try {
        const selected = await window.__TAURI__.dialog.open({
          multiple: false,
          filters: [{ name: "Video", extensions: ["mp4", "webm", "ogg", "mov", "avi"] }],
        });
        if (selected) {
          await processNewVideoFile(selected, true);
        }
      } catch (e) {
        toConsole("Error opening video via Tauri", e, debuggin);
      }
    } else {
      DOM.videoFileInput.click();
    }
  });

  DOM.videoPlaceholder.addEventListener("click", async () => {
    const isTauri = window.__TAURI__ !== undefined;
    if (isTauri && window.__TAURI__.dialog) {
      try {
        const selected = await window.__TAURI__.dialog.open({
          multiple: false,
          filters: [{ name: "Video", extensions: ["mp4", "webm", "ogg", "mov", "avi"] }],
        });
        if (selected) {
          await processNewVideoFile(selected, true);
        }
      } catch (e) {
        toConsole("Error opening video via Tauri", e, debuggin);
      }
    } else {
      DOM.videoFileInput.click();
      toConsole("Video placeholder clicked", "Triggered Load Video", debuggin);
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
    toggleFormatButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> <span>Format (${
      durationMode === "hhmmssms" ? "HH:MM:SS.MS" : durationMode === "ms" ? "ms" : "min"
    })</span>`;
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

  jumpToStartButton.addEventListener("click", () => {
    player.currentTime = 0;
    toConsole("Jumped to Start", player.currentTime, debuggin);
  });

  rewind5sButton.addEventListener("click", () => {
    player.currentTime = Math.max(0, player.currentTime - 5);
    toConsole("Rewind 5s", player.currentTime, debuggin);
  });
  rewind1sButton.addEventListener("click", () => {
    player.currentTime = Math.max(0, player.currentTime - 1);
    toConsole("Rewind 1s", player.currentTime, debuggin);
  });
  forward1sButton.addEventListener("click", () => {
    player.currentTime = Math.min(player.duration, player.currentTime + 1);
    toConsole("Forward 1s", player.currentTime, debuggin);
  });
  forward5sButton.addEventListener("click", () => {
    player.currentTime = Math.min(player.duration, player.currentTime + 5);
    toConsole("Forward 5s", player.currentTime, debuggin);
  });

  // Help Modal Logic
  const helpModal = document.getElementById("helpModal");
  const openHelpBtn = document.getElementById("openHelpBtn");
  const closeHelpBtn = document.getElementById("closeHelpBtn");
  const closeHelpBtnX = document.getElementById("closeHelpBtnX");

  if (openHelpBtn) openHelpBtn.addEventListener("click", () => helpModal.showModal());
  const closeModal = () => helpModal.close();
  if (closeHelpBtn) closeHelpBtn.addEventListener("click", closeModal);
  if (closeHelpBtnX) closeHelpBtnX.addEventListener("click", closeModal);

  muteButton.addEventListener("click", () => {
    player.muted = !player.muted;
    DOM.volumeOnIcon.classList.toggle("hidden", player.muted);
    DOM.volumeOffIcon.classList.toggle("hidden", !player.muted);
    toConsole("Mute toggled", player.muted, debuggin);
    if (!player.muted && volumeLevel === 0) {
      volumeLevel = 1;
      player.volume = 1;
      saveLocalState();
    }
    volumeSlider.value = player.muted ? 0 : volumeLevel;
    DOM.volumeValue.textContent = player.muted ? "0" : Math.round(volumeLevel * 100);
  });

  volumeSlider.addEventListener(
    "input",
    debounce((event) => {
      const volume = Number.parseFloat(event.target.value);
      if (!Number.isNaN(volume)) {
        player.volume = volume;
        volumeLevel = volume;
        player.muted = volume === 0;
        DOM.volumeOnIcon.classList.toggle("hidden", player.muted);
        DOM.volumeOffIcon.classList.toggle("hidden", !player.muted);
        DOM.volumeValue.textContent = Math.round(volume * 100);
        toConsole("Volume adjusted", volume, debuggin);
        saveLocalState();
      }
    }, 100),
  );

  if (speedSlider) {
    speedSlider.addEventListener(
      "input",
      debounce((event) => {
        const speed = Number.parseFloat(event.target.value);
        if (!Number.isNaN(speed)) {
          player.playbackRate = speed;
          playbackSpeed = speed;
          DOM.speedValue.textContent = `${speed.toFixed(1)}x`;
          toConsole("Speed slider input event fired", speed, debuggin);
          saveLocalState();
        }
      }, 100),
    );

    speedSlider.value = playbackSpeed;
    DOM.speedValue.textContent = `${playbackSpeed.toFixed(1)}x`;
  }

  if (seekBar) {
    seekBar.addEventListener(
      "input",
      debounce((event) => {
        const time = Number.parseFloat(event.target.value);
        if (!Number.isNaN(time)) {
          player.currentTime = time;
          toConsole("Seek bar input event fired", time, debuggin);
          toConsole("Video seeked to", time, debuggin);
        }
      }, 100),
    );
  }

  DOM.videoFileInput.addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) {
      toConsole("No video file selected", null, debuggin);
      return;
    }
    await processNewVideoFile(file, false);
    event.target.value = ""; // Reset input so the same file can be loaded again if needed
  });

  DOM.projectFileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        importFromJSON(e.target.result);
      };
      reader.readAsText(file);
    }
    event.target.value = ""; // Reset input so the same file can be loaded again if needed
  });

  DOM.zoomIn.addEventListener("click", () => {
    zoomLevel += 0.1;
    updateZoom();
  });
  DOM.zoomOut.addEventListener("click", () => {
    zoomLevel = Math.max(0.1, zoomLevel - 0.1);
    updateZoom();
  });
  DOM.resetZoom.addEventListener("click", () => {
    zoomLevel = 1;
    translateX = 0;
    translateY = 0;
    updateZoom();
  });

  marqueeOverlay.addEventListener("mousedown", startMarquee);
  marqueeOverlay.addEventListener("mousemove", drawMarquee);
  marqueeOverlay.addEventListener("mouseup", endMarquee);

  document.addEventListener("keydown", (e) => {
    // Global shortcuts (can trigger anywhere)
    if (e.ctrlKey && e.key.toLowerCase() === "s") {
      e.preventDefault();
      if (e.shiftKey) {
        exportToJSON(true);
        toConsole("Shortcut triggered", "Save As", debuggin);
      } else {
        exportToJSON(false);
        toConsole("Shortcut triggered", "Save", debuggin);
      }
      return;
    }

    if (["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName)) return;

    switch (e.key) {
      case " ":
        e.preventDefault();
        if (!player.src) return;
        if (player.paused) {
          player.play();
        } else {
          player.pause();
        }
        break;
      case "ArrowLeft":
        e.preventDefault();
        if (!player.src) return;
        player.currentTime = Math.max(0, player.currentTime - 1);
        toConsole("Rewind 1s (Left Arrow)", player.currentTime, debuggin);
        break;
      case "ArrowDown":
        e.preventDefault();
        if (!player.src) return;
        player.currentTime = Math.max(0, player.currentTime - 5);
        toConsole("Rewind 5s (Down Arrow)", player.currentTime, debuggin);
        break;
      case "ArrowRight":
        e.preventDefault();
        if (!player.src) return;
        player.currentTime = Math.min(player.duration, player.currentTime + 1);
        toConsole("Forward 1s (Right Arrow)", player.currentTime, debuggin);
        break;
      case "ArrowUp":
        e.preventDefault();
        if (!player.src) return;
        player.currentTime = Math.min(player.duration, player.currentTime + 5);
        toConsole("Forward 5s (Up Arrow)", player.currentTime, debuggin);
        break;
      case "t":
        e.preventDefault();
        if (!player.src) return;
        if (!addTaskButton.disabled) addTask();
        break;
      case "o":
        e.preventDefault();
        if (!player.src) return;
        addOp();
        break;
      case "m":
        e.preventDefault();
        if (!player.src) return;
        player.muted = !player.muted;
        DOM.volumeOnIcon.classList.toggle("hidden", player.muted);
        DOM.volumeOffIcon.classList.toggle("hidden", !player.muted);
        toConsole("Mute toggled (M key)", player.muted, debuggin);
        if (!player.muted && volumeLevel === 0) {
          volumeLevel = 1;
          player.volume = 1;
          saveLocalState();
        }
        volumeSlider.value = player.muted ? 0 : volumeLevel;
        DOM.volumeValue.textContent = player.muted ? "0" : Math.round(volumeLevel * 100);
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
      case "`":
      case "1":
      case "2":
      case "3":
      case "4":
      case "5":
      case "6":
      case "7":
      case "8": {
        e.preventDefault();
        if (!player.src) return;
        const newSpeed = e.key === "`" ? 0.5 : Number.parseInt(e.key, 10);
        player.playbackRate = newSpeed;
        playbackSpeed = newSpeed;
        if (speedSlider) speedSlider.value = newSpeed;
        if (DOM.speedValue) DOM.speedValue.textContent = `${newSpeed.toFixed(1)}x`;
        toConsole("Playback speed shortcut", newSpeed, debuggin);
        saveLocalState();
        break;
      }
    }
  });

  window.addEventListener("beforeunload", (e) => {
    if (yama.length > 0 || player.src) {
      e.preventDefault();
      e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
      return e.returnValue;
    }
  });

  updateLoadButtonColor();
};

window.onload = () => {
  initializePlayer();
  toggleVideoPlaceholder(true);
};

const startMarquee = (e) => {
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
  toConsole("Marquee start", `(${startX}, ${startY})`, debuggin);
};

const drawMarquee = (e) => {
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

const endMarquee = (e) => {
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

  toConsole("Marquee end", `Box: (${x1}, ${y1}) to (${x2}, ${y2})`, debuggin);

  if (marqueeWidth < 10 || marqueeHeight < 10) {
    toConsole("Marquee too small, ignoring zoom", null, debuggin);
    return;
  }

  const videoWrapper = DOM.videoWrapper;
  const wrapperWidth = videoWrapper.clientWidth;
  const wrapperHeight = videoWrapper.clientHeight;

  const video = DOM.video;
  const videoRect = video.getBoundingClientRect();
  const wrapperRect = videoWrapper.getBoundingClientRect();
  const offsetX = videoRect.left - wrapperRect.left;
  const offsetY = videoRect.top - wrapperRect.top;
  const videoDisplayWidth = videoRect.width;
  const videoDisplayHeight = videoRect.height;
  toConsole(
    "Video display",
    `Width: ${videoDisplayWidth}, Height: ${videoDisplayHeight}, Offset: (${offsetX}, ${offsetY})`,
    debuggin,
  );

  const marqueeX1 = x1 - offsetX;
  const marqueeY1 = y1 - offsetY;
  const marqueeX2 = x2 - offsetX;
  const marqueeY2 = y2 - offsetY;

  const marqueeCenterX = (marqueeX1 + marqueeX2) / 2;
  const marqueeCenterY = (marqueeY1 + marqueeY2) / 2;
  toConsole("Marquee center (display)", `(${marqueeCenterX}, ${marqueeCenterY})`, debuggin);

  const zoomX = videoDisplayWidth / marqueeWidth;
  const zoomY = videoDisplayHeight / marqueeHeight;
  const newZoomLevel = Math.min(zoomX, zoomY);
  toConsole("New zoom level (relative)", newZoomLevel, debuggin);

  const previousZoomLevel = zoomLevel;
  zoomLevel *= newZoomLevel;
  toConsole("Cumulative zoom level", zoomLevel, debuggin);

  const videoCoordX = (marqueeCenterX - translateX * previousZoomLevel) / previousZoomLevel;
  const videoCoordY = (marqueeCenterY - translateY * previousZoomLevel) / previousZoomLevel;
  toConsole("Marquee center (video coords)", `(${videoCoordX}, ${videoCoordY})`, debuggin);

  const scaledVideoCoordX = videoCoordX * zoomLevel;
  const scaledVideoCoordY = videoCoordY * zoomLevel;
  toConsole("Scaled video coordinates", `(${scaledVideoCoordX}, ${scaledVideoCoordY})`, debuggin);

  translateX = (wrapperWidth / 2 - scaledVideoCoordX) / zoomLevel;
  translateY = (wrapperHeight / 2 - scaledVideoCoordY) / zoomLevel;
  toConsole("New translation", `(${translateX}, ${translateY})`, debuggin);

  const finalX = videoCoordX * zoomLevel + translateX * zoomLevel;
  const finalY = videoCoordY * zoomLevel + translateY * zoomLevel;
  toConsole("Final center position", `(${finalX}, ${finalY})`, debuggin);

  updateZoom();
};

const updateZoom = () => {
  const video = DOM.video;
  video.style.transform = `scale(${zoomLevel}) translate(${translateX}px, ${translateY}px)`;
  toConsole("Zoom updated", `Level: ${zoomLevel}, Translate: (${translateX}, ${translateY})`, debuggin);
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
  DOM[elementId].textContent = formatTimeToHHMMSSMS(seconds);
};

const positionControls = () => {
  const controlsBar = document.getElementById("video_controls_bar");
  if (controlsBar) {
    controlsBar.style.position = "relative";
    toConsole("Controls repositioned after video load", "Success", debuggin);
  }
};

const updateLoadButtonColor = () => {
  if (loadVideoButton && player && playPauseButton) {
    const src = player.src;
    if (!src) {
      loadVideoButton.classList.add("btn-icon-highlight");
      loadVideoButton.classList.remove("btn-icon");
      playPauseButton.disabled = true;
      jumpToStartButton.disabled = true;
      rewind5sButton.disabled = true;
      rewind1sButton.disabled = true;
      forward1sButton.disabled = true;
      forward5sButton.disabled = true;
      muteButton.disabled = true;
      volumeSlider.disabled = true;
    } else {
      loadVideoButton.classList.remove("btn-icon-highlight");
      loadVideoButton.classList.add("btn-icon");
      playPauseButton.disabled = false;
      jumpToStartButton.disabled = false;
      rewind5sButton.disabled = false;
      rewind1sButton.disabled = false;
      forward1sButton.disabled = false;
      forward5sButton.disabled = false;
      muteButton.disabled = false;
      volumeSlider.disabled = false;
    }
  }
};

const toggleVideoPlaceholder = (show) => {
  try {
    if (!DOM.videoPlaceholder || !DOM.videoWrapper) {
      throw new Error("Video placeholder or wrapper element not found");
    }
    if (show) {
      toConsole("Showing placeholder, hiding video wrapper", null, debuggin);
      DOM.videoPlaceholder.style.display = "flex";
      DOM.videoWrapper.style.display = "none";
    } else {
      toConsole("Hiding placeholder, showing video wrapper", null, debuggin);
      DOM.videoPlaceholder.style.display = "none";
      DOM.videoWrapper.style.display = "block";
    }
    saveLocalState();
  } catch (error) {
    toConsole("toggleVideoPlaceholder error", error.message, debuggin);
    alert("Failed to toggle video placeholder. Please check the console for details.");
  }
};

const toggleSettings = (show) => {
  if (!DOM.settingsPanel || !DOM.settingsBackdrop) return;
  if (show) {
    DOM.settingsBackdrop.classList.remove("hidden");
    requestAnimationFrame(() => {
      DOM.settingsBackdrop.classList.remove("opacity-0");
      DOM.settingsPanel.classList.remove("translate-x-full");
    });
    DOM.hourlyRateInput.value = hourlyRate || "";
    DOM.shiftLengthInput.value = shiftLength || 480;
    DOM.targetEfficiencyInput.value = targetEfficiency || 100;
    DOM.unitsPerCycleInput.value = unitsPerCycle || 1;
    if (DOM.projectCommentsInput) DOM.projectCommentsInput.value = projectComments || "";
  } else {
    DOM.settingsPanel.classList.add("translate-x-full");
    DOM.settingsBackdrop.classList.add("opacity-0");
    setTimeout(() => DOM.settingsBackdrop.classList.add("hidden"), 300);
  }
};

const getAllTaskNames = () => {
  const names = [];
  for (const op of yama) {
    if (Array.isArray(op)) {
      for (const task of op) {
        if (task?.taskName) names.push(task.taskName);
      }
    }
  }
  return names;
};

const addOp = async () => {
  player.pause();
  const opName = await asyncPrompt("Please name the Operation", "", "New Operation", opNames);
  if (!opName) {
    alert("Operation name cannot be empty.");
    return;
  }
  const startTime = player.currentTime;
  toConsole("Operation start time", startTime, debuggin);
  if (!firstOp) {
    opCount += 1;
    toConsole("Creating Operation opCount has increased by 1", opCount, debuggin);
  } else {
    firstOp = false;
    toConsole("Creating first operation yama[0]", opCount, debuggin);
  }
  opNames[opCount] = opName;
  opStartTimes[opCount] = startTime;
  opPartTags[opCount] = [];
  taskCount = 0;
  yama[opCount] = [];
  toConsole("taskCount has been reset", taskCount, debuggin);
  saveLocalState();
  updateTaskList();
  drawTable();
};

const addTask = async () => {
  player.pause();
  toConsole("playPause", "play paused to add task", debuggin);
  if (yama.length === 0) {
    alert("There's no Operation yet! Please add an Operation first.");
    toConsole("Tried to add a Task, but No Operation exists", null, debuggin);
    await addOp();
    if (yama.length === 0) {
      return;
    }
  }
  const taskName = await asyncPrompt("Please name the Task", "", "New Task", getAllTaskNames());
  if (!taskName) {
    alert("Task name cannot be empty.");
    return;
  }
  toConsole("taskName", taskName, debuggin);
  const taskEnd = player.currentTime * 1000;
  toConsole("taskEnd", taskEnd, debuggin);
  const opIndex = opCount;
  const opStartTimeInputId = `opTimeInput-${opIndex}`;
  const opTimeInput = document.getElementById(opStartTimeInputId);
  if (!opTimeInput) {
    alert("Error: Operation input not found. Please try refreshing the page.");
    return;
  }
  const opStartTime = parseTimeFromHHMMSSMS(opTimeInput.value) || 0;
  toConsole("opStartTime from input", opStartTime, debuggin);

  taskCount = yama[opCount] ? yama[opCount].length : 0;

  const taskStart = taskCount === 0 ? opStartTime * 1000 : yama[opCount][taskCount - 1].taskEnd;
  toConsole("taskStart", taskStart, debuggin);
  const taskHeight = taskCount === 0 ? taskEnd - opStartTime * 1000 : taskEnd - taskStart;
  toConsole("taskHeight", taskHeight, debuggin);
  let taskStatus = await asyncPrompt("VA, NVA, W? (or 1=VA, 2=NVA, 3=W)", "", "Task Status");
  if (!taskStatus) {
    alert("Task status cannot be empty.");
    return;
  }
  toConsole("taskStatus input", taskStatus, debuggin);

  taskStatus = taskStatus.toUpperCase();
  if (taskStatus === "1") taskStatus = "VA";
  if (taskStatus === "2") taskStatus = "NVA";
  if (taskStatus === "3") taskStatus = "W";

  if (!["VA", "NVA", "W"].includes(taskStatus)) {
    alert("Invalid task status. Please enter VA, NVA, W, 1 (VA), 2 (NVA), or 3 (W).");
    return;
  }
  toConsole("taskStatus processed", taskStatus, debuggin);
  yama[opCount][taskCount] = {
    taskName,
    taskStart,
    taskEnd,
    taskHeight,
    taskStatus,
    partTags: [],
    labourTags: [],
  };
  console.table(yama[opCount][taskCount]);
  taskCount += 1;
  saveLocalState();
  updateTaskList();
  drawTable();
};

/* eslint-disable no-unused-vars */
const insertTask = async (opIndex, taskIndex) => {
  player.pause();
  toConsole("playPause", "play paused to insert task", debuggin);
  const taskName = await asyncPrompt("Please name the new Task", "", "Split Task", getAllTaskNames());
  if (!taskName) {
    alert("Task name cannot be empty.");
    return;
  }
  toConsole("taskName", taskName, debuggin);
  let taskStatus = await asyncPrompt("VA, NVA, W? (or 1=VA, 2=NVA, 3=W)", "", "Task Status");
  if (!taskStatus) {
    alert("Task status cannot be empty.");
    return;
  }
  toConsole("taskStatus input", taskStatus, debuggin);

  taskStatus = taskStatus.toUpperCase();
  if (taskStatus === "1") taskStatus = "VA";
  if (taskStatus === "2") taskStatus = "NVA";
  if (taskStatus === "3") taskStatus = "W";

  if (!["VA", "NVA", "W"].includes(taskStatus)) {
    alert("Invalid task status. Please enter VA, NVA, W, 1 (VA), 2 (NVA), or 3 (W).");
    return;
  }
  toConsole("taskStatus processed", taskStatus, debuggin);

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
    partTags: [],
    labourTags: [],
  };

  yama[opIndex].splice(taskIndex + 1, 0, newTask);

  for (let i = taskIndex + 2; i < yama[opIndex].length; i += 1) {
    yama[opIndex][i].taskStart = yama[opIndex][i - 1].taskEnd;
    yama[opIndex][i].taskEnd = yama[opIndex][i].taskStart + yama[opIndex][i].taskHeight;
  }

  taskCount = yama[opIndex].length;
  saveLocalState();
  updateTaskList();
  drawTable();
};

const handleInlineNameEdit = (opIndex, taskIndex, newValue) => {
  const trimmed = newValue.trim();
  if (!trimmed) {
    alert("Task name cannot be empty.");
    updateTaskList();
    return;
  }
  yama[opIndex][taskIndex].taskName = trimmed;
  saveLocalState();
  drawTable();
};

const handleInlineStatusEdit = (opIndex, taskIndex, newValue) => {
  yama[opIndex][taskIndex].taskStatus = newValue;
  saveLocalState();
  updateTaskList();
  drawTable();
};

const handleInlineDurationEdit = (opIndex, taskIndex, newValue) => {
  let newDurationMs;
  if (durationMode === "hhmmssms") {
    const parts = String(newValue).replace(".", ":").split(":");
    if (parts.length < 3 || parts.length > 4) {
      alert("Invalid format. Please use HH:MM:SS.MS (e.g., 00:01:30.50).");
      updateTaskList();
      return;
    }
    let hours = 0;
    let minutes;
    let seconds;
    let milliseconds;
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
      seconds >= 60 ||
      milliseconds >= 1000
    ) {
      alert("Invalid duration. Ensure minutes, seconds (<60), and milliseconds (<100) are valid.");
      updateTaskList();
      return;
    }
    newDurationMs = hours * 3600000 + minutes * 60000 + seconds * 1000 + milliseconds;
  } else if (durationMode === "ms") {
    newDurationMs = Number.parseFloat(newValue);
    if (Number.isNaN(newDurationMs) || newDurationMs < 0) {
      alert("Invalid duration. Please enter a non-negative number.");
      updateTaskList();
      return;
    }
  } else {
    const decimalMinutes = Number.parseFloat(newValue);
    if (Number.isNaN(decimalMinutes) || decimalMinutes < 0) {
      alert("Invalid duration. Please enter a non-negative number.");
      updateTaskList();
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
  saveLocalState();
  updateTaskList();
  drawTable();
};

const deleteTask = async (opIndex, taskIndex) => {
  if (await asyncConfirm("Are you sure you want to delete this task?", "Delete Task")) {
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
        firstOp = true;
        addTaskButton.disabled = true;
      }
    }
    taskCount = yama[opIndex]?.length ?? 0;
    saveLocalState();
    updateTaskList();
    drawTable();
  }
};

const renameOperation = async (opIndex) => {
  const newName = await asyncPrompt("Rename Operation", opNames[opIndex], "Rename Operation", opNames);
  if (newName === null) return; // User clicked Cancel
  if (newName.trim() === "") {
    alert("Operation name cannot be empty.");
    return;
  }
  opNames[opIndex] = newName.trim();
  toConsole(`Renamed operation at index ${opIndex}`, newName, debuggin);
  saveLocalState();
  updateTaskList();
  drawTable(); // Redraw chart to update axis labels
};

const deleteOperation = async (opIndex) => {
  if (
    await asyncConfirm(
      `Are you sure you want to delete the operation "${opNames[opIndex]}" and all its tasks? This action cannot be undone.`,
      "Delete Operation",
    )
  ) {
    yama.splice(opIndex, 1);
    opNames.splice(opIndex, 1);
    opStartTimes.splice(opIndex, 1);
    opCount -= 1;
    if (opCount < 0) {
      opCount = 0;
      firstOp = true;
      addTaskButton.disabled = true;
    }
    taskCount = yama[opCount]?.length ?? 0;
    toConsole(`Deleted operation at index ${opIndex}`, `opCount: ${opCount}, taskCount: ${taskCount}`, debuggin);
    saveLocalState();
    updateTaskList();
    drawTable();
  }
};

const jumpToOperationTime = (inputId) => {
  const opTimeInput = document.getElementById(inputId);
  const time = parseTimeFromHHMMSSMS(opTimeInput.value);
  if (time !== null) {
    if (player.src) {
      player.currentTime = time;
      toConsole("Jumped to operation time", time, debuggin);
    } else {
      alert("Please load a video first.");
    }
  } else {
    alert("Invalid time format in the input field.");
  }
};
/* eslint-enable no-unused-vars */

const updateTaskList = () => {
  try {
    if (!DOM.taskList) throw new Error("Task list element not found");
    const isDarkMode = document.documentElement.classList.contains("dark");
    const rows = [
      `<table class="table task-table font-mono text-base tabular-nums">
         <thead>
           <tr>
             <th scope="col" class="text-left align-middle">
               <div class="flex items-center gap-2">
                 <button onclick="toggleChartMode()" class="btn btn-sm btn-outline-secondary p-1 flex items-center justify-center" title="Toggle Chart View (Show ${chartMode === "column" ? "Gantt" : "Column"})">
                   ${
                     chartMode === "column"
                       ? `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M8 8h6"/><path d="M11 12h5"/><path d="M14 16h6"/></svg>`
                       : `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`
                   }
                 </button>
                 <span>Operation</span>
               </div>
             </th>
             <th scope="col" class="text-center w-0 whitespace-nowrap">Duration</th>
             <th scope="col" class="text-center w-0 whitespace-nowrap">Status</th>
             <th scope="col" class="text-center w-0 whitespace-nowrap">Actions</th>
           </tr>
         </thead>
         <tbody>`,
    ];
    for (let i = 0; i < yama.length; i += 1) {
      const opTimeInputId = `opTimeInput-${i}`;
      const formattedTime = formatTimeToHHMMSSMS(opStartTimes[i]);
      const safeOpName = escapeHTML(opNames[i]);
      const opTags = opPartTags[i] || [];

      rows.push(`
        <tr>
          <td colspan="4">
            <div class="flex items-center justify-between w-full">
              <div class="flex-1 mr-4">
                <div class="flex items-center gap-2 flex-wrap">
                  <button onclick="jumpToOperationTime('${opTimeInputId}')" class="p-1 bg-transparent border-0 shadow-none hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors text-zinc-600 dark:text-zinc-400 focus:outline-none flex items-center justify-center cursor-pointer shrink-0" title="Jump to Operation Time">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="4 4 12 12 4 20 4 4"></polygon><line x1="16" y1="4" x2="16" y2="20"></line><line x1="20" y1="4" x2="20" y2="20"></line></svg>
                  </button>
                  <span class="font-bold text-lg shrink-0">
                    ${safeOpName}
                  </span>
                  <span class="op-time-container shrink-0">
                    <label for="${opTimeInputId}" class="form-label font-mono text-base mb-0" style="width: auto;">Start:</label>
                    <input type="text" id="${opTimeInputId}" class="form-control op-time-input font-mono tabular-nums text-base" value="${formattedTime}">
                  </span>
                  <button onclick="openOpPartDropdown(event, ${i})" class="p-1 bg-transparent border-0 shadow-none hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors text-zinc-600 dark:text-zinc-400 focus:outline-none flex items-center justify-center cursor-pointer shrink-0" title="Assign Part Numbers">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.586 2.586a2 2 0 0 0-2.828 0L2.586 9.757a2 2 0 0 0 0 2.828l9.172 9.172a2 2 0 0 0 2.828 0l7.172-7.172a2 2 0 0 0 0-2.828L12.586 2.586z"/><circle cx="8.5" cy="8.5" r="1.5"/></svg>
                  </button>
                  ${renderTags(opTags, "part", "op", i, -1, "xs")}
                </div>
              </div>
              <div class="flex gap-1.5">
                <button onclick="renameOperation(${i})" class="btn btn-primary p-1 shadow-sm" title="Rename Operation">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                </button>
                <button onclick="deleteOperation(${i})" class="btn btn-danger p-1 shadow-sm" title="Delete Operation">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                </button>
              </div>
            </div>
          </td>
        </tr>
      `);
      for (let j = 0; j < yama[i].length; j += 1) {
        const task = yama[i][j];
        const durationValue =
          durationMode === "hhmmssms"
            ? formatDuration(task.taskHeight)
            : durationMode === "ms"
              ? task.taskHeight.toFixed(3)
              : formatDecimalMinutes(task.taskHeight);

        const taskPartTags = task.partTags || [];
        const taskLabourTags = task.labourTags || [];

        const safeTaskName = escapeHTML(task.taskName);

        let badgeClass = "";
        if (task.taskStatus === "VA")
          badgeClass = "border-emerald-500/50 text-emerald-600 dark:border-emerald-400/50 dark:text-emerald-400";
        else if (task.taskStatus === "NVA")
          badgeClass = "border-amber-500/50 text-amber-600 dark:border-amber-400/50 dark:text-amber-400";
        else if (task.taskStatus === "W")
          badgeClass = "border-rose-500/50 text-rose-600 dark:border-rose-400/50 dark:text-rose-400";

        rows.push(`
          <tr>
            <td>
              <div class="ml-5 flex flex-col items-start">
                <input type="text" class="font-semibold bg-transparent border-0 outline-none shadow-none focus:ring-0 focus:bg-zinc-100 dark:focus:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded px-1 py-0.5 h-auto leading-tight transition-colors m-0 cursor-text max-w-full" style="width: ${Math.max(safeTaskName.length + 1, 5)}ch;" value="${safeTaskName}" oninput="this.style.width = (this.value.length + 1) + 'ch';" onchange="handleInlineNameEdit(${i}, ${j}, this.value)" onfocus="this.select()" title="Edit Task Name">
                <div class="px-1">
                  ${renderTags(taskPartTags, "part", "task", i, j)}
                  ${renderTags(taskLabourTags, "labour", "task", i, j)}
                </div>
              </div>
            </td>
            <td class="text-center whitespace-nowrap align-top pt-1.5">
              <input type="text" class="font-mono tabular-nums text-sm text-center mx-auto py-1 px-1 h-auto leading-none bg-transparent border-0 outline-none shadow-none focus:ring-0 focus:bg-zinc-100 dark:focus:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors m-0 cursor-text" style="width: ${Math.max(durationValue.length + 1, 3)}ch;" value="${durationValue}" oninput="this.style.width = (this.value.length + 1) + 'ch';" onchange="handleInlineDurationEdit(${i}, ${j}, this.value)" onfocus="this.select()" title="Edit Duration">
            </td>
            <td class="text-center whitespace-nowrap align-top pt-1.5">
              <button type="button" onclick="openStatusModal(event, ${i}, ${j})" class="outline-none inline-block px-2 py-0.5 rounded border bg-transparent text-xs font-bold cursor-pointer text-center hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ${badgeClass}" title="Change Status">
                ${task.taskStatus}
              </button>
            </td>
            <td class="flex gap-1.5 justify-center">
              <button onclick="openTagModal('task-parts', ${i}, ${j})" class="btn btn-outline-secondary p-1" title="Assign Part Numbers">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.586 2.586a2 2 0 0 0-2.828 0L2.586 9.757a2 2 0 0 0 0 2.828l9.172 9.172a2 2 0 0 0 2.828 0l7.172-7.172a2 2 0 0 0 0-2.828L12.586 2.586z"/><circle cx="8.5" cy="8.5" r="1.5"/></svg>
              </button>
              <button onclick="openTagModal('task-labour', ${i}, ${j})" class="btn btn-outline-secondary p-1" title="Assign Labour Codes">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
              </button>
              <button onclick="insertTask(${i}, ${j})" class="btn btn-outline-secondary p-1 ml-2" title="Split Task">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>
              </button>
              <button onclick="deleteTask(${i}, ${j})" class="btn btn-outline-danger p-1" title="Delete Task">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
              </button>
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
    DOM.taskList.innerHTML = rows.join("");

    DOM.taskTableFoot = document.getElementById("taskTableFoot");

    const table = document.querySelector(".task-table");
    if (!table) throw new Error("Task table element not found");
    if (yama.length > 0) {
      table.style.display = "table";
      updateProcessTimes();
      addTaskButton.disabled = false;
    } else {
      table.style.display = "none";
      addTaskButton.disabled = true;
    }

    for (let i = 0; i < yama.length; i += 1) {
      const opTimeInput = document.getElementById(`opTimeInput-${i}`);
      if (!opTimeInput) throw new Error(`Operation time input opTimeInput-${i} not found`);
      opTimeInput.addEventListener(
        "input",
        debounce((event) => {
          const newTime = parseTimeFromHHMMSSMS(event.target.value);
          if (newTime !== null) {
            opStartTimes[i] = newTime;
            toConsole(`Operation ${i} start time updated`, opStartTimes[i], debuggin);
            saveLocalState();
            updateProcessTimes();
          } else {
            alert("Invalid time format. Please use HH:MM:SS.MS (e.g., 00:01:00.00).");
            opTimeInput.value = formatTimeToHHMMSSMS(opStartTimes[i]);
          }
        }, 100),
      );
    }
  } catch (error) {
    toConsole("updateTaskList error", error.message, debuggin);
    alert("Failed to update task list. Please check the console for details.");
  }
};

const updateProcessTimes = () => {
  try {
    if (yama.length === 0) return;

    if (!DOM.taskTableFoot) {
      toConsole("updateProcessTimes skipped", "taskTableFoot is null", debuggin);
      return;
    }

    const formattedEndTime = formatTimeToHHMMSSMS(processEndTime);
    let totalProcessTime = "00:00:00:00";
    if (opStartTimes.length > 0) {
      const durationSeconds = Math.max(0, processEndTime - opStartTimes[0]);
      totalProcessTime = formatTimeToHHMMSSMS(durationSeconds);
    }

    DOM.taskTableFoot.innerHTML = `
      <tr>
        <td colspan="4" class="table-foot">
          <div class="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 w-full py-1">
            <span class="process-time-container">
              <label for="taktTimeInput" class="form-label font-mono text-sm mb-0" style="width: auto;">Takt Time:</label>
              <input type="text" id="taktTimeInput" class="form-control process-time-input font-mono tabular-nums text-sm" value="${formatTaktTime(taktTime)}">
            </span>
            <span class="process-time-container">
              <label for="processEndTimeInput" class="form-label font-mono text-sm mb-0" style="width: auto;">Process end time:</label>
              <input type="text" id="processEndTimeInput" class="form-control process-time-input font-mono tabular-nums text-sm" value="${formattedEndTime}">
            </span>
            <span class="process-time-container">
              <label for="totalProcessTimeInput" class="form-label font-mono text-sm mb-0" style="width: auto;">Total Process time:</label>
              <input type="text" id="totalProcessTimeInput" class="form-control process-time-input font-mono tabular-nums text-sm" value="${totalProcessTime}" disabled>
            </span>
          </div>
        </td>
      </tr>
    `;

    const taktTimeInput = document.getElementById("taktTimeInput");
    if (taktTimeInput) {
      taktTimeInput.addEventListener(
        "input",
        debounce((event) => {
          const newTaktTime = parseTaktTime(event.target.value);
          if (newTaktTime !== null) {
            taktTime = newTaktTime;
            saveLocalState();
            toConsole("Takt Time updated", taktTime, debuggin);
          } else {
            alert("Invalid Takt Time format. Please use HH:MM:SS.MS (e.g., 00:01:00.00).");
            taktTimeInput.value = formatTaktTime(taktTime);
          }
        }, 100),
      );
    }

    const processEndTimeInput = document.getElementById("processEndTimeInput");
    if (!processEndTimeInput) throw new Error("Process end time input not found");
    processEndTimeInput.addEventListener(
      "input",
      debounce((event) => {
        const newEndTime = parseTimeFromHHMMSSMS(event.target.value);
        if (newEndTime !== null) {
          processEndTime = newEndTime;
          toConsole("Process end time updated", processEndTime, debuggin);
          const durationSeconds = opStartTimes.length > 0 ? Math.max(0, processEndTime - opStartTimes[0]) : 0;
          document.getElementById("totalProcessTimeInput").value = formatTimeToHHMMSSMS(durationSeconds);
          saveLocalState();
        } else {
          alert("Invalid time format. Please use HH:MM:SS.MS (e.g., 00:01:00.00).");
          processEndTimeInput.value = formatTimeToHHMMSSMS(processEndTime);
        }
      }, 100),
    );
  } catch (error) {
    toConsole("updateProcessTimes error", error.message, debuggin);
    alert("Failed to update process times. Please check the console for details.");
  }
};

const exportToJSON = async (isSaveAs = false) => {
  saveLocalState(); // Force sync of globals to current trial before export
  const dataStr = localStorage.getItem("timeStudyData");
  if (!dataStr) return;

  let filename = "project.json";
  if (projectName) {
    filename = `${sanitizeFilename(projectName)}.json`;
  }

  const isTauri = window.__TAURI__ !== undefined;
  if (isTauri) {
    try {
      if (isSaveAs === true || !projectFilePath) {
        const defaultName = projectFilePath ? projectFilePath.split(/[/\\]/).pop() : filename;
        const filePath = await window.__TAURI__.core.invoke("plugin:dialog|save", {
          filters: [{ name: "JSON", extensions: ["json"] }],
          defaultPath: defaultName,
        });
        if (filePath) {
          projectFilePath = filePath;
          localStorage.setItem("projectFilePath", projectFilePath);
          await window.__TAURI__.core.invoke("plugin:fs|write_text_file", { path: filePath, data: dataStr });
          showToast("Project saved successfully.", "success");
        }
      } else {
        await window.__TAURI__.core.invoke("plugin:fs|write_text_file", { path: projectFilePath, data: dataStr });
        showToast("Project saved successfully.", "success");
      }
    } catch (e) {
      toConsole("Error saving project via Tauri", e, debuggin);
      showToast("Error saving project file.", "error");
    }
  } else {
    if (window.showSaveFilePicker) {
      try {
        if (isSaveAs === true || !projectFileHandle) {
          projectFileHandle = await window.showSaveFilePicker({
            suggestedName: filename,
            types: [
              {
                description: "JSON Files",
                accept: { "application/json": [".json"] },
              },
            ],
          });
        }
        const writable = await projectFileHandle.createWritable();
        await writable.write(dataStr);
        await writable.close();
        showToast("Project saved successfully.", "success");
        return;
      } catch (err) {
        if (err.name !== "AbortError") {
          toConsole("Error with showSaveFilePicker", err, debuggin);
        } else {
          return; // User cancelled the prompt
        }
      }
    }

    // Fallback for older browsers
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast("Project saved successfully.", "success");
  }
};

const importFromJSON = (jsonText) => {
  try {
    const data = JSON.parse(jsonText);

    if (data.appState) {
      // Legacy v0.4.3 support: Wrap the old format into a Trial
      trials = [
        {
          trialId: 1,
          trialName: "Current State",
          videoFileName: data.projectMeta?.videoFileName || "",
          videoFilePath: data.projectMeta?.videoFilePath || "",
          processEndTime: data.projectMeta?.processEndTime || 0,
          taktTime: data.costingConfig?.taktTime || 60000,
          costingConfig: data.costingConfig || {
            hourlyRate: 0,
            shiftLength: 480,
            targetEfficiency: 100,
            unitsPerCycle: 1,
          },
          appState: data.appState,
        },
      ];
      activeTrialIndex = 0;
      projectName = data.projectMeta?.projectName || "";
      projectComments = "";
      masterParts = data.projectMeta?.masterParts || [];
      masterLabour = data.projectMeta?.masterLabour || [];
    } else if (data.trials) {
      // New Multi-Trial format
      trials = data.trials;
      activeTrialIndex = data.activeTrialIndex || 0;
      projectName = data.projectMeta?.projectName || "";
      projectComments = data.projectMeta?.projectComments || "";
      masterParts = data.projectMeta?.masterParts || [];
      masterLabour = data.projectMeta?.masterLabour || [];
    } else {
      alert("Invalid project file format.");
      return;
    }

    // Load active trial into memory
    const currentTrial = trials[activeTrialIndex];
    videoFileName = currentTrial.videoFileName || "";
    videoFilePath = currentTrial.videoFilePath || "";
    processEndTime = currentTrial.processEndTime || 0;
    taktTime = currentTrial.taktTime || 60000;

    hourlyRate = currentTrial.costingConfig?.hourlyRate || 0;
    shiftLength = currentTrial.costingConfig?.shiftLength || 480;
    targetEfficiency = currentTrial.costingConfig?.targetEfficiency || 100;
    unitsPerCycle = currentTrial.costingConfig?.unitsPerCycle || 1;

    yama = currentTrial.appState?.yama || [];
    opNames = currentTrial.appState?.opNames || [];
    opStartTimes = currentTrial.appState?.opStartTimes || [];
    opPartTags = currentTrial.appState?.opPartTags || [];
    opCount = currentTrial.appState?.opCount !== undefined ? currentTrial.appState.opCount : 0;
    taskCount = currentTrial.appState?.taskCount !== undefined ? currentTrial.appState.taskCount : 0;
    firstOp = currentTrial.appState?.firstOp !== undefined ? currentTrial.appState.firstOp : true;

    if (DOM.projectNameInput) DOM.projectNameInput.value = projectName;
    renderTrialSelect();

    DOM.taskList.innerHTML = "";
    DOM.pieChartContainer.innerHTML = "";
    DOM.chartContainer.innerHTML = "";
    DOM.ganttChartContainer.innerHTML = "";

    // Handle Video Relinking
    player.pause();
    const isTauri = window.__TAURI__ !== undefined;
    if (isTauri && videoFilePath) {
      const tauriAssetUrl = window.__TAURI__.core.convertFileSrc(videoFilePath);
      player.src = tauriAssetUrl;
      player.preload = "auto";
      toggleVideoPlaceholder(false);
    } else if (videoFileName && videoBlobCache[videoFileName]) {
      player.src = videoBlobCache[videoFileName];
      player.preload = "metadata";
      toggleVideoPlaceholder(false);
    } else {
      player.removeAttribute("src");
      DOM.videoPlaceholder.textContent = videoFileName
        ? `Project loaded. Click here to locate video: ${videoFileName}`
        : "Load a video to get started";
      toggleVideoPlaceholder(true);
    }

    updateTaskList();
    saveLocalState();
    drawTable();
    updateLoadButtonColor();

    toConsole("Project imported successfully", `Loaded Trial: ${currentTrial.trialName}`, debuggin);
    showToast("Project loaded successfully.", "success");
  } catch (e) {
    toConsole("Error importing JSON", e, debuggin);
    alert("Error reading project file. It may be corrupted or in an invalid format.");
  }
};

const exportToCSV = async () => {
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
  csvContent += "Operation,Operation Parts,Task,Task Parts,Task Labour,VA,NVA,W\n";

  for (let i = 0; i < yama.length; i += 1) {
    for (let j = 0; j < yama[i].length; j += 1) {
      const task = yama[i][j];
      const status = task.taskStatus.toUpperCase();
      const vaDuration = status === "VA" ? task.taskHeight : 0;
      const nvaDuration = status === "NVA" ? task.taskHeight : 0;
      const wDuration = status === "W" ? task.taskHeight : 0;

      const escapedOpName = opNames[i].includes(",") ? `"${opNames[i]}"` : opNames[i];
      const opPartsStr = (opPartTags[i] || []).join("; ");
      const escapedOpParts =
        opPartsStr.includes(",") || opPartsStr.includes('"') ? `"${opPartsStr.replace(/"/g, '""')}"` : opPartsStr;

      const escapedTaskName = task.taskName.includes(",") ? `"${task.taskName}"` : task.taskName;
      const taskPartsStr = (task.partTags || []).join("; ");
      const escapedTaskParts =
        taskPartsStr.includes(",") || taskPartsStr.includes('"')
          ? `"${taskPartsStr.replace(/"/g, '""')}"`
          : taskPartsStr;

      const taskLabourStr = (task.labourTags || []).join("; ");
      const escapedTaskLabour =
        taskLabourStr.includes(",") || taskLabourStr.includes('"')
          ? `"${taskLabourStr.replace(/"/g, '""')}"`
          : taskLabourStr;

      csvContent += `${escapedOpName},${escapedOpParts},${escapedTaskName},${escapedTaskParts},${escapedTaskLabour},${vaDuration},${nvaDuration},${wDuration}\n`;
    }
  }

  let filename = "operation_task_durations.csv";
  if (projectName) {
    filename = `${sanitizeFilename(projectName)}.csv`;
  }

  const isTauri = window.__TAURI__ !== undefined;
  if (isTauri && window.__TAURI__.dialog && window.__TAURI__.fs) {
    try {
      const filePath = await window.__TAURI__.dialog.save({
        filters: [{ name: "CSV", extensions: ["csv"] }],
        defaultPath: filename,
      });
      if (filePath) {
        await window.__TAURI__.fs.writeTextFile(filePath, csvContent);
        showToast("Data exported to CSV successfully.", "success");
      }
    } catch (e) {
      toConsole("Error exporting CSV via Tauri", e, debuggin);
      showToast("Error exporting CSV file.", "error");
    }
  } else {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast("Data exported to CSV successfully.", "success");
  }
};

const drawTable = () => {
  try {
    if (!DOM.chartContainer || !DOM.pieChartContainer) {
      throw new Error("Chart container elements not found");
    }
    if (yama.length === 0) {
      DOM.chartContainer.innerHTML = "";
      DOM.ganttChartContainer.innerHTML = "";
      DOM.pieChartContainer.innerHTML = "";
      return;
    }
    if (taktTime === null || taktTime <= 0) {
      return;
    }
    if (typeof Highcharts === "undefined") {
      return;
    }
    const isDarkMode = document.documentElement.classList.contains("dark");
    setHighchartsTheme(isDarkMode);

    if (chartMode === "column") {
      DOM.chartContainer.style.display = "block";
      DOM.ganttChartContainer.style.display = "none";
      DOM.ganttChartContainer.innerHTML = "";

      const series = [];
      for (let j = 0; j < yama.length; j += 1) {
        if (yama[j] && Array.isArray(yama[j])) {
          for (let i = 0; i < yama[j].length; i += 1) {
            const task = yama[j][i];
            const status = task.taskStatus.toUpperCase();
            const color = status === "VA" ? "#10b981" : status === "NVA" ? "#f59e0b" : "#f43f5e";
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
          toConsole("Invalid task array for operation", j, debuggin);
        }
      }
      toConsole("Generated series", JSON.stringify(series), debuggin);
      toConsole("xAxis categories", JSON.stringify(opNames), debuggin);
      Highcharts.chart(DOM.chartContainer, {
        chart: { type: "column" },
        accessibility: { enabled: false },
        title: { text: "Operation Task Durations by Status" },
        xAxis: { categories: opNames },
        yAxis: {
          title: {
            text: `Duration (${
              durationMode === "hhmmssms" ? "HH:MM:SS.MS" : durationMode === "ms" ? "Milliseconds" : "Minutes"
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
            const cleanTaskName = this.series.name.replace(`${this.x}: `, "");
            return `<b>Operation: ${this.x}</b><br>Task: ${cleanTaskName}<br>Duration: ${duration}`;
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
    } else {
      DOM.chartContainer.style.display = "none";
      DOM.ganttChartContainer.style.display = "block";
      DOM.chartContainer.innerHTML = "";

      const ganttData = [];
      for (let i = 0; i < yama.length; i += 1) {
        if (yama[i] && Array.isArray(yama[i])) {
          for (let j = 0; j < yama[i].length; j += 1) {
            const task = yama[i][j];
            const status = task.taskStatus.toUpperCase();
            const color = status === "VA" ? "#10b981" : status === "NVA" ? "#f59e0b" : "#f43f5e";
            ganttData.push({
              name: task.taskName,
              start: task.taskStart,
              end: task.taskEnd,
              y: i,
              color,
              status,
            });
          }
        }
      }

      Highcharts.ganttChart(DOM.ganttChartContainer, {
        accessibility: { enabled: false },
        title: { text: "Task Timeline (Gantt)" },
        xAxis: {
          labels: {
            formatter() {
              return durationMode === "hhmmssms"
                ? formatDuration(this.value)
                : durationMode === "ms"
                  ? this.value.toFixed(3)
                  : formatDecimalMinutes(this.value);
            },
          },
        },
        yAxis: {
          categories: opNames,
          title: { text: "Operations" },
        },
        tooltip: {
          formatter() {
            const duration =
              durationMode === "hhmmssms"
                ? formatDuration(this.point.end - this.point.start)
                : durationMode === "ms"
                  ? `${(this.point.end - this.point.start).toFixed(3)} ms`
                  : `${formatDecimalMinutes(this.point.end - this.point.start)} min`;
            return `<b>Operation:</b> ${this.series.yAxis.categories[this.point.y]}<br/><b>Task:</b> ${this.point.name}<br/><b>Status:</b> ${this.point.status}<br/><b>Duration:</b> ${duration}`;
          },
        },
        series: [{ name: "Tasks", data: ganttData }],
      });
    }

    DOM.pieChartContainer.innerHTML = "";
    for (let i = 0; i < yama.length; i += 1) {
      const statusDurations = { VA: 0, NVA: 0, W: 0 };
      if (yama[i] && Array.isArray(yama[i])) {
        for (let j = 0; j < yama[i].length; j += 1) {
          if (yama[i][j]?.taskStatus) {
            const status = yama[i][j].taskStatus.toUpperCase();
            if (status in statusDurations) {
              statusDurations[status] += yama[i][j].taskHeight;
            }
          } else {
            toConsole("Invalid task data at", `Operation ${i}, Task ${j}`, debuggin);
          }
        }
      } else {
        toConsole("No tasks for operation", opNames[i], debuggin);
        continue;
      }
      toConsole(
        "Pie chart data for operation",
        `${opNames[i]}: VA=${statusDurations.VA}, NVA=${statusDurations.NVA}, W=${statusDurations.W}`,
        debuggin,
      );
      const pieData = [
        { name: "VA", y: statusDurations.VA, color: "#10b981" },
        { name: "NVA", y: statusDurations.NVA, color: "#f59e0b" },
        { name: "W", y: statusDurations.W, color: "#f43f5e" },
      ].filter((item) => item.y > 0);
      if (pieData.length === 0) {
        toConsole("No valid pie chart data for operation", opNames[i], debuggin);
        continue;
      }
      const pieDiv = document.createElement("div");
      pieDiv.id = `pieChart${i}`;
      pieDiv.className = "pieChart";
      DOM.pieChartContainer.appendChild(pieDiv);
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
  } catch (error) {
    toConsole("drawTable error", error.message, debuggin);
    alert("Failed to render charts. Please check the console for details.");
  }
};

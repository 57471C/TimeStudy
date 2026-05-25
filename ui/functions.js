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

const showToast = (message, type = "error") => {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  const baseClasses =
    "flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border text-sm font-medium transition-all duration-300 transform translate-x-full opacity-0 max-w-md w-full pointer-events-auto cursor-pointer";

  const typeClasses =
    type === "error"
      ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400"
      : type === "success"
        ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400"
        : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400";

  toast.className = `${baseClasses} ${typeClasses}`;

  const icon =
    type === "error"
      ? `<svg class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`
      : type === "success"
        ? `<svg class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>`
        : `<svg class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;

  toast.innerHTML = `${icon} <span>${message}</span>`;
  container.appendChild(toast);

  // Click to dismiss early
  toast.addEventListener("click", () => {
    toast.classList.add("translate-x-full", "opacity-0");
    setTimeout(() => {
      if (container.contains(toast)) container.removeChild(toast);
    }, 300);
  });

  requestAnimationFrame(() => toast.classList.remove("translate-x-full", "opacity-0"));

  setTimeout(() => {
    toast.classList.add("translate-x-full", "opacity-0");
    setTimeout(() => {
      if (container.contains(toast)) container.removeChild(toast);
    }, 300);
  }, 4000);
};

// Intercept native alerts to use our sleek Toast system
window.alert = (message) => showToast(message, "error");

const asyncConfirm = (message, title = "Confirm") => {
  return new Promise((resolve) => {
    const modal = document.getElementById("confirmModal");
    document.getElementById("confirmTitle").textContent = title;
    document.getElementById("confirmMessage").textContent = message;

    const btnOk = document.getElementById("confirmOkBtn");
    const btnCancel = document.getElementById("confirmCancelBtn");

    let resolved = false;

    const cleanup = () => {
      btnOk.removeEventListener("click", onOk);
      btnCancel.removeEventListener("click", onCancel);
      if (modal.open) modal.close();
    };

    const onOk = () => {
      if (resolved) return;
      resolved = true;
      cleanup();
      resolve(true);
    };
    const onCancel = () => {
      if (resolved) return;
      resolved = true;
      cleanup();
      resolve(false);
    };

    btnOk.addEventListener("click", onOk);
    btnCancel.addEventListener("click", onCancel);
    modal.showModal();
    btnOk.focus();
  });
};

const asyncPrompt = (message, defaultValue = "", title = "Input Needed", suggestions = []) => {
  return new Promise((resolve) => {
    const modal = document.getElementById("promptModal");
    document.getElementById("promptTitle").textContent = title;
    document.getElementById("promptMessage").textContent = message;

    const input = document.getElementById("promptInput");
    input.value = defaultValue;

    const datalist = document.getElementById("promptDatalist");
    if (datalist) {
      datalist.innerHTML = "";
      if (suggestions && suggestions.length > 0) {
        const uniqueSuggestions = [...new Set(suggestions)].filter(Boolean);
        for (const suggestion of uniqueSuggestions) {
          const option = document.createElement("option");
          option.value = suggestion;
          datalist.appendChild(option);
        }
        input.setAttribute("list", "promptDatalist");
      } else {
        input.removeAttribute("list");
      }
    }

    const btnOk = document.getElementById("promptOkBtn");
    const btnCancel = document.getElementById("promptCancelBtn");

    let resolved = false;

    const cleanup = () => {
      btnOk.removeEventListener("click", onOk);
      btnCancel.removeEventListener("click", onCancel);
      input.removeEventListener("keydown", onKeydown);
      if (modal.open) modal.close();
    };

    const onOk = () => {
      if (resolved) return;
      resolved = true;
      cleanup();
      resolve(input.value);
    };
    const onCancel = () => {
      if (resolved) return;
      resolved = true;
      cleanup();
      resolve(null);
    };
    const onKeydown = (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        onOk();
      } else if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      }
    };

    btnOk.addEventListener("click", onOk);
    btnCancel.addEventListener("click", onCancel);
    input.addEventListener("keydown", onKeydown);
    modal.showModal();
    input.focus();
    input.select();
  });
};

const parseTaktTime = (input) => {
  const parts = input.replace(".", ":").split(":");
  if (parts.length !== 4) return null;
  const hours = Number.parseInt(parts[0], 10);
  const minutes = Number.parseInt(parts[1], 10);
  const seconds = Number.parseInt(parts[2], 10);
  const milliseconds = Number.parseInt(parts[3], 10) * 10;
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
  return hours * 3600 * 1000 + minutes * 60 * 1000 + seconds * 1000 + milliseconds;
};

const formatTaktTime = (ms) => {
  if (!ms || ms <= 0) return "00:00:00.00";
  const hours = Math.floor(ms / (3600 * 1000));
  const minutes = Math.floor((ms % (3600 * 1000)) / (60 * 1000));
  const seconds = Math.floor((ms % (60 * 1000)) / 1000);
  const milliseconds = Math.floor((ms % 1000) / 10);
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${milliseconds.toString().padStart(2, "0")}`;
};

const formatTimeToHHMMSSMS = (seconds) => {
  if (!seconds || seconds < 0) return "00:00:00.00";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const milliseconds = Math.floor(((seconds % 1) * 1000) / 10);
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}.${milliseconds.toString().padStart(2, "0")}`;
};

const parseTimeFromHHMMSSMS = (input) => {
  const parts = input.replace(".", ":").split(":");
  if (parts.length < 3 || parts.length > 4) {
    return null;
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
    minutes >= 60 ||
    seconds >= 60 ||
    milliseconds >= 1000
  ) {
    return null;
  }
  return hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;
};

const formatDuration = (ms) => {
  if (!ms || ms <= 0) return "00:00:00.00";
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const milliseconds = Math.floor((ms % 1000) / 10);
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${milliseconds.toString().padStart(2, "0")}`;
};

const formatDecimalMinutes = (ms) => {
  if (!ms || ms <= 0) return "0.00";
  const minutes = ms / (60 * 1000);
  return minutes.toFixed(2);
};

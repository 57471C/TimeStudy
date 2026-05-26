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

const removeTag = (target, opIndex, taskIndex, tagType, tagIdx) => {
  if (target === "op") {
    operations[opIndex].partTags.splice(tagIdx, 1);
  } else if (target === "task") {
    const task = operations[opIndex].tasks[taskIndex];
    if (tagType === "part") {
      task.partTags.splice(tagIdx, 1);
    } else if (tagType === "labour") {
      task.labourTags.splice(tagIdx, 1);
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
    const currentParts = (operations[opIndex].partTags || []).map((t) => {
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

    const displayTag = `${finalQty} x ${newTag}`;
    if (!operations[opIndex].partTags.includes(displayTag)) {
      operations[opIndex].partTags.push(displayTag);
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

const openTaskLabourDropdown = (e, opIndex, taskIndex) => {
  e.stopPropagation();
  let dropdown = document.getElementById("task-labour-dropdown");
  if (!dropdown) {
    dropdown = document.createElement("div");
    dropdown.id = "task-labour-dropdown";
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
    const currentTags = operations[opIndex].tasks[taskIndex].labourTags || [];
    const filtered = masterLabour.filter(
      (p) => p.toLowerCase().includes(filter.toLowerCase()) && !currentTags.includes(p),
    );
    if (filtered.length === 0 && filter.trim() === "") {
      return `<li class="px-2 py-1 text-sm text-zinc-500 italic">No labour codes available. Type to add one.</li>`;
    }
    return filtered
      .map(
        (p) =>
          `<li class="px-2 py-1 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-700 cursor-pointer rounded truncate" data-labour="${escapeHTML(p)}" title="${escapeHTML(p)}">${escapeHTML(p)}</li>`,
      )
      .join("");
  };

  dropdown.innerHTML = `
    <div class="p-2 border-b border-zinc-200 dark:border-zinc-700 flex gap-1.5">
      <input type="text" id="task-labour-search" class="form-control text-sm flex-1" placeholder="Search or add new... (Enter)">
    </div>
    <ul id="task-labour-list" class="overflow-y-auto flex-1 p-1 m-0 list-none space-y-0.5 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-300 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-600 [&::-webkit-scrollbar-thumb]:rounded-full">
      ${renderList()}
    </ul>
  `;

  const input = document.getElementById("task-labour-search");
  const list = document.getElementById("task-labour-list");

  input.focus();

  const attachListEvents = () => {
    for (const li of list.querySelectorAll("li[data-labour]")) {
      li.addEventListener("click", () => {
        addTag(li.getAttribute("data-labour"));
      });
    }
  };

  const addTag = (newTag) => {
    if (!newTag) return;

    let addedNewMaster = false;
    if (!masterLabour.includes(newTag)) {
      masterLabour.push(newTag);
      addedNewMaster = true;
    }

    if (!operations[opIndex].tasks[taskIndex].labourTags.includes(newTag)) {
      operations[opIndex].tasks[taskIndex].labourTags.push(newTag);
    }
    if (addedNewMaster) {
      showToast("New labour code added to Master Data.", "success");
    }
    saveLocalState();
    updateTaskList();

    input.value = "";
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

  attachListEvents();
};

const openOpBulkLabourDropdown = (e, opIndex) => {
  e.stopPropagation();
  let dropdown = document.getElementById("op-bulk-labour-dropdown");
  if (!dropdown) {
    dropdown = document.createElement("div");
    dropdown.id = "op-bulk-labour-dropdown";
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
    const tasks = operations[opIndex]?.tasks || [];
    const commonTags = masterLabour.filter(
      (tag) => tasks.length > 0 && tasks.every((task) => (task.labourTags || []).includes(tag)),
    );

    const filtered = masterLabour.filter(
      (p) => p.toLowerCase().includes(filter.toLowerCase()) && !commonTags.includes(p),
    );
    if (filtered.length === 0 && filter.trim() === "") {
      return `<li class="px-2 py-1 text-sm text-zinc-500 italic">No labour codes available. Type to add one.</li>`;
    }
    return filtered
      .map(
        (p) =>
          `<li class="px-2 py-1 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-700 cursor-pointer rounded truncate" data-labour="${escapeHTML(p)}" title="${escapeHTML(p)}">${escapeHTML(p)}</li>`,
      )
      .join("");
  };

  dropdown.innerHTML = `
    <div class="p-2 border-b border-zinc-200 dark:border-zinc-700 flex gap-1.5">
      <input type="text" id="op-bulk-labour-search" class="form-control text-sm flex-1" placeholder="Search or add to all tasks... (Enter)">
    </div>
    <ul id="op-bulk-labour-list" class="overflow-y-auto flex-1 p-1 m-0 list-none space-y-0.5 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-300 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-600 [&::-webkit-scrollbar-thumb]:rounded-full">
      ${renderList()}
    </ul>
  `;

  const input = document.getElementById("op-bulk-labour-search");
  const list = document.getElementById("op-bulk-labour-list");

  input.focus();

  const attachListEvents = () => {
    for (const li of list.querySelectorAll("li[data-labour]")) {
      li.addEventListener("click", () => {
        addTag(li.getAttribute("data-labour"));
      });
    }
  };

  const addTag = (newTag) => {
    if (!newTag) return;

    let addedNewMaster = false;
    if (!masterLabour.includes(newTag)) {
      masterLabour.push(newTag);
      addedNewMaster = true;
    }

    const tasks = operations[opIndex]?.tasks || [];
    let tasksUpdated = false;

    for (const task of tasks) {
      if (!task.labourTags) {
        task.labourTags = [];
      }
      if (!task.labourTags.includes(newTag)) {
        task.labourTags.push(newTag);
        tasksUpdated = true;
      }
    }

    if (addedNewMaster) {
      showToast("New labour code added to Master Data.", "success");
    }
    if (tasksUpdated) {
      saveLocalState();
      updateTaskList();
    } else if (tasks.length === 0) {
      showToast("No tasks available to assign labour.", "error");
    }

    input.value = "";
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
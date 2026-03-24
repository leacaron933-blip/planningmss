const DAYS = ["Lundi","Mardi","Mercredi","Jeudi","Vendredi"];
const SLOTS = [
  { id:"matin_1", label:"MATIN", cls:"matin", defaultTime:"9h30–10h30", start:"09:00", end:"12:00" },
  { id:"apres_1", label:"APRÈS-\nMIDI", cls:"apres", defaultTime:"14h30–15h30", start:"12:00", end:"19:00" }
];

const STORAGE_KEY = "planning_v4_colors_difficulty";

const defaultState = {
  month: "SEPTEMBRE 2024",
  dayHeaderColors: { Lundi:"blue", Mardi:"blue", Mercredi:"blue", Jeudi:"orange", Vendredi:"blue" },
  courses: [
    { id:id(), day:"Lundi", slot:"matin_1", timeLabel:"9h30–10h30", title:"ÉQUIL / RELAX", color:"green", icon:"🧘", description:"", difficulty:1 },
    { id:id(), day:"Lundi", slot:"matin_1", timeLabel:"11h00–12h00", title:"REMISE EN FORME", color:"orange", icon:"🏋️", description:"", difficulty:1 },

    { id:id(), day:"Mardi", slot:"matin_1", timeLabel:"9h30–10h30", title:"CARDIO SANTÉ", color:"blue", icon:"🏃", description:"", difficulty:1 },
    { id:id(), day:"Mardi", slot:"matin_1", timeLabel:"11h00–12h00", title:"ÉQUILIBRE", color:"blue", icon:"🧍", description:"", difficulty:1 },

    { id:id(), day:"Mercredi", slot:"matin_1", timeLabel:"9h30–10h30", title:"ÉQUILIBRE", color:"blue", icon:"🧍", description:"", difficulty:1 },
    { id:id(), day:"Mercredi", slot:"matin_1", timeLabel:"11h00–12h00", title:"ÉQUILIBRE", color:"blue", icon:"🧍", description:"", difficulty:1 },

    { id:id(), day:"Jeudi", slot:"matin_1", timeLabel:"9h30–10h30", title:"CARDIO SANTÉ", color:"orange", icon:"🏃", description:"", difficulty:1 },
    { id:id(), day:"Jeudi", slot:"matin_1", timeLabel:"11h00–12h00", title:"CIRCUIT SANTÉ", color:"blue", icon:"⏱️", description:"", difficulty:1 },

    { id:id(), day:"Vendredi", slot:"matin_1", timeLabel:"9h30–10h30", title:"MÉMOIRE /\nCOORDINATION", color:"orange", icon:"❤️", description:"", difficulty:1 },
    { id:id(), day:"Vendredi", slot:"matin_1", timeLabel:"11h00–12h00", title:"CARDIO SANTÉ", color:"orange", icon:"🏃", description:"", difficulty:1 },

    { id:id(), day:"Lundi", slot:"apres_1", timeLabel:"14h00–15h00", title:"MARCHE SANTÉ", color:"orange", icon:"🚶", description:"", difficulty:1 },
    { id:id(), day:"Lundi", slot:"apres_1", timeLabel:"17h30–18h30", title:"CIRCUIT FORME SANTÉ", color:"purple", icon:"🧍", description:"Entraînement sous forme de petits ateliers variés pour renforcer tout le corps en s’amusant.", difficulty:2 },

    { id:id(), day:"Mardi", slot:"apres_1", timeLabel:"14h30–15h30", title:"MARCHE SANTÉ", color:"orange", icon:"🚶", description:"", difficulty:1 },
    { id:id(), day:"Mardi", slot:"apres_1", timeLabel:"17h30–18h30", title:"CIRCUIT SANTÉ", color:"blue", icon:"⏱️", description:"Entraînement en ateliers variés pour renforcer tout le corps en s’amusant.", difficulty:2 },

    { id:id(), day:"Mercredi", slot:"apres_1", timeLabel:"14h30–15h30", title:"CIRCUIT SANTÉ", color:"blue", icon:"⏱️", description:"", difficulty:1 },
    { id:id(), day:"Mercredi", slot:"apres_1", timeLabel:"17h30–18h30", title:"CIRCUIT SANTÉ", color:"blue", icon:"⏱️", description:"Entraînement en ateliers variés pour renforcer tout le corps en s’amusant.", difficulty:2 },

    { id:id(), day:"Jeudi", slot:"apres_1", timeLabel:"14h30–15h30", title:"CIRCUIT SANTÉ", color:"orange", icon:"⏱️", description:"", difficulty:1 },
    { id:id(), day:"Jeudi", slot:"apres_1", timeLabel:"17h30–18h30", title:"CARDIO SANTÉ", color:"orange", icon:"🏃", description:"Entraînement en ateliers variés pour renforcer tout le corps en s’amusant.", difficulty:2 },

    { id:id(), day:"Vendredi", slot:"apres_1", timeLabel:"14h30–15h30", title:"CIRCUIT SANTÉ", color:"orange", icon:"⏱️", description:"", difficulty:1 },
    { id:id(), day:"Vendredi", slot:"apres_1", timeLabel:"17h30–18h30", title:"CIRCUIT FORME SANTÉ", color:"purple", icon:"⏱️", description:"Entraînement en ateliers variés pour renforcer tout le corps en s’amusant.", difficulty:2 }
  ]
};

let state = loadState();

const board = document.getElementById("board");
const overlay = document.getElementById("overlay");
const drawer = document.getElementById("drawer");
const monthTitle = document.getElementById("monthTitle");
const drawerTitle = document.getElementById("drawerTitle");
const form = document.getElementById("courseForm");

const courseIdInput = document.getElementById("courseId");
const titleInput = document.getElementById("title");
const dayInput = document.getElementById("day");
const slotInput = document.getElementById("slot");
const timeLabelInput = document.getElementById("timeLabel");
const colorInput = document.getElementById("color");
const iconInput = document.getElementById("icon");
const descriptionInput = document.getElementById("description");
const difficultyInput = document.getElementById("difficulty");
const iconSuggestions = document.getElementById("iconSuggestions");
const autoIconBtn = document.getElementById("autoIconBtn");

init();

async function init() {
  state = normalizeState(state);
  state = await tryLoadBundledPlanning(state);
  fillSelects();
  monthTitle.value = state.month || defaultState.month;
  renderIconSuggestions();
  renderBoard();
  bindEvents();
  bindPrintEvents();
}


async function tryLoadBundledPlanning(currentState) {
  try {
    const hasSaved = !!localStorage.getItem(STORAGE_KEY);
    if (hasSaved) return currentState;
    const res = await fetch("planning-maison-sport-sante-cycle-avril-juillet-2026.json", { cache: "no-store" });
    if (!res.ok) return currentState;
    const parsed = await res.json();
    if (!parsed || !Array.isArray(parsed.courses)) return currentState;
    const next = normalizeState({
      month: parsed.month || currentState.month || defaultState.month,
      dayHeaderColors: currentState.dayHeaderColors || defaultState.dayHeaderColors,
      courses: parsed.courses
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return next;
  } catch (e) {
    return currentState;
  }
}
function bindEvents() {
  const addBtn = document.getElementById("addBtn");
  const closeDrawerBtn = document.getElementById("closeDrawer");
  const cancelBtn = document.getElementById("cancelBtn");
  const duplicateBtn = document.getElementById("duplicateBtn");
  const deleteBtn = document.getElementById("deleteBtn");
  const resetBtn = document.getElementById("resetBtn");
  const exportBtn = document.getElementById("exportBtn");
  const importInput = document.getElementById("importInput");
  const printBtn = document.getElementById("printBtn");

  if (addBtn) addBtn.addEventListener("click", () => openCreate());
  if (closeDrawerBtn) closeDrawerBtn.addEventListener("click", closeDrawer);
  if (cancelBtn) cancelBtn.addEventListener("click", closeDrawer);
  if (overlay) overlay.addEventListener("click", closeDrawer);
  document.addEventListener("click", () => closeDayHeaderEditors());
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeDayHeaderEditors(); });

  if (monthTitle) {
    monthTitle.addEventListener("input", () => {
      state.month = monthTitle.value;
      saveState();
    });
  }

  if (form) form.addEventListener("submit", onSubmit);
  if (duplicateBtn) duplicateBtn.addEventListener("click", duplicateCourse);
  if (deleteBtn) deleteBtn.addEventListener("click", deleteCurrentCourse);
  if (resetBtn) resetBtn.addEventListener("click", resetAll);
  if (exportBtn) exportBtn.addEventListener("click", exportJSON);
  if (printBtn) printBtn.addEventListener("click", printPlanning);
  if (importInput) importInput.addEventListener("change", importJSON);

  slotInput.addEventListener("change", () => {
    if (!timeLabelInput.value.trim()) {
      timeLabelInput.value = defaultTimeForSlot(slotInput.value);
    }
  });

  colorInput.addEventListener("change", () => {
    if (!iconInput.value.trim() || iconInput.dataset.auto === "1") {
      iconInput.value = iconForColor(colorInput.value);
      iconInput.dataset.auto = "1";
    }
  });

  iconInput.addEventListener("input", () => {
    iconInput.dataset.auto = iconInput.value.trim() ? "0" : "1";
    highlightActiveIconSuggestion();
  });

  titleInput.addEventListener("input", () => {
    if (iconInput.dataset.auto === "1" || !iconInput.value.trim()) {
      applySuggestedIcon();
    }
  });

  if (autoIconBtn) {
    autoIconBtn.addEventListener("click", () => applySuggestedIcon(true));
  }
}


function renderIconSuggestions() {
  if (!iconSuggestions) return;
  const items = getSuggestedIcons();
  iconSuggestions.innerHTML = "";

  items.forEach((item) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "icon-chip";
    btn.dataset.icon = item.icon;
    btn.title = item.label;
    btn.innerHTML = `<span class="icon-chip-emoji">${item.icon}</span><span class="icon-chip-text">${item.label}</span>`;
    btn.addEventListener("click", () => {
      iconInput.value = item.icon;
      iconInput.dataset.auto = "0";
      highlightActiveIconSuggestion();
    });
    iconSuggestions.appendChild(btn);
  });

  highlightActiveIconSuggestion();
}

function highlightActiveIconSuggestion() {
  if (!iconSuggestions) return;
  [...iconSuggestions.querySelectorAll(".icon-chip")].forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.icon === iconInput.value.trim());
  });
}

function applySuggestedIcon(forceAuto = false) {
  const icon = suggestIconForCourse(titleInput.value, colorInput.value);
  iconInput.value = icon;
  if (forceAuto) iconInput.dataset.auto = "1";
  highlightActiveIconSuggestion();
}

function fillSelects() {
  dayInput.innerHTML = DAYS.map((d) => `<option value="${d}">${d}</option>`).join("");
  slotInput.innerHTML = SLOTS.map((s) => `<option value="${s.id}">${s.label.replace(/\n/g, " ")}</option>`).join("");
}


function renderDayHeader(day) {
  const head = document.createElement("div");
  const color = state.dayHeaderColors?.[day] || defaultDayHeaderColor(day);
  head.className = `day-head header-color-${color}`;
  head.dataset.day = day;
  head.title = `Couleur de l'entête : ${day}`;

  const label = document.createElement("span");
  label.className = "day-head-label";
  label.textContent = day.toUpperCase();

  const actions = document.createElement("div");
  actions.className = "day-head-actions";

  const addBtn = document.createElement("button");
  addBtn.type = "button";
  addBtn.className = "day-head-add";
  addBtn.title = `Ajouter un cours le ${day}`;
  addBtn.setAttribute("aria-label", `Ajouter un cours le ${day}`);
  addBtn.textContent = "+";

  const editBtn = document.createElement("button");
  editBtn.type = "button";
  editBtn.className = "day-head-edit";
  editBtn.title = `Modifier la couleur de ${day}`;
  editBtn.setAttribute("aria-label", `Modifier la couleur de ${day}`);
  editBtn.textContent = "✎";

  const popover = document.createElement("div");
  popover.className = "day-head-popover";
  popover.hidden = true;

  getColorOptions().forEach((opt) => {
    const swatch = document.createElement("button");
    swatch.type = "button";
    swatch.className = `day-color-swatch header-color-${opt.value}` + (opt.value === color ? " active" : "");
    swatch.title = opt.label;
    swatch.setAttribute("aria-label", `${day} : ${opt.label}`);
    swatch.dataset.color = opt.value;
    swatch.addEventListener("click", (e) => {
      e.stopPropagation();
      state.dayHeaderColors[day] = opt.value;
      saveState();
      renderBoard();
    });
    popover.appendChild(swatch);
  });

  addBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    openCreate(day, "matin_1");
  });

  editBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    closeDayHeaderEditors(head);
    popover.hidden = !popover.hidden;
    head.classList.toggle("editing", !popover.hidden);
  });

  actions.append(addBtn, editBtn);
  head.append(label, actions, popover);
  return head;
}
function renderDayHeaders() {
  DAYS.forEach((day) => {
    const head = document.createElement("div");
    const color = state.dayHeaderColors?.[day] || defaultDayHeaderColor(day);
    head.className = `day-head header-color-${color}`;
    head.dataset.day = day;
    head.title = `Couleur de l'entête : ${day}`;

    const label = document.createElement("span");
    label.className = "day-head-label";
    label.textContent = day.toUpperCase();

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "day-head-edit";
    editBtn.title = `Modifier la couleur de ${day}`;
    editBtn.setAttribute("aria-label", `Modifier la couleur de ${day}`);
    editBtn.textContent = "✎";

    const popover = document.createElement("div");
    popover.className = "day-head-popover";
    popover.hidden = true;

    getColorOptions().forEach((opt) => {
      const swatch = document.createElement("button");
      swatch.type = "button";
      swatch.className = `day-color-swatch header-color-${opt.value}` + (opt.value === color ? " active" : "");
      swatch.title = opt.label;
      swatch.setAttribute("aria-label", `${day} : ${opt.label}`);
      swatch.dataset.color = opt.value;
      swatch.addEventListener("click", (e) => {
        e.stopPropagation();
        state.dayHeaderColors[day] = opt.value;
        saveState();
        renderBoard();
      });
      popover.appendChild(swatch);
    });

    editBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      closeDayHeaderEditors(head);
      popover.hidden = !popover.hidden;
      head.classList.toggle("editing", !popover.hidden);
    });

    head.append(label, editBtn, popover);
    board.appendChild(head);
  });
}

function closeDayHeaderEditors(except = null) {
  [...board.querySelectorAll(".day-head")].forEach((head) => {
    if (except && head === except) return;
    head.classList.remove("editing");
    const popover = head.querySelector(".day-head-popover");
    if (popover) popover.hidden = true;
  });
}

function renderBoard() {
  board.innerHTML = `<div class="corner"></div>`;

  DAYS.forEach((day) => {
    board.appendChild(renderDayHeader(day));
  });

  const isPrintPage = document.body.classList.contains("print-preview-page");

  SLOTS.forEach((slot) => {
    const rowMarks = isPrintPage ? buildStartRowsForPrint(slot.id) : buildStartQuarterMap(slot.id);

    const label = document.createElement("div");
    label.className = `row-label ${slot.cls}` + (slot.id === "apres_1" ? " slot-gap-top" : "");
    label.appendChild(renderRowLabel(slot, rowMarks));
    board.appendChild(label);

    DAYS.forEach((day, index) => {
      const cell = document.createElement("div");
      cell.className = "cell" + (slot.id === "apres_1" ? " slot-gap-top" : "") + (index === DAYS.length - 1 ? " last-col" : "");
      cell.dataset.day = day;
      cell.dataset.slot = slot.id;

      if (isPrintPage) {
        const timeline = renderPrintCellTimeline(day, slot.id, rowMarks);
        cell.appendChild(timeline);
        board.appendChild(cell);
        return;
      }

      cell.style.minHeight = slotHeightPx(slot, rowMarks) + "px";

      const timeline = document.createElement("div");
      timeline.className = "timeline";
      timeline.style.setProperty("--visible-quarters", String(rowMarks.length));

      const addInline = document.createElement("button");
      addInline.type = "button";
      addInline.className = "add-inline";
      addInline.textContent = "+";
      addInline.title = "Ajouter un cours";
      addInline.addEventListener("click", (e) => {
        e.stopPropagation();
        openCreate(day, slot.id);
      });
      timeline.appendChild(addInline);

      const empty = document.createElement("div");
      empty.className = "empty";
      empty.textContent = "+ Ajouter un cours";
      empty.addEventListener("click", () => openCreate(day, slot.id));
      empty.addEventListener("dblclick", () => openCreate(day, slot.id));
      timeline.appendChild(empty);

      const courses = state.courses
        .filter((c) => c.day === day && normalizeSlotId(c.slot) === slot.id)
        .map((c) => normalizeCourse(c))
        .sort((a, b) => a._startMin - b._startMin || a._endMin - b._endMin || a.title.localeCompare(b.title));

      if (courses.length > 0) {
        timeline.classList.add("has-courses");
        const layout = buildLaneLayout(courses);
        layout.forEach((course) => {
          timeline.appendChild(createCard(course, slot, course._lane, course._laneCount, rowMarks));
        });
      }

      timeline.addEventListener("dblclick", () => openCreate(day, slot.id));
      setupDropZone(cell, day, slot.id);
      cell.appendChild(timeline);
      board.appendChild(cell);
    });
  });
}

function renderRowLabel(slot, visibleQuarters = getQuarterMarksForSlot(slot)) {
  const wrap = document.createElement("div");

  const title = document.createElement("div");
  title.className = "row-label-title";
  title.innerHTML = slot.label.replace(/\n/g, "<br>");

  const range = document.createElement("div");
  range.className = "row-label-range";
  range.textContent = `${slot.start.replace(":", "h")} → ${slot.end.replace(":", "h")}`;

  const times = document.createElement("div");
  times.className = "row-label-times";

  for (const m of visibleQuarters) {
    const span = document.createElement("span");
    span.className = (m % 60 === 0) ? "hour" : "quarter";
    span.textContent = formatHourMark(m);
    times.appendChild(span);
  }

  wrap.appendChild(title);
  wrap.appendChild(range);
  wrap.appendChild(times);
  return wrap;
}

function createCard(course, slot, rowIndex = 0, rowCount = 1, visibleQuarters = getQuarterMarksForSlot(slot)) {
  const card = document.createElement("article");
  card.className = `course-card color-${course.color || "blue"}`;
  card.draggable = true;
  card.dataset.id = course.id;

  if (!document.body.classList.contains("print-preview-page")) {
    positionCard(card, course, slot, rowIndex, rowCount, visibleQuarters);
  }

  if (course.description) card.classList.add("has-desc");

  const top = document.createElement("div");
  top.className = "course-top";

  const time = document.createElement("div");
  time.className = "course-time";
  time.textContent = course.timeLabel || "";

  const topMeta = document.createElement("div");
  topMeta.className = "course-meta";

  const difficulty = document.createElement("div");
  difficulty.className = "course-difficulty";
  difficulty.title = `Difficulté : ${course.difficulty || 1} sur 3`;
  difficulty.textContent = difficultyArms(course.difficulty || 1);

  const topActions = document.createElement("div");
  topActions.className = "course-top-actions";

  const edit = button("✎", "course-icon-btn", () => openEdit(course.id), "Modifier");
  const del = button("🗑", "course-icon-btn danger", () => removeCourse(course.id), "Supprimer");
  topActions.append(edit, del);
  topMeta.append(time, difficulty);
  top.append(topMeta, topActions);

  const main = document.createElement("div");
  main.className = "course-main";

  const icon = document.createElement("div");
  icon.className = "course-icon";
  icon.textContent = course.icon || "•";

  const title = document.createElement("div");
  title.className = "course-title";
  title.innerHTML = escapeHtml(course.title).replace(/\n/g, "<br>");

  main.appendChild(icon);
  main.appendChild(title);
  card.appendChild(top);
  card.appendChild(main);

  if (course.description) {
    const desc = document.createElement("div");
    desc.className = "course-desc";
    desc.textContent = course.description;
    card.appendChild(desc);
  }

  card.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("text/plain", course.id);
  });

  card.addEventListener("dblclick", (e) => {
    e.stopPropagation();
    openEdit(course.id);
  });

  return card;
}

function positionCard(card, course, slot, rowIndex, rowCount, visibleQuarters = getQuarterMarksForSlot(slot)) {
  const slotStart = hhmmToMin(slot.start);
  const slotEnd = hhmmToMin(slot.end);
  const safeStart = clamp(course._startMin, slotStart, slotEnd - 15);
  const safeEnd = clamp(course._endMin, safeStart + 15, slotEnd);

  const quarterLookup = new Map(visibleQuarters.map((quarterStart, index) => [quarterStart, index]));
  const topQuarterIndex = quarterLookup.has(safeStart) ? quarterLookup.get(safeStart) : 0;

  const rowHeightPx = getQuarterHeightPx();
  const stackGapPx = 6;
  const totalBlockHeight = rowCount * rowHeightPx + Math.max(0, rowCount - 1) * stackGapPx;
  const slotTopPx = topQuarterIndex * totalBlockHeight;
  const offsetY = rowIndex * (rowHeightPx + stackGapPx);

  card.style.position = "absolute";
  card.style.left = "4px";
  card.style.right = "4px";
  card.style.width = "calc(100% - 8px)";
  card.style.top = (slotTopPx + offsetY) + "px";
  card.style.height = rowHeightPx + "px";
}

function buildLaneLayout(courses) {
  const byStart = new Map();

  courses.forEach((course) => {
    const key = course._startMin;
    if (!byStart.has(key)) byStart.set(key, []);
    byStart.get(key).push(course);
  });

  const orderedStarts = [...byStart.keys()].sort((a, b) => a - b);

  orderedStarts.forEach((startMin) => {
    const group = byStart.get(startMin)
      .sort((a, b) => a._endMin - b._endMin || a.title.localeCompare(b.title));

    const rowCount = group.length;

    group.forEach((course, index) => {
      course._lane = index;
      course._laneCount = rowCount;
    });
  });

  return courses;
}

function buildStartQuarterMap(slotId) {
  const starts = state.courses
    .filter((course) => normalizeSlotId(course.slot) === slotId)
    .map((course) => normalizeCourse(course)._startMin);

  const uniqueStarts = [...new Set(starts)].sort((a, b) => a - b);

  if (uniqueStarts.length) return uniqueStarts;

  const slot = slotById(slotId);
  return getQuarterMarksForSlot(slot);
}

function buildStartRowsForPrint(slotId) {
  const slotCourses = state.courses
    .filter((course) => normalizeSlotId(course.slot) === slotId)
    .map((course) => normalizeCourse(course));

  const starts = [...new Set(slotCourses.map((course) => course._startMin))].sort((a, b) => a - b);
  return starts.length ? starts : getQuarterMarksForSlot(slotById(slotId));
}

function renderPrintCellTimeline(day, slotId, rowStarts) {
  const timeline = document.createElement("div");
  timeline.className = "timeline print-start-only";

  const courses = state.courses
    .filter((c) => c.day === day && normalizeSlotId(c.slot) === slotId)
    .map((c) => normalizeCourse(c))
    .sort((a, b) => a._startMin - b._startMin || a.title.localeCompare(b.title));

  const groups = new Map();
  courses.forEach((course) => {
    const key = course._startMin;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(course);
  });

  rowStarts.forEach((startMin) => {
    const row = document.createElement("div");
    row.className = "time-row";
    row.dataset.start = String(startMin);

    const stack = document.createElement("div");
    stack.className = "time-row-stack";

    const rowCourses = groups.get(startMin) || [];
    rowCourses.forEach((course, index) => {
      stack.appendChild(createCard(course, slotById(slotId), index, rowCourses.length, rowStarts));
    });

    row.appendChild(stack);
    timeline.appendChild(row);
  });

  return timeline;
}

function button(label, className, handler, title = "") {
  const el = document.createElement("button");
  el.type = "button";
  el.className = className;
  el.textContent = label;
  if (title) el.title = title;
  el.addEventListener("click", (e) => {
    e.stopPropagation();
    handler();
  });
  return el;
}

function setupDropZone(cell, day, slot) {
  cell.addEventListener("dragover", (e) => {
    e.preventDefault();
    cell.classList.add("drag-over");
  });
  cell.addEventListener("dragleave", () => cell.classList.remove("drag-over"));
  cell.addEventListener("drop", (e) => {
    e.preventDefault();
    cell.classList.remove("drag-over");
    const courseId = e.dataTransfer.getData("text/plain");
    moveCourseTo(courseId, day, slot);
  });
}

function moveCourseTo(courseId, day, slot) {
  const course = state.courses.find((c) => c.id === courseId);
  if (!course) return;
  course.day = day;
  course.slot = slot;
  if (!course.timeLabel) course.timeLabel = defaultTimeForSlot(slot);
  saveState();
  renderBoard();
}

function openCreate(day = "Lundi", slot = "matin_1") {
  drawerTitle.textContent = "Ajouter un cours";
  form.reset();
  courseIdInput.value = "";
  dayInput.value = day;
  slotInput.value = slot;
  timeLabelInput.value = defaultTimeForSlot(slot);
  colorInput.value = colorForSlot(slot);
  iconInput.value = suggestIconForCourse("", colorInput.value);
  iconInput.dataset.auto = "1";
  highlightActiveIconSuggestion();
  descriptionInput.value = "";
  difficultyInput.value = "1";
  openDrawer();
  titleInput.focus();
}

function openEdit(courseId) {
  const course = state.courses.find((c) => c.id === courseId);
  if (!course) return;
  drawerTitle.textContent = "Modifier un cours";
  courseIdInput.value = course.id;
  titleInput.value = course.title;
  dayInput.value = course.day;
  slotInput.value = normalizeSlotId(course.slot);
  timeLabelInput.value = course.timeLabel || "";
  colorInput.value = course.color || "blue";
  iconInput.value = course.icon || "";
  iconInput.dataset.auto = "0";
  highlightActiveIconSuggestion();
  descriptionInput.value = course.description || "";
  difficultyInput.value = String(course.difficulty || 1);
  openDrawer();
}

function openDrawer() {
  drawer.classList.add("open");
  overlay.classList.add("open");
}

function closeDrawer() {
  drawer.classList.remove("open");
  overlay.classList.remove("open");
}

function onSubmit(e) {
  e.preventDefault();

  const payload = {
    id: courseIdInput.value || id(),
    title: titleInput.value.trim(),
    day: dayInput.value,
    slot: slotInput.value,
    timeLabel: normalizeTimeLabel(timeLabelInput.value.trim() || defaultTimeForSlot(slotInput.value)),
    color: colorInput.value,
    icon: iconInput.value.trim() || iconForColor(colorInput.value),
    description: descriptionInput.value.trim(),
    difficulty: clamp(parseInt(difficultyInput.value, 10) || 1, 1, 3)
  };

  if (!payload.title) {
    alert("Le titre est obligatoire.");
    return;
  }

  const parsed = parseTimeLabel(payload.timeLabel, slotInput.value);
  if (!parsed) {
    alert("Horaire invalide. Exemple attendu : 9h30–10h30");
    return;
  }

  const idx = state.courses.findIndex((c) => c.id === payload.id);
  if (idx >= 0) state.courses[idx] = payload;
  else state.courses.push(payload);

  saveState();
  renderBoard();
  closeDrawer();
}

function duplicateCourse() {
  if (!courseIdInput.value) return;
  const source = state.courses.find((c) => c.id === courseIdInput.value);
  if (!source) return;
  const copy = { ...source, id: id(), title: source.title + " COPIE" };
  state.courses.push(copy);
  saveState();
  renderBoard();
  openEdit(copy.id);
}

function deleteCurrentCourse() {
  if (!courseIdInput.value) return;
  removeCourse(courseIdInput.value);
  closeDrawer();
}

function removeCourse(idToDelete) {
  if (!confirm("Supprimer ce cours ?")) return;
  state.courses = state.courses.filter((c) => c.id !== idToDelete);
  saveState();
  renderBoard();
}

function resetAll() {
  if (!confirm("Réinitialiser tout le planning ?")) return;
  state = deepClone(defaultState);
  state = normalizeState(state);
  monthTitle.value = state.month;
  renderIconSuggestions();
  saveState();
  renderBoard();
  closeDrawer();
}

function exportJSON() {
  const data = { month: monthTitle.value, dayHeaderColors: state.dayHeaderColors, courses: state.courses };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "planning-maison-sport-sante.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function importJSON(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (evt) => {
    try {
      const parsed = JSON.parse(evt.target.result);
      const importedCourses = Array.isArray(parsed) ? parsed : parsed.courses;
      if (!Array.isArray(importedCourses)) throw new Error();

      state.courses = importedCourses.map((c) => normalizeCourse({
        id: c.id || id(),
        title: c.title || "",
        day: DAYS.includes(c.day) ? c.day : "Lundi",
        slot: normalizeSlotId(c.slot),
        timeLabel: c.timeLabel || defaultTimeForSlot(normalizeSlotId(c.slot)),
        color: c.color || "blue",
        icon: c.icon || iconForColor(c.color || "blue"),
        description: c.description || "",
        difficulty: clamp(parseInt(c.difficulty, 10) || 1, 1, 3)
      }, true)).map(stripComputed);

      state.month = parsed.month || monthTitle.value || defaultState.month;
      state.dayHeaderColors = normalizeDayHeaderColors(parsed.dayHeaderColors || state.dayHeaderColors);
      monthTitle.value = state.month;
      saveState();
          renderBoard();
      closeDrawer();
      alert("Import JSON réussi.");
    } catch (err) {
      alert("Fichier JSON invalide.");
    } finally {
      e.target.value = "";
    }
  };
  reader.readAsText(file);
}

function buildVisibleQuarterMap() {
  const map = {};

  SLOTS.forEach((slot) => {
    const visibleSet = new Set();

    state.courses
      .filter((course) => normalizeSlotId(course.slot) === slot.id)
      .map((course) => normalizeCourse(course))
      .forEach((course) => {
        for (let quarter = course._startMin; quarter < course._endMin; quarter += 15) {
          visibleSet.add(quarter);
        }
      });

    const visibleQuarters = [...visibleSet].sort((a, b) => a - b);
    map[slot.id] = visibleQuarters.length ? visibleQuarters : getQuarterMarksForSlot(slot);
  });

  return map;
}

function getQuarterMarksForSlot(slot) {
  const marks = [];
  const startMin = hhmmToMin(slot.start);
  const endMin = hhmmToMin(slot.end);
  for (let minute = startMin; minute < endMin; minute += 15) {
    marks.push(minute);
  }
  return marks;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return deepClone(defaultState);
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.courses)) throw new Error();
    return parsed;
  } catch (e) {
    return deepClone(defaultState);
  }
}

function saveState() {
  state.month = monthTitle.value;
  state.dayHeaderColors = normalizeDayHeaderColors(state.dayHeaderColors);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function printPlanning() {
  if (document.body.classList.contains("print-preview-page")) {
    window.print();
    return;
  }
  window.location.href = "index_impression.html";
}

function bindPrintEvents() {
  if (!document.body.classList.contains("print-preview-page")) return;

  window.addEventListener("beforeprint", () => {
    renderBoard();
  });

  window.addEventListener("afterprint", () => {
    renderBoard();
  });
}


function defaultTimeForSlot(slotId) {
  const slot = slotById(normalizeSlotId(slotId));
  return slot ? slot.defaultTime : "9h30–10h30";
}

function colorForSlot(slotId) {
  if (slotId.startsWith("matin")) return "blue";
  if (slotId.startsWith("apres")) return "orange";
  return "blue";
}

function defaultDayHeaderColor(day) {
  return {
    Lundi: "blue",
    Mardi: "blue",
    Mercredi: "blue",
    Jeudi: "orange",
    Vendredi: "blue"
  }[day] || "blue";
}

function normalizeDayHeaderColors(input) {
  const next = {};
  DAYS.forEach((day) => {
    const color = input?.[day];
    next[day] = isValidColor(color) ? color : defaultDayHeaderColor(day);
  });
  return next;
}

function colorOptionsMarkup(selected = "blue") {
  return getColorOptions().map((opt) => `<option value="${opt.value}"${opt.value === selected ? " selected" : ""}>${opt.label}</option>`).join("");
}

function getColorOptions() {
  return [
    { value:"green", label:"Vert" },
    { value:"blue", label:"Bleu" },
    { value:"orange", label:"Orange" },
    { value:"purple", label:"Violet" },
    { value:"yellow", label:"Jaune" },
    { value:"teal", label:"Turquoise" },
    { value:"coral", label:"Corail" },
    { value:"pink", label:"Rose" },
    { value:"red", label:"Rouge" },
    { value:"slate", label:"Bleu gris" }
  ];
}

function isValidColor(color) {
  return getColorOptions().some((opt) => opt.value === color);
}

function difficultyArms(level) {
  const count = clamp(parseInt(level, 10) || 1, 1, 3);
  return Array.from({ length: count }, () => "💪").join("");
}

function getSuggestedIcons() {
  return [
    { icon:"🚶", label:"Marche" },
    { icon:"🏃", label:"Course / cardio" },
    { icon:"🧘", label:"Yoga / relaxation" },
    { icon:"🤸", label:"Mobilité" },
    { icon:"🏋️", label:"Renforcement" },
    { icon:"🚴", label:"Vélo" },
    { icon:"🧍", label:"Équilibre" },
    { icon:"⏱️", label:"Circuit" },
    { icon:"🥾", label:"Randonnée" },
    { icon:"❤️", label:"Santé" },
    { icon:"🫀", label:"Endurance" },
    { icon:"🩺", label:"Sport santé" },
    { icon:"🫁", label:"Respiration" },
    { icon:"🏊", label:"Natation" },
    { icon:"🤾", label:"Activité" },
    { icon:"⚽", label:"Sport collectif" }
  ];
}

function iconForColor(color) {
  const map = {
    green: "🧘",
    blue: "🧍",
    orange: "🏃",
    purple: "⏱️",
    yellow: "❤️",
    teal: "🚴",
    coral: "🫀",
    pink: "🤸",
    red: "🏋️",
    slate: "🩺"
  };
  return map[color] || "🤾";
}

function suggestIconForCourse(title, color) {
  const text = String(title || "").toLowerCase();

  if (/marche|balade|randonn|pied|walking/.test(text)) return "🚶";
  if (/cardio|course|running|endurance/.test(text)) return "🏃";
  if (/relax|yoga|souplesse|étire|etire|zen/.test(text)) return "🧘";
  if (/mobilit|coordination|agilit|gym douce|mouvement/.test(text)) return "🤸";
  if (/renfo|muscu|force|halt|poids|tonic/.test(text)) return "🏋️";
  if (/velo|bike|cycling/.test(text)) return "🚴";
  if (/équil|equil|posture|stabil/.test(text)) return "🧍";
  if (/circuit|atelier|hiit|interval/.test(text)) return "⏱️";
  if (/rando|nature|trail/.test(text)) return "🥾";
  if (/respir|souffle|pulmo/.test(text)) return "🫁";
  if (/natation|piscine|aqua/.test(text)) return "🏊";
  if (/santé|sante|forme/.test(text)) return iconForColor(color);
  return iconForColor(color);
}

function slotById(slotId) {
  return SLOTS.find((s) => s.id === slotId) || SLOTS[0];
}

function normalizeSlotId(slotId) {
  if (slotId === "midi_1") return "matin_1";
  if (slotId === "soir_1" || slotId === "apres_2") return "apres_1";
  return SLOTS.some((s) => s.id === slotId) ? slotId : "matin_1";
}

function normalizeState(inputState) {
  const next = deepClone(inputState || defaultState);
  next.month = next.month || defaultState.month;
  next.dayHeaderColors = normalizeDayHeaderColors(next.dayHeaderColors);
  next.courses = (Array.isArray(next.courses) ? next.courses : []).map((course) => stripComputed(normalizeCourse(course, true)));
  return next;
}

function normalizeCourse(course, keepComputed = false) {
  const clean = {
    id: course.id || id(),
    title: course.title || "",
    day: DAYS.includes(course.day) ? course.day : "Lundi",
    slot: normalizeSlotId(course.slot),
    timeLabel: normalizeTimeLabel(course.timeLabel || defaultTimeForSlot(normalizeSlotId(course.slot))),
    color: isValidColor(course.color) ? course.color : "blue",
    icon: course.icon || suggestIconForCourse(course.title || "", course.color || "blue"),
    description: course.description || "",
    difficulty: clamp(parseInt(course.difficulty, 10) || 1, 1, 3)
  };

  const parsed = parseTimeLabel(clean.timeLabel, clean.slot);
  clean._startMin = parsed.startMin;
  clean._endMin = parsed.endMin;
  if (!keepComputed) return clean;
  return clean;
}

function stripComputed(course) {
  const copy = { ...course };
  delete copy._startMin;
  delete copy._endMin;
  delete copy._lane;
  delete copy._laneCount;
  return copy;
}

function parseTimeLabel(timeLabel, slotId) {
  const slot = slotById(normalizeSlotId(slotId));
  const match = String(timeLabel || "")
    .replace(/\s+/g, "")
    .match(/^(\d{1,2})[h:](\d{2})[–\-—](\d{1,2})[h:](\d{2})$/i);

  if (!match) {
    const startMin = hhmmToMin(slot.start);
    const endMin = Math.min(startMin + 60, hhmmToMin(slot.end));
    return { startMin, endMin };
  }

  let startMin = parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
  let endMin = parseInt(match[3], 10) * 60 + parseInt(match[4], 10);
  if (endMin <= startMin) endMin = startMin + 60;

  const slotStart = hhmmToMin(slot.start);
  const slotEnd = hhmmToMin(slot.end);

  startMin = snapToQuarter(clamp(startMin, slotStart, slotEnd - 15));
  endMin = snapToQuarter(clamp(endMin, startMin + 15, slotEnd));

  return { startMin, endMin };
}

function normalizeTimeLabel(timeLabel) {
  return String(timeLabel || "")
    .replace(/\s*-\s*/g, "–")
    .replace(/\s*—\s*/g, "–")
    .replace(/\s*–\s*/g, "–")
    .replace(/(\d{1,2})h(\d{2})/g, "$1h$2")
    .trim();
}

function hhmmToMin(value) {
  const [h, m] = String(value).split(":").map(Number);
  return h * 60 + m;
}

function snapToQuarter(value) {
  return Math.round(value / 15) * 15;
}

function slotHeightPx(slot, visibleQuarters = getQuarterMarksForSlot(slot)) {
  const rowHeightPx = getQuarterHeightPx();
  return Math.max(visibleQuarters.length, 1) * rowHeightPx;
}


function getQuarterHeightPx() {
  const raw = getComputedStyle(document.documentElement).getPropertyValue("--quarter-height").trim();
  const value = parseFloat(raw);
  return Number.isFinite(value) && value > 0 ? value : 72;
}

function formatHourMark(mins) {
  const h = String(Math.floor(mins / 60)).padStart(2, "0");
  const m = String(mins % 60).padStart(2, "0");
  return `${h}h${m}`;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function id() {
  return Math.random().toString(36).slice(2, 10);
}

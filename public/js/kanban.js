requireAuth();
renderNav("kanban");

const me = getUser();
const isAdmin = me?.role === "admin";
if (!isAdmin) document.getElementById("btn-add-col").style.display = "none";

let columns = [];
let allDeals = [];
let selected = new Set();
let editId = null;
let editColId = null;
let activePopup = null;

// ── ЗАГРУЗКА ────────────────────────────────────────────────
async function loadBoard() {
  const board = document.getElementById("board");
  try {
    const [cols, deals, users] = await Promise.all([
      apiFetch("/deal-columns"),
      apiFetch("/call-deals"),
      apiFetch("/users").catch(() => []),
    ]);
    columns = cols;
    allDeals = deals;
    fillSelects(cols, users);
    renderBoard(cols, deals);
  } catch {
    board.innerHTML = '<div class="empty">Ошибка загрузки</div>';
  }
}

function fillSelects(cols, users) {
  const colOpts = cols
    .map((c) => '<option value="' + c.id + '">' + c.name + "</option>")
    .join("");
  document.getElementById("f-column").innerHTML = colOpts;
  document.getElementById("f-target-col").innerHTML = colOpts;

  const userOpts = users
    .map((u) => '<option value="' + u.id + '">' + u.name + "</option>")
    .join("");
  document.getElementById("f-assigned").innerHTML = userOpts;
}

// ── РЕНДЕР ──────────────────────────────────────────────────
function renderBoard(cols, deals) {
  const board = document.getElementById("board");
  board.innerHTML = "";
  if (!cols.length) {
    board.innerHTML = '<div class="empty">Нет столбцов. Создайте первый.</div>';
    return;
  }
  cols.forEach((col) => {
    const colDeals = deals.filter((d) => d.column_id === col.id);
    board.appendChild(buildColumn(col, colDeals));
  });
  initSortable();
}

// Цвет текста — белый или тёмный в зависимости от фона
function textColor(hex) {
  const r = parseInt(hex.slice(1, 3), 16),
    g = parseInt(hex.slice(3, 5), 16),
    b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 128 ? "#1a1a2e" : "#ffffff";
}

function buildColumn(col, deals) {
  const wrap = document.createElement("div");
  wrap.className = "k-column";
  wrap.dataset.colId = col.id;

  const headerBg = col.color || "#4361ee";
  const headerText = textColor(headerBg);

  wrap.innerHTML =
    '<div class="k-col-header" style="background:' +
    headerBg +
    ";color:" +
    headerText +
    '">' +
    '<div class="k-col-title">' +
    col.name +
    '<span class="k-col-count">' +
    deals.length +
    "</span>" +
    "</div>" +
    (isAdmin
      ? '<button class="k-col-menu" style="color:' +
        headerText +
        '" onclick="deleteCol(\'' +
        col.id +
        '\')" title="Удалить столбец">···</button>'
      : "") +
    "</div>" +
    '<div class="k-col-body" data-col="' +
    col.id +
    '">' +
    deals.map(buildCard).join("") +
    "</div>" +
    '<div class="k-col-footer">' +
    '<button class="btn-add-card" onclick="openAdd(\'' +
    col.id +
    "')\">+ Добавить</button>" +
    "</div>";

  return wrap;
}

function buildCard(deal) {
  const cb = deal.callback_at ? new Date(deal.callback_at) : null;
  const overdue = cb && cb < new Date();
  const cbLabel = cb ? formatDateTime(deal.callback_at) : null;

  return (
    '<div class="k-card' +
    (selected.has(deal.id) ? " selected" : "") +
    '" data-id="' +
    deal.id +
    '" onclick="cardClick(event, this, ' +
    JSON.stringify(deal).replace(/"/g, "&quot;") +
    ')">' +
    '<div class="card-top">' +
    '<div class="card-client-name">' +
    (deal.name || "Без имени") +
    "</div>" +
    '<button class="card-menu-btn" onclick="event.stopPropagation();openEdit(' +
    JSON.stringify(deal).replace(/"/g, "&quot;") +
    ')">⋮</button>' +
    "</div>" +
    '<div class="card-phone-row">📞 <span>' +
    deal.phone +
    "</span></div>" +
    (cbLabel
      ? '<div class="card-callback-badge' +
        (overdue ? " overdue" : "") +
        '">⏰ ' +
        cbLabel +
        "</div>"
      : "") +
    '<input type="checkbox" class="card-checkbox"' +
    (selected.has(deal.id) ? " checked" : "") +
    " onclick=\"event.stopPropagation();toggleSelect('" +
    deal.id +
    "')\">" +
    "</div>"
  );
}

// ── ПОПАП КАРТОЧКИ ──────────────────────────────────────────
function cardClick(event, cardEl, deal) {
  if (
    event.target.type === "checkbox" ||
    event.target.classList.contains("card-menu-btn")
  )
    return;
  closePopup();

  const popup = document.createElement("div");
  popup.className = "card-popup";
  popup.id = "card-popup";

  const rect = cardEl.getBoundingClientRect();
  popup.style.top = rect.top + window.scrollY + "px";
  popup.style.left = rect.right + 10 + "px";

  // Если попап вылезет за правый край — показать слева
  if (rect.right + 280 > window.innerWidth) {
    popup.style.left = rect.left - 270 + "px";
  }

  popup.innerHTML =
    '<button class="popup-close" onclick="closePopup()">×</button>' +
    '<div class="popup-section-label">Client</div>' +
    '<div class="popup-value">' +
    (deal.name || "—") +
    "</div>" +
    '<div class="popup-section-label">Phone</div>' +
    '<div class="popup-phone">' +
    deal.phone +
    "</div>" +
    (deal.company
      ? '<div class="popup-section-label">Company</div><div class="popup-value">' +
        deal.company +
        "</div>"
      : "") +
    '<div class="popup-section-label">Notes</div>' +
    '<textarea class="popup-notes" id="popup-notes" placeholder="Добавить заметку...">' +
    (deal.description || "") +
    "</textarea>" +
    '<div class="popup-btn-row">' +
    '<button class="btn btn-primary" style="font-size:12px" onclick="saveNotes(\'' +
    deal.id +
    "')\">Сохранить заметку</button>" +
    '<button class="btn btn-outline" style="font-size:12px" onclick="openEdit(' +
    JSON.stringify(deal).replace(/"/g, "&quot;") +
    ');closePopup()">Edit Details</button>' +
    '<button class="btn btn-danger" style="font-size:12px" onclick="deleteDeal(\'' +
    deal.id +
    "')\">Удалить</button>" +
    "</div>";

  document.body.appendChild(popup);
  activePopup = popup;

  // Закрыть попап если кликнули вне
  setTimeout(() => {
    document.addEventListener("click", outsidePopupClick);
  }, 0);
}

function outsidePopupClick(e) {
  if (activePopup && !activePopup.contains(e.target)) {
    closePopup();
  }
}

function closePopup() {
  document.getElementById("card-popup")?.remove();
  activePopup = null;
  document.removeEventListener("click", outsidePopupClick);
}

async function saveNotes(dealId) {
  const notes = document.getElementById("popup-notes")?.value;
  try {
    await apiFetch("/call-deals/" + dealId, {
      method: "PUT",
      body: JSON.stringify({ description: notes }),
    });
    showToast("Сохранено", "Заметка обновлена");
    closePopup();
    // Обновить в локальном массиве без перезагрузки
    const d = allDeals.find((x) => x.id === dealId);
    if (d) d.description = notes;
  } catch {
    showToast("Ошибка", "Не удалось сохранить", "warning");
  }
}

// ── DRAG & DROP ─────────────────────────────────────────────
function initSortable() {
  document.querySelectorAll(".k-col-body").forEach((el) => {
    Sortable.create(el, {
      group: "deals",
      animation: 150,
      ghostClass: "sortable-ghost",
      onEnd: handleDrop,
    });
  });
}

async function handleDrop(evt) {
  const dealId = evt.item.dataset.id;
  const toCol = evt.to.dataset.col;
  const fromCol = evt.from.dataset.col;
  if (toCol === fromCol) return;

  try {
    await apiFetch("/call-deals/" + dealId + "/move", {
      method: "PATCH",
      body: JSON.stringify({ targetColumnId: toCol }),
    });
    updateCount(fromCol, -1);
    updateCount(toCol, 1);
  } catch {
    showAlert(document.getElementById("alert"), "Не удалось переместить");
    loadBoard();
  }
}

function updateCount(colId, delta) {
  const col = document.querySelector('.k-column[data-col-id="' + colId + '"]');
  if (!col) return;
  const badge = col.querySelector(".k-col-count");
  if (badge)
    badge.textContent = Math.max(0, parseInt(badge.textContent || 0) + delta);
}

// ── BULK SELECT / MOVE ──────────────────────────────────────
function toggleSelect(id) {
  if (selected.has(id)) selected.delete(id);
  else selected.add(id);
  updateBulkBar();
}

function updateBulkBar() {
  const n = selected.size;
  document.getElementById("bulk-info").textContent = n ? "Выбрано: " + n : "";
  document.getElementById("btn-bulk-move").style.display = n
    ? "inline-flex"
    : "none";
}

document.getElementById("btn-bulk-move").onclick = () => {
  document.getElementById("move-modal").classList.add("open");
};
document.getElementById("move-cancel").onclick = () =>
  document.getElementById("move-modal").classList.remove("open");

document.getElementById("move-confirm").onclick = async () => {
  const targetColumnId = document.getElementById("f-target-col").value;
  try {
    await apiFetch("/call-deals/bulk-move", {
      method: "POST",
      body: JSON.stringify({ dealIds: Array.from(selected), targetColumnId }),
    });
    document.getElementById("move-modal").classList.remove("open");
    showToast(
      "Задача запущена",
      "Перемещение " + selected.size + " карточек...",
    );
    selected.clear();
    updateBulkBar();
    setTimeout(loadBoard, 1200);
  } catch {
    showToast("Ошибка", "Не удалось запустить задачу", "warning");
  }
};

// ── ДОБАВИТЬ / РЕДАКТИРОВАТЬ СДЕЛКУ ─────────────────────────
function openAdd(colId) {
  editId = null;
  editColId = colId;
  document.getElementById("deal-modal-title").textContent = "Новый звонок";
  document.getElementById("f-phone").value = "";
  document.getElementById("f-cname").value = "";
  document.getElementById("f-company").value = "";
  document.getElementById("f-notes").value = "";
  document.getElementById("f-callback").value = "";
  document.getElementById("f-column").value = colId;
  document.getElementById("deal-alert").innerHTML = "";
  document.getElementById("deal-modal").classList.add("open");
}

function openEdit(deal) {
  editId = deal.id;
  editColId = deal.column_id;
  document.getElementById("deal-modal-title").textContent = "Редактировать";
  document.getElementById("f-phone").value = deal.phone || "";
  document.getElementById("f-cname").value = deal.name || "";
  document.getElementById("f-company").value = deal.company || "";
  document.getElementById("f-notes").value = deal.description || "";
  document.getElementById("f-callback").value = deal.callback_at
    ? new Date(deal.callback_at).toISOString().slice(0, 16)
    : "";
  document.getElementById("f-assigned").value = deal.assigned_to || "";
  document.getElementById("f-column").value = deal.column_id || "";
  document.getElementById("deal-alert").innerHTML = "";
  document.getElementById("deal-modal").classList.add("open");
}

document.getElementById("btn-new-call").onclick = () =>
  openAdd(columns[0]?.id || "");
document.getElementById("deal-cancel").onclick = () =>
  document.getElementById("deal-modal").classList.remove("open");

document.getElementById("deal-save").onclick = async () => {
  const colId = document.getElementById("f-column").value;
  const body = {
    column_id: colId,
    phone: document.getElementById("f-phone").value,
    name: document.getElementById("f-cname").value || null,
    company: document.getElementById("f-company").value || null,
    description: document.getElementById("f-notes").value || null,
    callback_at: document.getElementById("f-callback").value || null,
    assigned_to: document.getElementById("f-assigned").value || me?.id,
  };
  const alertEl = document.getElementById("deal-alert");
  try {
    if (editId) {
      await apiFetch("/call-deals/" + editId, {
        method: "PUT",
        body: JSON.stringify(body),
      });
    } else {
      await apiFetch("/call-deals", {
        method: "POST",
        body: JSON.stringify(body),
      });
    }
    document.getElementById("deal-modal").classList.remove("open");
    loadBoard();
  } catch (err) {
    const d = err.data?.errors;
    showAlert(
      alertEl,
      Array.isArray(d)
        ? d.map((e) => e.message).join(", ")
        : err.data?.error || "Ошибка",
    );
  }
};

// ── СТОЛБЦЫ ──────────────────────────────────────────────────
document.getElementById("btn-add-col").onclick = () => {
  document.getElementById("f-col-name").value = "";
  document.getElementById("col-alert").innerHTML = "";
  document.getElementById("col-modal").classList.add("open");
};
document.getElementById("col-cancel").onclick = () =>
  document.getElementById("col-modal").classList.remove("open");

document.getElementById("col-save").onclick = async () => {
  try {
    await apiFetch("/deal-columns", {
      method: "POST",
      body: JSON.stringify({
        name: document.getElementById("f-col-name").value,
        color: document.getElementById("f-col-color").value,
      }),
    });
    document.getElementById("col-modal").classList.remove("open");
    loadBoard();
  } catch (err) {
    showAlert(
      document.getElementById("col-alert"),
      err.data?.error || "Ошибка",
    );
  }
};

async function deleteCol(id) {
  if (!confirm("Удалить столбец?")) return;
  try {
    await apiFetch("/deal-columns/" + id, { method: "DELETE" });
    loadBoard();
  } catch {
    showAlert(document.getElementById("alert"), "Не удалось удалить столбец");
  }
}

// ── УДАЛИТЬ СДЕЛКУ ──────────────────────────────────────────
async function deleteDeal(id) {
  closePopup();
  if (!confirm("Удалить карточку?")) return;
  try {
    await apiFetch("/call-deals/" + id, { method: "DELETE" });
    loadBoard();
  } catch {
    showAlert(document.getElementById("alert"), "Не удалось удалить");
  }
}

// ── SOCKET.IO ────────────────────────────────────────────────
function connectSocket() {
  if (typeof io === "undefined") return;
  const socket = io("/", {
    auth: { token: getToken() },
    reconnectionAttempts: 5,
  });
  socket.on("connect", () => console.log("[WS] подключён"));
  socket.on("disconnect", () => console.log("[WS] отключён"));
  // Когда воркер завершил bulk-move — обновить доску
  socket.on("bulk_move_done", () => {
    showToast("Готово", "Карточки перемещены");
    loadBoard();
  });
  // Напоминание о перезвонке
  socket.on("reminder", (d) =>
    showToast("⏰ Перезвонить", d.clientName + " · " + d.phone, "warning"),
  );
}

loadBoard();
connectSocket();

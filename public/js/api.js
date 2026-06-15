const API_BASE = window.API_BASE || window.location.origin;
window.API_BASE = API_BASE;
const RATE_LIMIT = 50;
const RATE_WINDOW_MS = 60 * 1000;
let requestTimestamps = [];

function nowMs() {
  return Date.now();
}

async function waitForRateSlot() {
  for (;;) {
    const now = nowMs();
    requestTimestamps = requestTimestamps.filter(
      (t) => now - t < RATE_WINDOW_MS,
    );
    if (requestTimestamps.length < RATE_LIMIT) {
      requestTimestamps.push(now);
      return;
    }
    const earliest = requestTimestamps[0];
    const wait = RATE_WINDOW_MS - (now - earliest) + 50;
    await new Promise((r) => setTimeout(r, wait));
  }
}

function getToken() {
  return localStorage.getItem("accessToken");
}
function getRefreshToken() {
  return localStorage.getItem("refreshToken");
}
function setTokens(access, refresh) {
  localStorage.setItem("accessToken", access);
  if (refresh) localStorage.setItem("refreshToken", refresh);
}
function clearTokens() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("crm_user");
}
function getUser() {
  try {
    return JSON.parse(localStorage.getItem("crm_user"));
  } catch {
    return null;
  }
}
function requireAuth() {
  if (!getToken()) window.location.href = "/html/login.html";
}

async function tryRefresh() {
  const rt = getRefreshToken();
  if (!rt) return false;
  try {
    const res = await fetch(API_BASE + "/users/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: rt }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    setTokens(data.accessToken, null);
    return true;
  } catch {
    return false;
  }
}

async function apiFetch(path, options = {}) {
  await waitForRateSlot();
  const token = getToken();
  const isFormData = options.body instanceof FormData;
  const headers = { ...(options.headers || {}) };
  if (!isFormData) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = "Bearer " + token;

  let res = await fetch(API_BASE + path, { ...options, headers });

  let retries = 0;
  while (res.status === 429 && retries < 4) {
    const backoff = Math.pow(2, retries) * 500 + Math.random() * 200;
    await new Promise((r) => setTimeout(r, backoff));
    await waitForRateSlot();
    res = await fetch(API_BASE + path, { ...options, headers });
    retries++;
  }

  if (res.status === 401) {
    const ok = await tryRefresh();
    if (ok) {
      headers["Authorization"] = "Bearer " + getToken();
      res = await fetch(API_BASE + path, { ...options, headers });
    } else {
      clearTokens();
      window.location.href = "/html/login.html";
      return;
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Ошибка сервера" }));
    throw { status: res.status, data: err };
  }

  const text = await res.text();
  return text ? JSON.parse(text) : {};
}

function showAlert(el, msg, type = "error") {
  el.innerHTML = '<div class="alert alert-' + type + '">' + msg + "</div>";
}

function formatDate(str) {
  if (!str) return "—";
  return new Date(str).toLocaleDateString("ru-RU");
}

function formatDateTime(str) {
  if (!str) return null;
  return new Date(str).toLocaleString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
  });
}

function showToast(title, body, type) {
  let area = document.getElementById("toast-area");
  if (!area) {
    area = document.createElement("div");
    area.id = "toast-area";
    document.body.appendChild(area);
  }
  const t = document.createElement("div");
  t.className = "toast" + (type === "warning" ? " toast-warning" : "");
  t.innerHTML =
    '<div class="toast-title">' +
    title +
    "</div>" +
    (body ? '<div class="toast-body">' + body + "</div>" : "");
  area.appendChild(t);
  setTimeout(() => t.remove(), 4000);
}

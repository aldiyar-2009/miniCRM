const API_BASE = "http://localhost:3000";

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
  localStorage.removeItem("user");
}

function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
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
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  if (token) headers["Authorization"] = "Bearer " + token;

  let res = await fetch(API_BASE + path, { ...options, headers });

  if (res.status === 401) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      headers["Authorization"] = "Bearer " + getToken();
      res = await fetch(API_BASE + path, { ...options, headers });
    } else {
      clearTokens();
      window.location.href = "/minicrm-out/public/html/login.html";
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

function requireAuth() {
  if (!getToken()) {
    window.location.href = "/minicrm-out/public/html/login.html";
  }
}

function showAlert(container, message, type = "error") {
  container.innerHTML =
    '<div class="alert alert-' + type + '">' + message + "</div>";
}

function formatDate(str) {
  if (!str) return "—";
  return new Date(str).toLocaleDateString("ru-RU");
}

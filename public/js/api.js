// Выбираем базовый URL API: если фронтенд запущен с порта 5500
// (например Live Server), направляем запросы на локальный бэкенд на 3000.
const API_BASE_URL = (function () {
  try {
    const loc = window.location;
    // Если dev-сервер (Live Server) на 5500 — направляем на backend:3000
    if (loc.hostname === "127.0.0.1" || loc.hostname === "localhost") {
      if (loc.port === "5500")
        return loc.protocol + "//" + loc.hostname + ":3000";
    }
    return loc.origin;
  } catch (e) {
    return "http://localhost:3000";
  }
})();

$.ajaxSetup({
  beforeSend: function (xhr) {
    const token = localStorage.getItem("token");
    if (token) {
      xhr.setRequestHeader("Authorization", "Bearer " + token);
    }
  },
});

/**
 * @param {string} url
 * @param {string} method
 * @param {object} data
 * @returns {jQuery.Deferred}
 */
function apiRequest(url, method = "GET", data = null) {
  const options = {
    url: API_BASE_URL + url,
    type: method,
    contentType: "application/json; charset=utf-8",
    dataType: "json",

    xhrFields: {
      withCredentials: true,
    },
  };

  if (method !== "GET" && data !== null) {
    options.data = JSON.stringify(data);
  }

  return $.ajax(options);
}

const api = {
  get: (url) => apiRequest(url, "GET"),
  post: (url, data) => apiRequest(url, "POST", data),
  put: (url, data) => apiRequest(url, "PUT", data),
  delete: (url) => apiRequest(url, "DELETE"),
};

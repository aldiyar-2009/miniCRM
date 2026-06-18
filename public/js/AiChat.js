// Текущая выбранная сессия (диалог)
let currentSessionId = null;

// Заголовок для $.ajax — токен авторизации
function authHeaders() {
  return {
    Authorization: "Bearer " + getToken(),
    "Content-Type": "application/json",
  };
}

// Показать сообщение в окне чата
function showMessage(text, cssClass) {
  const html = `<div class="ai-message ${cssClass}">${text}</div>`;
  $("#ai-chat-display").append(html);
  $("#ai-chat-display").scrollTop($("#ai-chat-display")[0].scrollHeight);
}

// Очистить окно чата
function clearChat() {
  $("#ai-chat-display").empty();
}

// Загрузить список диалогов с сервера
function loadSessions() {
  $.ajax({
    url: API_BASE + "/chat/sessions",
    method: "GET",
    headers: authHeaders(),
    success: function (res) {
      const list = $("#session-list");
      list.empty();

      (res.data || []).forEach(function (session) {
        const li = $("<li></li>")
          .text(session.title)
          .attr("data-id", session.id);

        if (session.id === currentSessionId) {
          li.addClass("active");
        }

        li.on("click", function () {
          openSession(session.id);
        });

        list.append(li);
      });
    },
    error: function (xhr) {
      console.error("Ошибка загрузки диалогов:", xhr.responseJSON);
    },
  });
}

// Открыть выбранный диалог и подгрузить историю
function openSession(sessionId) {
  currentSessionId = sessionId;
  clearChat();

  $("#session-list li").removeClass("active");
  $(`#session-list li[data-id="${sessionId}"]`).addClass("active");

  $.ajax({
    url: API_BASE + "/chat/history?session_id=" + sessionId,
    method: "GET",
    headers: authHeaders(),
    success: function (res) {
      (res.data || []).forEach(function (msg) {
        showMessage(msg.user_message, "user-question");
        if (msg.ai_response) {
          showMessage(msg.ai_response, "ai-response");
        }
      });
    },
    error: function (xhr) {
      showMessage("Не удалось загрузить историю", "ai-response");
    },
  });
}

// Создать новый диалог
function createSession() {
  $.ajax({
    url: API_BASE + "/chat/sessions",
    method: "POST",
    headers: authHeaders(),
    data: JSON.stringify({ title: "Новый диалог" }),
    success: function (session) {
      currentSessionId = session.id;
      clearChat();
      loadSessions();
    },
  });
}

// Отправить сообщение AI
$("#ai-chat-form").on("submit", function (e) {
  e.preventDefault();

  const message = $("#userMessage").val().trim();
  const crm_deal_id = $("#crmDealId").val().trim() || null;

  if (!message) return;

  if (!currentSessionId) {
    alert("Сначала создайте или выберите диалог");
    return;
  }

  showMessage(message, "user-question");
  $("#userMessage").val("");

  $.ajax({
    url: API_BASE + "/chat",
    method: "POST",
    headers: authHeaders(),
    data: JSON.stringify({
      message: message,
      session_id: currentSessionId,
      crm_deal_id: crm_deal_id,
    }),
    success: function (res) {
      showMessage(res.answer || "Нет ответа", "ai-response");
      loadSessions();
    },
    error: function (xhr) {
      const err = xhr.responseJSON?.message || "Ошибка сервера";
      showMessage("Ошибка: " + err, "ai-response");
    },
  });
});

$("#btn-new-session").on("click", createSession);

// При открытии страницы — загружаем список диалогов
loadSessions();

// Если пришли со страницы сделок — подставляем ID
const urlParams = new URLSearchParams(window.location.search);
const dealFromUrl = urlParams.get("crm_deal_id");
if (dealFromUrl) {
  $("#crmDealId").val(dealFromUrl);
}

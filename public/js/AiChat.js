let currentSessionId = null;

function authHeaders() {
  return {
    Authorization: "Bearer " + getToken(),
    "Content-Type": "application/json",
  };
}

function showMessage(text, cssClass, sources) {
  let html = `<div class="ai-message ${cssClass}">${text}`;

  if (sources && sources.length > 0) {
    html += `<div class="ai-sources">Источники: `;
    html += sources
      .map(function (s) {
        return `<a href="#" class="source-link" data-doc="${s.fileName}">${s.fileName}</a>`;
      })
      .join(", ");
    html += `</div>`;
  }

  html += `</div>`;
  $("#ai-chat-display").append(html);
  $("#ai-chat-display").scrollTop($("#ai-chat-display")[0].scrollHeight);
}

function clearChat() {
  $("#ai-chat-display").empty();
}

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
      showMessage(res.answer || "Нет ответа", "ai-response", res.sources);
      loadSessions();
    },
    error: function (xhr) {
      const err = xhr.responseJSON?.message || "Ошибка сервера";
      showMessage("Ошибка: " + err, "ai-response");
    },
  });
});

$("#btn-new-session").on("click", createSession);

function loadDocuments() {
  $.ajax({
    url: API_BASE + "/knowledge/documents",
    method: "GET",
    headers: authHeaders(),
    success: function (res) {
      const list = $("#document-list");
      list.empty();
      (res.data || []).forEach(function (doc) {
        const li = $("<li></li>").text(
          doc.fileName + " (" + doc.chunksCount + " чанков)",
        );
        list.append(li);
      });
    },
    error: function (xhr) {
      console.error("Ошибка загрузки документов:", xhr.responseJSON);
    },
  });
}

$("#knowledge-upload-form").on("submit", function (e) {
  e.preventDefault();

  const fileInput = $("#documentFile")[0];
  const file = fileInput.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("document", file);

  $("#knowledge-status").text("Загрузка...");

  $.ajax({
    url: API_BASE + "/knowledge/upload",
    method: "POST",
    headers: { Authorization: "Bearer " + getToken() },
    data: formData,
    processData: false,
    contentType: false,
    success: function (res) {
      $("#knowledge-status").text(
        "Документ загружен: " + res.document.fileName,
      );
      fileInput.value = "";
      loadDocuments();
    },
    error: function (xhr) {
      const err = xhr.responseJSON?.message || "Ошибка загрузки файла";
      $("#knowledge-status").text("Ошибка: " + err);
    },
  });
});

loadSessions();
loadDocuments();

const urlParams = new URLSearchParams(window.location.search);
const dealFromUrl = urlParams.get("crm_deal_id");
if (dealFromUrl) {
  $("#crmDealId").val(dealFromUrl);
}

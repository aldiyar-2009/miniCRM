// errors.js — простой обработчик ошибок для AJAX-запросов.
// Очищает старые ошибки и подсвечивает новые, если бэкенд вернул ошибку 400.

// Функция для очистки ошибок на форме
function clearErrors() {
  // Убираем красную рамку у всех полей ввода и выбора
  $("input, select").css("border-color", "");
  // Очищаем текст во всех спанах для ошибок
  $(".error-text").text("");
}

// Функция для разбора ошибок бэкенда в блоке .fail()
function handleAjaxError(xhr) {
  const status = xhr.status;
  const response = xhr.responseJSON;

  // Если сервер выключен
  if (status === 0) {
    alert("Нет связи с сервером. Проверьте, запущен ли бэкенд.");
    return;
  }

  // Ошибка 400 — неверный ввод (валидация Joi)
  if (status === 400) {
    if (response && response.errors) {
      alert("Ошибка заполнения формы. Исправьте ошибки под полями.");
      
      // Перебираем массив ошибок от Joi
      response.errors.forEach(function (errorItem) {
        const field = errorItem.path[0]; // имя поля (например, "name", "email" или "password")
        const message = errorItem.message; // текст ошибки

        let $input = $();
        let $span = $();

        // Если сейчас видна форма логина, ищем поля входа с префиксом -login-
        if ($("#form-login").is(":visible")) {
          $input = $("#inp-login-" + field);
          $span = $("#error-login-" + field);
        }

        // Если сейчас видна форма регистрации, ищем поля с префиксом -register-
        if ($("#form-register").is(":visible")) {
          $input = $("#inp-register-" + field);
          $span = $("#error-register-" + field);
        }

        // Если не нашли или открыта панель CRM, ищем обычные поля
        if ($input.length === 0) {
          $input = $("#inp-" + field);
        }
        if ($input.length === 0) {
          $input = $("#select-" + field);
        }
        if ($span.length === 0) {
          $span = $("#error-" + field);
        }

        // Красим рамку поля в красный цвет
        if ($input.length > 0) {
          $input.css("border-color", "red");
        }

        // Записываем текст ошибки в нужный span с классом error-text
        if ($span.length > 0) {
          $span.text(message).css("color", "red");
        }
      });
    } else {
      alert("Ошибка запроса (400): " + (response?.error || "Проверьте вводимые данные"));
    }
    return;
  }

  // Ошибка 404 — данные не найдены
  if (status === 404) {
    alert("Не найдено (404): " + (response?.error || "Запрашиваемые данные отсутствуют."));
    return;
  }

  // Ошибка 409 — конфликт данных (дубликаты)
  if (status === 409) {
    alert("Конфликт данных (409): " + (response?.error || "Такой объект уже есть."));
    return;
  }

  // Ошибка 500 — сбой на сервере
  if (status === 500) {
    alert("Внутренняя ошибка сервера (500).");
    return;
  }

  // Другие ошибки
  alert("Произошла ошибка (код " + status + "): " + (response?.error || xhr.statusText));
}

// Привязываем функции к объекту window, чтобы они были доступны в других js-файлах
window.clearErrors = clearErrors;
window.handleAjaxError = handleAjaxError;

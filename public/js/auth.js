$(document).ready(function () {
  checkAuth();

  $("#tab-login").on("click", function () {
    $("#form-login").show();
    $("#form-register").hide();
    clearErrors();

    $("#tab-login").css({
      "background-color": "#3498db",
      color: "white",
      "border-color": "#2980b9",
    });
    $("#tab-register").css({
      "background-color": "",
      color: "",
      "border-color": "",
    });
  });
  $("#tab-register").on("click", function () {
    $("#form-register").show();
    $("#form-login").hide();
    clearErrors();

    $("#tab-register").css({
      "background-color": "#3498db",
      color: "white",
      "border-color": "#2980b9",
    });
    $("#tab-login").css({
      "background-color": "",
      color: "",
      "border-color": "",
    });
  });

  $("#btn-login").on("click", function () {
    login();
  });

  $("#btn-register").on("click", function () {
    register();
  });

  $("#btn-logout").on("click", function () {
    logout();
  });

  function checkAuth() {
    const token = localStorage.getItem("token");

    if (token) {
      $("#login-container").hide();
      $("#crm-dashboard").show();
      // Показываем токен в UI, если элемент присутствует
      if ($("#token-display").length) {
        $("#token-display").text(token);
      }
    } else {
      $("#crm-dashboard").hide();
      $("#login-container").show();
    }
  }

  function login() {
    clearErrors();

    const loginData = {
      email: $("#inp-login-email").val(),
      password: $("#inp-login-password").val(),
    };

    api
      .post("/users/login", loginData)
      .done(function (response) {
        // ИСПРАВЛЕНО: бэкенд возвращает response.accessToken, а не response.token
        localStorage.setItem("token", response.accessToken);
        location.reload();
      })
      .fail(function (xhr) {
        handleAjaxError(xhr);
      });
  }

  function register() {
    clearErrors();

    const registerData = {
      name: $("#inp-register-name").val(),
      email: $("#inp-register-email").val(),
      password: $("#inp-register-password").val(),
    };

    api
      .post("/users/register", registerData)
      .done(function (response) {
        alert("Регистрация успешна! Вы автоматически вошли в систему.");

        const token = response?.accessToken || response?.token;
        if (token) {
          localStorage.setItem("token", token);
          location.reload();
        } else {
          $("#tab-login").trigger("click");
        }
      })
      .fail(function (xhr) {
        handleAjaxError(xhr);
      });
  }

  function logout() {
    localStorage.removeItem("token");
    location.reload();
  }

  $(document).on("click", "#btn-copy-token", function () {
    const token = localStorage.getItem("token") || $("#token-display").text();
    if (!token) return alert("Токен не найден");

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(token).then(
        function () {
          alert("Токен скопирован в буфер обмена");
        },
        function () {
          alert("Не удалось скопировать токен");
        },
      );
    } else {
      const $temp = $("<textarea>");
      $("body").append($temp);
      $temp.val(token).select();
      try {
        document.execCommand("copy");
        alert("Токен скопирован в буфер обмена");
      } catch (e) {
        alert("Не удалось скопировать токен");
      }
      $temp.remove();
    }
  });
});

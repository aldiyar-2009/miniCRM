function renderNav(activePage) {
  const user = getUser();
  const isAdmin = user && user.role === "admin";

  const links = [
    {
      href: "/minicrm-out/public/html/dashboard.html",
      label: "Главная",
      key: "dashboard",
    },
    {
      href: "/minicrm-out/public/html/companies.html",
      label: "Компании",
      key: "companies",
    },
    {
      href: "/minicrm-out/public/html/contacts.html",
      label: "Контакты",
      key: "contacts",
    },
    {
      href: "/minicrm-out/public/html/deals.html",
      label: "Сделки",
      key: "deals",
    },
    {
      href: "/minicrm-out/public/html/activities.html",
      label: "Активности",
      key: "activities",
    },
    {
      href: "/minicrm-out/public/html/upload.html",
      label: "Файлы",
      key: "upload",
    },
  ];

  if (isAdmin) {
    links.push({
      href: "/minicrm-out/public/html/users.html",
      label: "Пользователи",
      key: "users",
    });
  }

  const linksHtml = links
    .map(
      (l) =>
        '<a href="' +
        l.href +
        '"' +
        (activePage === l.key ? ' class="active"' : "") +
        ">" +
        l.label +
        "</a>",
    )
    .join("");

  const userHtml = user
    ? '<span class="nav-user">' +
      (user.name || user.email) +
      '</span><button class="btn-logout" id="btn-logout">Выйти</button>'
    : '<a href="/minicrm-out/public/html/login.html">Войти</a>';

  document.body.insertAdjacentHTML(
    "afterbegin",
    "<nav>" +
      '<a class="brand" href="/minicrm-out/public/html/dashboard.html">miniCRM</a>' +
      linksHtml +
      '<div class="nav-right">' +
      userHtml +
      "</div>" +
      "</nav>",
  );

  const logoutBtn = document.getElementById("btn-logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      clearTokens();
      window.location.href = "/minicrm-out/public/html/login.html";
    });
  }
}

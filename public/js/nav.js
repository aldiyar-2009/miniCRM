function renderNav(activePage) {
  const user = getUser();
  const isAdmin = user?.role === "admin";
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  const links = [
    {
      href: "kanban.html",
      label: "Leads & Calls",
      key: "kanban",
    },
    {
      href: "dashboard.html",
      label: "Dashboard",
      key: "dashboard",
    },
    {
      href: "companies.html",
      label: "Компании",
      key: "companies",
    },
    {
      href: "contacts.html",
      label: "Контакты",
      key: "contacts",
    },
    {
      href: "chat.html",
      label: "Чат",
      key: "chat",
    },
  ];
  if (isAdmin)
    links.push({
      href: "./users.html",
      label: "Пользователи",
      key: "users",
    });

  const linksHtml = links
    .map(
      (l) =>
        '<a href="' +
        l.href +
        '" class="nav-link' +
        (activePage === l.key ? " active" : "") +
        '">' +
        l.label +
        "</a>",
    )
    .join("");

  document.body.insertAdjacentHTML(
    "afterbegin",
    `
    <nav class="top-nav">
      <a class="nav-brand" href="kanban.html">miniCRM</a>
      <div class="nav-links">${linksHtml}</div>
      <div class="nav-right">
        <div class="nav-bell-wrap" id="bell-wrap">
          <button class="nav-bell-btn" id="bell-btn">🔔
            <span class="bell-badge" id="bell-badge"></span>
          </button>
          <div class="notif-dropdown" id="notif-dropdown">
            <div class="notif-head">
              Уведомления
              <button class="btn-ghost" id="mark-all-btn" style="font-size:11px">Прочитать все</button>
            </div>
            <div class="notif-scroll" id="notif-list">
              <div class="notif-empty">Нет уведомлений</div>
            </div>
          </div>
        </div>
        <div class="nav-profile" id="profile-btn">
          <div class="profile-avatar">${initials}</div>
          <div>
            <div class="profile-name">${user?.name || "Пользователь"}</div>
            <div class="profile-role">${user?.role || ""}</div>
          </div>
          <div class="profile-dropdown" id="profile-dropdown">
            <hr>
            <button class="logout-btn" id="logout-btn">Выйти</button>
          </div>
        </div>
      </div>
    </nav>
    <div class="nav-spacer"></div>
  `,
  );

  // Профиль dropdown
  document.getElementById("profile-btn").addEventListener("click", (e) => {
    e.stopPropagation();
    document.getElementById("profile-dropdown").classList.toggle("open");
    document.getElementById("notif-dropdown").classList.remove("open");
  });

  // Колокольчик dropdown
  document.getElementById("bell-btn").addEventListener("click", (e) => {
    e.stopPropagation();
    document.getElementById("notif-dropdown").classList.toggle("open");
    document.getElementById("profile-dropdown").classList.remove("open");
    loadNotifications();
  });

  document
    .getElementById("mark-all-btn")
    .addEventListener("click", async () => {
      await apiFetch("/notifications/read-all", { method: "PATCH" });
      loadNotifications();
    });

  document.addEventListener("click", () => {
    document.getElementById("profile-dropdown")?.classList.remove("open");
    document.getElementById("notif-dropdown")?.classList.remove("open");
  });

  document.getElementById("logout-btn").addEventListener("click", () => {
    clearTokens();
    window.location.href = "login.html";
  });

  loadNotifications();
}

async function loadNotifications() {
  try {
    const list = await apiFetch("/notifications");
    const container = document.getElementById("notif-list");
    const badge = document.getElementById("bell-badge");
    if (!list.length) {
      container.innerHTML = '<div class="notif-empty">Нет уведомлений</div>';
      badge.classList.remove("show");
      return;
    }
    badge.textContent = list.length;
    badge.classList.add("show");
    container.innerHTML = list
      .map(
        (n) =>
          '<div class="notif-item unread" onclick="markNotifRead(\'' +
          n.id +
          "')\">" +
          '<div class="notif-msg">' +
          n.message +
          "</div>" +
          '<div class="notif-time">' +
          formatDateTime(n.created_at) +
          "</div>" +
          "</div>",
      )
      .join("");
  } catch (error) {
    console.error("Error loading notifications:", error);
  }
}

async function markNotifRead(id) {
  await apiFetch("/notifications/" + id + "/read", { method: "PATCH" }).catch(
    () => {},
  );
  loadNotifications();
}

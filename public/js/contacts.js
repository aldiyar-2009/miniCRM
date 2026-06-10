$(document).ready(function () {
  let editContactId = null;

  loadContacts();

  $("#btn-create-contact").on("click", function () {
    saveContact();
  });

  $("#btn-load-contacts").on("click", function () {
    loadContacts();
  });

  $("#btn-cancel-contact").on("click", function () {
    cancelContactEdit();
  });

  $("#contacts-list").on("click", ".delete-contact-btn", function () {
    const id = $(this).attr("data-id");
    const firstName = $(this).attr("data-firstname");
    const lastName = $(this).attr("data-lastname");

    if (
      confirm(
        "Вы точно хотите удалить контакт '" + firstName + " " + lastName + "'?",
      )
    ) {
      deleteContact(id);
    }
  });

  $("#contacts-list").on("click", ".edit-contact-btn", function () {
    const id = $(this).attr("data-id");
    const companyId = $(this).attr("data-company-id");
    const firstName = $(this).attr("data-firstname");
    const lastName = $(this).attr("data-lastname");
    const email = $(this).attr("data-email");
    const phone = $(this).attr("data-phone");

    startContactEdit({ id, companyId, firstName, lastName, email, phone });
  });

  function loadContacts() {
    api
      .get("/contacts")
      .done(function (data) {
        $("#contacts-list").empty();

        if (data.length === 0) {
          $("#contacts-list").append("<p>Контактов пока нет.</p>");
          return;
        }

        data.forEach(function (contact) {
          const companyName = contact.company_name
            ? contact.company_name
            : "Компания не указана";
          $("#contacts-list").append(
            `<div class='contact-item'>
              <div>
                <strong>${contact.first_name} ${contact.last_name}</strong><br/>
                <small>${companyName}</small><br/>
                Email: ${contact.email || "-"} | Тел: ${contact.phone || "-"}
              </div>
              <div class='list-actions'>
                <button class='edit-contact-btn' data-id='${contact.id}' data-company-id='${contact.company_id}' data-firstname='${contact.first_name}' data-lastname='${contact.last_name}' data-email='${contact.email || ""}' data-phone='${contact.phone || ""}'>Изменить</button>
                <button class='delete-contact-btn' data-id='${contact.id}' data-firstname='${contact.first_name}' data-lastname='${contact.last_name}'>Удалить</button>
              </div>
            </div>`,
          );
        });
      })
      .fail(function (xhr) {
        handleAjaxError(xhr);
      });
  }

  function saveContact() {
    clearErrors();

    const data = {
      company_id: $("#select-company_id").val(),
      first_name: $("#inp-first_name").val(),
      last_name: $("#inp-last_name").val(),
      email: $("#inp-email").val(),
      phone: $("#inp-phone").val(),
    };

    const request = editContactId
      ? api.put("/contacts/" + editContactId, data)
      : api.post("/contacts", data);

    request
      .done(function () {
        const message = editContactId
          ? "Контакт успешно обновлён."
          : "Контакт успешно добавлен!";
        alert(message);
        resetContactForm();
        loadContacts();
      })
      .fail(function (xhr) {
        handleAjaxError(xhr);
      });
  }

  function startContactEdit(contact) {
    editContactId = contact.id;
    $("#select-company_id").val(contact.companyId);
    $("#inp-first_name").val(contact.firstName);
    $("#inp-last_name").val(contact.lastName);
    $("#inp-email").val(contact.email);
    $("#inp-phone").val(contact.phone);
    $("#btn-create-contact").text("Сохранить изменения");
    $("#btn-cancel-contact").removeClass("hidden");
  }

  function cancelContactEdit() {
    resetContactForm();
  }

  function resetContactForm() {
    editContactId = null;
    $("#select-company_id").val("");
    $("#inp-first_name").val("");
    $("#inp-last_name").val("");
    $("#inp-email").val("");
    $("#inp-phone").val("");
    $("#btn-create-contact").text("Сохранить контакт");
    $("#btn-cancel-contact").addClass("hidden");
    clearErrors();
  }

  function deleteContact(id) {
    api
      .delete("/contacts/" + id)
      .done(function () {
        alert("Контакт успешно удален.");
        loadContacts();
      })
      .fail(function (xhr) {
        handleAjaxError(xhr);
      });
  }

  function updateCompanyDropdown(companies) {
    const $select = $("#select-company_id");

    const selectedVal = $select.val();

    $select.empty();
    $select.append("<option value=''>-- Выберите компанию --</option>");

    companies.forEach(function (company) {
      $select.append(
        "<option value='" + company.id + "'>" + company.name + "</option>",
      );
    });

    $select.val(selectedVal);
  }

  window.loadContacts = loadContacts;
  window.updateCompanyDropdown = updateCompanyDropdown;
});

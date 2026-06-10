$(document).ready(function () {
  let editCompanyId = null;

  loadCompanies();

  $("#btn-create-company").on("click", function () {
    saveCompany();
  });

  $("#btn-load-companies").on("click", function () {
    loadCompanies();
  });

  $("#btn-cancel-company").on("click", function () {
    cancelCompanyEdit();
  });

  $("#companies-list").on("click", ".delete-company-btn", function () {
    const id = $(this).attr("data-id");
    const name = $(this).attr("data-name");

    if (confirm("Вы точно хотите удалить компанию '" + name + "'?")) {
      deleteCompany(id);
    }
  });

  $("#companies-list").on("click", ".edit-company-btn", function () {
    const id = $(this).attr("data-id");
    const name = $(this).attr("data-name");
    const industry = $(this).attr("data-industry");
    const website = $(this).attr("data-website");

    startCompanyEdit({ id, name, industry, website });
  });

  function loadCompanies() {
    api
      .get("/companies")
      .done(function (data) {
        $("#companies-list").empty();

        if (data.length === 0) {
          $("#companies-list").append("<p>Компаний пока нет.</p>");
          return;
        }

        data.forEach(function (company) {
          $("#companies-list").append(
            `<div class='company-item'>
              <div><strong>${company.name}</strong> (${company.industry})<br/><small>${company.website}</small></div>
              <div class='list-actions'>
                <button class='edit-company-btn' data-id='${company.id}' data-name='${company.name}' data-industry='${company.industry}' data-website='${company.website}'>Изменить</button>
                <button class='delete-company-btn' data-id='${company.id}' data-name='${company.name}'>Удалить</button>
              </div>
            </div>`,
          );
        });

        if (typeof updateCompanyDropdown === "function") {
          updateCompanyDropdown(data);
        }
      })
      .fail(function (xhr) {
        handleAjaxError(xhr);
      });
  }

  function saveCompany() {
    clearErrors();

    const data = {
      name: $("#inp-name").val(),
      industry: $("#inp-industry").val(),
      website: $("#inp-website").val(),
    };

    const request = editCompanyId
      ? api.put("/companies/" + editCompanyId, data)
      : api.post("/companies", data);

    request
      .done(function (company) {
        const message = editCompanyId
          ? "Компания успешно обновлена."
          : "Компания успешно добавлена!";
        alert(message);
        resetCompanyForm();
        loadCompanies();
      })
      .fail(function (xhr) {
        handleAjaxError(xhr);
      });
  }

  function startCompanyEdit(company) {
    editCompanyId = company.id;
    $("#inp-name").val(company.name);
    $("#inp-industry").val(company.industry);
    $("#inp-website").val(company.website);
    $("#btn-create-company").text("Сохранить изменения");
    $("#btn-cancel-company").removeClass("hidden");
  }

  function cancelCompanyEdit() {
    resetCompanyForm();
  }

  function resetCompanyForm() {
    editCompanyId = null;
    $("#inp-name").val("");
    $("#inp-industry").val("");
    $("#inp-website").val("");
    $("#btn-create-company").text("Сохранить компанию");
    $("#btn-cancel-company").addClass("hidden");
    clearErrors();
  }

  function deleteCompany(id) {
    api
      .delete("/companies/" + id)
      .done(function () {
        alert("Компания успешно удалена.");
        loadCompanies();
        if (typeof loadContacts === "function") {
          loadContacts();
        }
      })
      .fail(function (xhr) {
        handleAjaxError(xhr);
      });
  }

  window.loadCompanies = loadCompanies;
});

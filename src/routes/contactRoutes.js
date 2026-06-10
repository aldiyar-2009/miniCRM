const express = require("express");
const contactController = require("../controllers/contactController");
const auth = require("../middleware/auth");
const role = require("../middleware/role");

const router = express.Router();

router.post("/contacts", auth, role(["admin", "manager"]), contactController.createContact);
router.get("/contacts", auth, role(["admin", "manager", "viewer"]), contactController.getAllContacts);
router.get("/contacts/:id", auth, role(["admin", "manager", "viewer"]), contactController.getContactById);
router.get(
  "/contacts/company/:company_id",
  auth,
  role(["admin", "manager", "viewer"]),
  contactController.getContactsByCompany,
);
router.put("/contacts/:id", auth, role(["admin", "manager"]), contactController.updateContact);
router.delete("/contacts/:id", auth, role(["admin"]), contactController.deleteContact);

module.exports = router;

const Joi = require("joi");

const validator = (schema) => (payload) =>
  schema.validate(payload, { abortEarly: false, stripUnknown: true });

const signupSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(3).max(10).required(),
});

const companySchema = Joi.object({
  name: Joi.string().min(3).max(40).required(),
  industry: Joi.string().min(5).max(255).required(),
  website: Joi.string()
    .uri({ scheme: ["http", "https"] })
    .required(),
});

const companyUpdateSchema = Joi.object({
  name: Joi.string().min(3).max(40),
  industry: Joi.string().min(5).max(255),
  website: Joi.string().uri({ scheme: ["http", "https"] }),
}).min(1);

const contactSchema = Joi.object({
  company_id: Joi.string().uuid().required(),
  first_name: Joi.string().min(1).max(255).required(),
  last_name: Joi.string().min(1).max(255).required(),
  email: Joi.string().email().max(255).allow(null, ""),
  phone: Joi.string().max(50).allow(null, ""),
});

const contactUpdateSchema = Joi.object({
  company_id: Joi.string().uuid(),
  first_name: Joi.string().min(1).max(255),
  last_name: Joi.string().min(1).max(255),
  email: Joi.string().email().max(255).allow(null, ""),
  phone: Joi.string().max(50).allow(null, ""),
}).min(1);

const userSchema = Joi.object({
  name: Joi.string().min(2).max(255).required(),
  email: Joi.string().email().min(8).max(255).allow(null, "").required(),
  password: Joi.string().min(8).required(),
  role: Joi.string().min(5),
});

const userUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(255),
  email: Joi.string().email().min(8).max(255).allow(null, ""),
  password: Joi.string().min(8),
  role: Joi.string().min(5),
});

const dealSchema = Joi.object({
  company_id: Joi.string().uuid().required(),
  owner_id: Joi.string().uuid().required(),
  title: Joi.string().min(1).max(255).required(),
  amount: Joi.number().precision(2).min(0).allow(null),
  currency: Joi.string().max(10).default("USD"),
  stage: Joi.string()
    .valid("lead", "qualified", "proposal", "negotiation", "won", "lost")
    .default("lead"),
  close_date: Joi.date().allow(null),
});

const dealUpdateSchema = Joi.object({
  company_id: Joi.string().uuid(),
  owner_id: Joi.string().uuid(),
  title: Joi.string().min(1).max(255),
  amount: Joi.number().precision(2).min(0).allow(null),
  currency: Joi.string().max(10),
  stage: Joi.string().valid(
    "lead",
    "qualified",
    "proposal",
    "negotiation",
    "won",
    "lost",
  ),
  close_date: Joi.date().allow(null),
}).min(1);

exports.validateSignup = validator(signupSchema);
exports.validateCompany = validator(companySchema);
exports.validateCompanyUpdate = validator(companyUpdateSchema);
exports.validateContact = validator(contactSchema);
exports.validateContactUpdate = validator(contactUpdateSchema);
exports.validateUser = validator(userSchema);
exports.validateUserUpdate = validator(userUpdateSchema);
exports.validateDeal = validator(dealSchema);
exports.validateDealUpdate = validator(dealUpdateSchema);

const activitySchema = Joi.object({
  deal_id: Joi.string().uuid().required(),
  contact_id: Joi.string().uuid().allow(null),
  user_id: Joi.string().uuid().allow(null),
  type: Joi.string().valid("call", "email", "meeting", "note", "task").required(),
  body: Joi.string().allow(null, ""),
  scheduled_at: Joi.date().allow(null),
  completed: Joi.boolean().default(false),
});

exports.validateActivity = validator(activitySchema);


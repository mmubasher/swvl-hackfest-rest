"use strict";
const userRoutes = require("./user_routes");
const userSettingsRoutes = require("./user_settings_routes");
const uploadRoutes = require("./upload_routes");
const baseRoutes = require("./base_routes");
const notificationsRoutes = require("./notifications_routes");
const faqsRoutes = require("./faqs_routes");
const networkRoutes = require("./network_routes");
let routes = [];
routes = routes.concat(
  uploadRoutes,
  userRoutes,
  notificationsRoutes,
  baseRoutes,
  networkRoutes,
  faqsRoutes,
  userSettingsRoutes
);

module.exports = {
  routes,
};

import { Router } from "express";
import {
  hasCsrfToken,
  isAdmin,
  isAuthenticated,
} from "../middleware/authMiddleware.js";
import { validateSettings } from "../middleware/validationMiddleware.js";
import {
  createSetting,
  deleteAllSettings,
  deleteSettingBySettingId,
  getAllSettings,
  getSettingBySettingId,
  updateSettingBySettingId,
} from "../controller/settingsController.js";

const settingsRouter = Router();

//get all settings
settingsRouter.get("/", getAllSettings);
//create a setting
settingsRouter.post("/", validateSettings, hasCsrfToken, createSetting);
//delete all settings, would have to choose base currency again afterwards
settingsRouter.delete("/", hasCsrfToken, deleteAllSettings);
//get a setting
settingsRouter.get("/:settingId", getSettingBySettingId);
//delete a setting
settingsRouter.delete("/:settingId", hasCsrfToken, deleteSettingBySettingId);
//update a setting
settingsRouter.patch(
  "/:settingId",
  validateSettings,
  hasCsrfToken,
  updateSettingBySettingId,
);

export default settingsRouter;

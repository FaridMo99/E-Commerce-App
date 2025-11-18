import { Router } from "express";
import {hasCsrfToken} from "../middleware/authMiddleware.js";
import { validateBody } from "../middleware/validationMiddleware.js";
import {
  createSetting,
  deleteAllSettings,
  deleteSettingBySettingId,
  getAllSettings,
  getSettingBySettingId,
  updateSettingBySettingId,
} from "../controller/settingsController.js";
import { settingsSchema } from "@monorepo/shared";

const settingsRouter = Router();

//get all settings
settingsRouter.get("/", getAllSettings);
//create a setting
settingsRouter.post("/", validateBody(settingsSchema), hasCsrfToken, createSetting);
//delete all except base currency
settingsRouter.delete("/", hasCsrfToken, deleteAllSettings);
//get a setting
settingsRouter.get("/:settingId", getSettingBySettingId);
//delete a setting
settingsRouter.delete("/:settingId", hasCsrfToken, deleteSettingBySettingId);
//update a setting
settingsRouter.patch(
  "/:settingId",
  validateBody(settingsSchema),
  hasCsrfToken,
  updateSettingBySettingId,
);

export default settingsRouter;

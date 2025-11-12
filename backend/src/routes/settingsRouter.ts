import { Router } from "express";
import { hasCsrfToken, isAdmin, isAuthenticated } from "../middleware/authMiddleware.js";
import { validateSettings } from "../middleware/validationMiddleware.js";
import { createSetting, deleteAllSettings, deleteSettingBySettingId, getAllSettings, getSettingBySettingId, updateSettingBySettingId } from "../controller/settingsController.js";

const settingsRouter = Router()

//get all settings
settingsRouter.get("/", isAuthenticated, isAdmin, getAllSettings)
//create a setting
settingsRouter.post("/", validateSettings, isAuthenticated, isAdmin, hasCsrfToken,createSetting);
//delete all settings, would have to choose base currency again afterwards
settingsRouter.delete("/", isAuthenticated, isAdmin, hasCsrfToken,deleteAllSettings);
//get a setting
settingsRouter.get("/:settingId", isAuthenticated, isAdmin, getSettingBySettingId);
//delete a setting 
settingsRouter.delete("/:settingId", isAuthenticated, isAdmin, hasCsrfToken,deleteSettingBySettingId);
//update a setting
settingsRouter.patch("/:settingId",validateSettings, isAuthenticated, isAdmin, hasCsrfToken,updateSettingBySettingId);

export default settingsRouter
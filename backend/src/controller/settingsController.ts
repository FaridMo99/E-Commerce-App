import type { Request, Response, NextFunction } from "express";
import prisma from "../services/prisma.js";
import type { SettingsSchema } from "@monorepo/shared";

export async function getAllSettings(req: Request,res: Response,next: NextFunction) {
  try {
    const settings = await prisma.settings.findMany();
    return res.status(200).json(settings);
  } catch (err) {
    next(err);
  }
}

export async function deleteAllSettings(req: Request,res: Response,next: NextFunction) {
  try {
    await prisma.settings.deleteMany();
    return res.status(200).json({message:"Delete successful"});
  } catch (err) {
    next(err);
  }
}

export async function createSetting(req: Request<{}, {}, SettingsSchema>, res: Response, next: NextFunction) {
    const {key, value} = req.body
  try {
      const setting = await prisma.settings.create({
          data: {
              key,
              value
        }
    });
    return res.status(200).json(setting);
  } catch (err) {
    next(err);
  }
}

export async function getSettingBySettingId(req: Request, res: Response, next: NextFunction) {
    const settingId = req.params.settingId
    if(!settingId) return res.status(400).json({message:"No Setting Id provided"})
  try {
      const setting = await prisma.settings.findUnique({
          where: {
            id:settingId
        }
      });
      if(!setting) return res.status(404).json({message:"Setting not found"})
    return res.status(200).json(setting);
  } catch (err) {
    next(err);
  }
}

export async function deleteSettingBySettingId(req: Request, res: Response, next: NextFunction) {
    
  const settingId = req.params.settingId;
    if (!settingId) return res.status(400).json({ message: "No Setting Id provided" });
    
  try {
    const setting = await prisma.settings.delete({
      where: {
        id: settingId,
      },
    });
    if (!setting) return res.status(404).json({ message: "Setting not found" });
    return res.status(200).json(setting);
  } catch (err) {
    next(err);
  }
}

export async function updateSettingBySettingId(
    req: Request<{settingId?:string}, {},SettingsSchema>,
  res: Response,
  next: NextFunction
) {
    const settingId = req.params.settingId;
    const {key, value} = req.body
  if (!settingId)
    return res.status(400).json({ message: "No Setting Id provided" });

  try {
    const setting = await prisma.settings.update({
      where: {
            id: settingId,
          key
        },
        data: {
            value
        }
    });
    if (!setting) return res.status(404).json({ message: "Setting not found" });
    return res.status(200).json(setting);
  } catch (err) {
    next(err);
  }
}
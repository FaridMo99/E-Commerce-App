import type { Request, Response, NextFunction } from "express";
import prisma from "../services/prisma.js";
import type { SettingsSchema } from "@monorepo/shared";
import { BASE_CURRENCY_KEY } from "../config/constants.js";
import chalk from "chalk";
import { getTimestamp } from "../lib/utils.js";

export async function getAllSettings(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log(chalk.yellow(`${getTimestamp()} Fetching all settings...`));
    const settings = await prisma.settings.findMany();
    console.log(
      chalk.green(`${getTimestamp()} Fetched ${settings.length} settings`)
    );
    return res.status(200).json(settings);
  } catch (err) {
    console.log(
      chalk.red(`${getTimestamp()} Failed to fetch all settings`),
      err
    );
    next(err);
  }
}

export async function deleteAllSettings(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log(
      chalk.yellow(
        `${getTimestamp()} Deleting all settings except base currency...`
      )
    );
    await prisma.settings.deleteMany({
      where: {
        key: { not: BASE_CURRENCY_KEY },
      },
    });
    console.log(chalk.green(`${getTimestamp()} Delete successful`));
    return res.status(200).json({ message: "Delete successful" });
  } catch (err) {
    console.log(chalk.red(`${getTimestamp()} Failed to delete settings`), err);
    next(err);
  }
}

export async function createSetting(
  req: Request<{}, {}, SettingsSchema>,
  res: Response,
  next: NextFunction
) {
  const { key, value } = req.body;
  try {
    console.log(chalk.yellow(`${getTimestamp()} Creating setting: ${key}...`));
    const setting = await prisma.settings.create({ data: { key, value } });
    console.log(chalk.green(`${getTimestamp()} Setting created: ${key}`));
    return res.status(200).json(setting);
  } catch (err) {
    console.log(
      chalk.red(`${getTimestamp()} Failed to create setting: ${key}`),
      err
    );
    next(err);
  }
}

export async function getSettingBySettingId(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const settingId = req.params.settingId;
  if (!settingId) {
    console.log(chalk.red(`${getTimestamp()} No Setting Id provided`));
    return res.status(400).json({ message: "No Setting Id provided" });
  }
  try {
    console.log(
      chalk.yellow(`${getTimestamp()} Fetching setting by ID: ${settingId}...`)
    );
    const setting = await prisma.settings.findUnique({
      where: { id: settingId },
    });
    if (!setting) {
      console.log(
        chalk.red(`${getTimestamp()} Setting not found: ${settingId}`)
      );
      return res.status(404).json({ message: "Setting not found" });
    }
    console.log(chalk.green(`${getTimestamp()} Setting fetched: ${settingId}`));
    return res.status(200).json(setting);
  } catch (err) {
    console.log(
      chalk.red(`${getTimestamp()} Failed to fetch setting: ${settingId}`),
      err
    );
    next(err);
  }
}

export async function deleteSettingBySettingId(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const settingId = req.params.settingId;
  if (!settingId) {
    console.log(chalk.red(`${getTimestamp()} No Setting Id provided`));
    return res.status(400).json({ message: "No Setting Id provided" });
  }
  try {
    console.log(
      chalk.yellow(`${getTimestamp()} Deleting setting: ${settingId}...`)
    );
    const setting = await prisma.settings.deleteMany({
      where: {
        id: settingId,
        key: { not: BASE_CURRENCY_KEY },
      },
    });
    if (!setting) {
      console.log(
        chalk.red(
          `${getTimestamp()} Setting not found for deletion: ${settingId}`
        )
      );
      return res.status(404).json({ message: "Setting not found" });
    }
    console.log(chalk.green(`${getTimestamp()} Setting deleted: ${settingId}`));
    return res.status(200).json(setting);
  } catch (err) {
    console.log(
      chalk.red(`${getTimestamp()} Failed to delete setting: ${settingId}`),
      err
    );
    next(err);
  }
}

export async function updateSettingBySettingId(
  req: Request<{ settingId?: string }, {}, SettingsSchema>,
  res: Response,
  next: NextFunction
) {
  const settingId = req.params.settingId;
  const { key, value } = req.body;
  if (!settingId) {
    console.log(chalk.red(`${getTimestamp()} No Setting Id provided`));
    return res.status(400).json({ message: "No Setting Id provided" });
  }
  if (key === BASE_CURRENCY_KEY) {
    console.log(
      chalk.red(`${getTimestamp()} Attempted to change base currency key`)
    );
    return res.status(400).json({ message: "Currency cant be changed" });
  }

  try {
    console.log(
      chalk.yellow(`${getTimestamp()} Updating setting: ${settingId}...`)
    );
    const setting = await prisma.settings.update({
      where: { id: settingId, key },
      data: { value },
    });
    if (!setting) {
      console.log(
        chalk.red(
          `${getTimestamp()} Setting not found for update: ${settingId}`
        )
      );
      return res.status(404).json({ message: "Setting not found" });
    }
    console.log(chalk.green(`${getTimestamp()} Setting updated: ${settingId}`));
    return res.status(200).json(setting);
  } catch (err) {
    console.log(
      chalk.red(`${getTimestamp()} Failed to update setting: ${settingId}`),
      err
    );
    next(err);
  }
}

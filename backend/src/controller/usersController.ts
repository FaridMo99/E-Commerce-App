import type { Request, Response, NextFunction } from "express";
import prisma from "../services/prisma.js";
import type { UpdateUserSchema } from "@monorepo/shared";
import bcrypt from "bcrypt"
import type { User } from "../generated/prisma/client.js";

//update in all controllers what you return
export async function getUserByUserId(req: Request, res: Response, next: NextFunction) {
    const id = req.user?.id
    if (!id) return res.status(400).json({ message: "User not logged in" })
    
    try {
        const user = await prisma.user.findUnique({ where: { id } })
        if (!user) return res.status(404).json({ message: "User not found" })
        
        return res.status(200).json(user)
    } catch (err) {
        next(err)
    }
}

export async function updateUserByUserId(req: Request<{}, {}, UpdateUserSchema>, res: Response, next: NextFunction) {
    const { email, name, password, birthdate, address } = req.body
    const id = req.user?.id

    if (!id) return res.status(400).json({ message: "User not logged in" })

    try {
        //check if email already exists
        if (email) {
            const emailInUse = await prisma.user.findFirst({ where: { email } })
            if(emailInUse) return res.status(400).json({message:"Email already in use"})
        }
        
            const data: Partial<User> = {
              ...(email && { email }),
              ...(name && { name }),
              ...(birthdate && { birthdate }),
              ...(address && { address }),
              ...(password && { password: await bcrypt.hash(password, 10) }),
            };
        
        const user = await prisma.user.update({
            where: {
                id
            },
            data
        })

        return res.status(200).json(user)
    } catch (err) {
        next(err)
    }
}

export async function deleteUserByUserId(req: Request, res: Response, next: NextFunction) {
        const id = req.user?.id;

        if (!id) return res.status(400).json({ message: "User not logged in" });

    try {
        const user = await prisma.user.delete({
            where:{id}
        })

        return res.status(200).json({message:"Delete successful"})
    } catch (err) {
        next(err)
    }
}
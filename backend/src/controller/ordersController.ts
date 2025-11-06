import type { Request, Response, NextFunction } from "express";
import prisma from "../services/prisma.js";
import type { OrdersQuerySchema } from "@monorepo/shared";


export async function getAllOrdersByUser(req: Request, res: Response, next: NextFunction) {
    const userId = req.user?.id
    const {sort, order, page, limit, status } = req.query as OrdersQuerySchema
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    if (!userId) return res.status(401).json({ message: "Not authenticated" })

    try {
        const orders = await prisma.order.findMany({
          where: {
            user_id: userId,
            ...(status ? { status } : {}),
          },
          include: {
            _count: {
              select: {
                items: true,
              },
            },
          },
          orderBy: {
            [sort]: order,
          },

          skip: (pageNum - 1) * limitNum,
          take: limitNum
        });
    } catch (err) {
        next(err)
    }
}

export async function getSingleOrderByUser(req: Request, res: Response, next: NextFunction) {
    const userId = req.user?.id;
    const orderId = req.params.orderId!
    if (!userId) return res.status(401).json({ message: "Not authenticated" });

    try {
        const order = await prisma.order.findFirst({
            where: {
                id: orderId,
                user_id:userId
            }
        })
        if (!order) return res.status(404).json({ message: "Order not found" })
        
        return res.status(200).json(order)
    } catch (err) {
        next(err);
    }
}
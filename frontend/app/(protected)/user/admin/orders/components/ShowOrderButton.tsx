"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Order } from "@/types/types";
import { Eye } from "lucide-react";
import OrderSummary from "./OrderSummary";

function ShowOrderButton({ order }: { order: Order }) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button
            aria-label="show order details"
            type="button"
            className="text-white cursor-pointer hover:text-white/80"
          >
            <Eye />
          </Button>
        </DialogTrigger>
        <DialogHeader className="sr-only">
          <DialogTitle>Order from {order.user.name}</DialogTitle>
        </DialogHeader>
        <DialogContent className="sm:max-w-xl p-6 overflow-y-scroll no-scrollbar">
          <OrderSummary order={order} />
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button type="button">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
}

export default ShowOrderButton;

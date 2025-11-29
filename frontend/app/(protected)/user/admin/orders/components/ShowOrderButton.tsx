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

function ShowOrderButton({ order }: { order: Order }) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button
            type="button"
            className="text-white cursor-pointer hover:text-white/80"
          >
            <Eye />
          </Button>
        </DialogTrigger>
        <DialogHeader>
          <DialogTitle>Order from {order.user.name}</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <p>{order.currency}</p>
          <p>{order.ordered_at.toISOString()}</p>
          <p>{order.total_amount}</p>
          <p>{order.status}</p>
          <p>{order.shipping_address}</p>
          <p>{order.payment?.method}</p>
          <p>{order.payment?.status}</p>
          <p>{order.user.address}</p>
          <p>{order.user.birthdate?.toISOString()}</p>
          <p>{order.user.countryCode}</p>
          <p>{order.user.created_at.toISOString()}</p>
          <p>{order.user.name}</p>
          <p>{order.user.role}</p>
          {order.items.map((item) => (
            <div key={item.product.id}>
              <p> {item.product.imageUrls[0]}</p>
              <p>{item.product.name}</p>
            </div>
          ))}
        </DialogContent>
        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="button">Close</Button>
        </DialogFooter>
      </Dialog>
    );
}

export default ShowOrderButton;

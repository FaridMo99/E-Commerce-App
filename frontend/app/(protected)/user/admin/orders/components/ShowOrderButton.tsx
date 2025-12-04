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
            aria-label="show order details"
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
          <p>{order.ordered_at}</p>
          <p>{order.total_amount}</p>
          <p>{order.status}</p>
          <p>{order.shipping_address}</p>
          <p>{order.payment?.method}</p>
          <p>{order.payment?.status}</p>
          <p>{order.user.city}</p>
          <p>{order.user.postalCode}</p>
          <p>{order.user.state}</p>
          <p>{order.user.street}</p>
          <p>{order.user.houseNumber}</p>
          <p>{order.user.birthdate && order.user.birthdate}</p>
          <p>{order.user.countryCode}</p>
          <p>{order.user.created_at}</p>
          <p>{order.user.name}</p>
          <p>{order.user.role}</p>
          {order.items.map((item) => (
            <div key={item.product.id}>
              <p> {item.product.imageUrls[0]}</p>
              <p>{item.product.name}</p>
            </div>
          ))}
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

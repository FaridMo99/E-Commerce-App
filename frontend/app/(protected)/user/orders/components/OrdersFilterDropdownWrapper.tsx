import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ReactNode } from "react";

type OrdersFilterDropdownWrapperProps = {
  label: string;
  buttonText: string;
  children: ReactNode;
};

function OrdersFilterDropdownWrapper({
  label,
  buttonText,
  children,
}: OrdersFilterDropdownWrapperProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>{buttonText}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="rounded-xl p-2 w-40 bg-foreground text-white">
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default OrdersFilterDropdownWrapper;

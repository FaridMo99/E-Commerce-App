import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CurrencyISO } from "@/types/types";
import { DollarSign, Euro, PoundSterling, type LucideIcon } from "lucide-react";

export type CurrencyElement = { currency: CurrencyISO; Icon: LucideIcon };

const currencyElements: CurrencyElement[] = [
  {
    currency: "EUR",
    Icon: Euro,
  },
  {
    currency: "USD",
    Icon: DollarSign,
  },
  {
    currency: "GBP",
    Icon: PoundSterling,
  },
];

//somehow keep already chosen one like focused with a darker bg and the navigation icon should also be that one
//make this also change language
export default function CurrencyDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          title="change currency"
          className="hidden md:block"
          aria-label="show currencies"
        >
          <DollarSign />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-foreground text-white">
        <DropdownMenuLabel>Choose a currency</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {currencyElements.map((element) => (
          <DropdownMenuItem className="justify-between" key={element.currency}>
            {element.currency}
            <element.Icon />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

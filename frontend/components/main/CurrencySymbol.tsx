import { CurrencyISO } from "@/types/types";
import { DollarSignIcon, EuroIcon, PoundSterling } from "lucide-react";

function CurrencySymbol({ currency }: { currency: CurrencyISO }) {
  const symbolSize: number = 15;

  if (currency === "EUR") return <EuroIcon size={symbolSize} />;
  if (currency === "GBP") return <PoundSterling size={symbolSize} />;
  if (currency === "USD") return <DollarSignIcon size={symbolSize} />;
}

export default CurrencySymbol;

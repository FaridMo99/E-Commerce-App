import { CurrencyISO } from "@/types/types";
import { DollarSignIcon, EuroIcon, PoundSterling } from "lucide-react";

type CurrencySymbolProps = {
  currency: CurrencyISO;
  styles?: string
}

function CurrencySymbol({ currency, styles }:CurrencySymbolProps) {
  const symbolSize: number = 15;

  if (currency === "EUR") return <EuroIcon size={symbolSize} className={ styles} />;
  if (currency === "GBP") return <PoundSterling className={styles} size={symbolSize} />;
  if (currency === "USD") return <DollarSignIcon className={styles} size={symbolSize} />;
}

export default CurrencySymbol;

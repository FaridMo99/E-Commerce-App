import Screen from "./components/Screen";
import TestingDisclaimer from "./components/TestingDisclaimer";
import { STRIPE_ENV } from "@/config/constants";

function Page() {
  return (<div className="w-full h-full flex flex-col justify-between items-center">
    <Screen />
    {STRIPE_ENV === "testing" && <TestingDisclaimer/>}
    </div>
    )
}

export default Page;

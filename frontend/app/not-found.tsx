import NotFound from "@/components/main/NotFound";
import { Search } from "lucide-react";

function notFound() {
  return <NotFound icon={Search} text="Page not found..." />;
}

export default notFound;

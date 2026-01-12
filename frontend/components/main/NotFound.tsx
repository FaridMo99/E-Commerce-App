import "server-only";
import NotFoundButtonSection from "./NotFoundButtonSection";
import { LucideIcon } from "lucide-react";

type NotFoundProps = {
  text: `${string} not found...`;
  icon: LucideIcon;
};

function NotFound({ text, icon: Icon }: NotFoundProps) {
  return (
    <div className="w-full h-[30vh] mt-14 flex flex-col justify-between items-center text-3xl font-bold text-white">
      {text}
      <Icon className="text-foreground" size={100} />
      <NotFoundButtonSection />
    </div>
  );
}

export default NotFound;

import { Loader2 } from "lucide-react";

function loading() {
  return (
    <div className="w-full h-[75vh] flex justify-center items-center">
      <Loader2 className="animate-spin" size={100} />
    </div>
  );
}

export default loading;

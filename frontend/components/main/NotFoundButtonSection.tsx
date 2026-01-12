"use client";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";

function NotFoundButtonSection() {
  const router = useRouter();

  function goHome(): void {
    router.push("/");
  }

  function goBack(): void {
    router.back();
  }
  return (
    <div className="w-full flex justify-center items-center gap-3 mt-4">
      <Button className="bg-foreground" variant="outline" onClick={goBack}>
        Go Back
      </Button>
      <Button className="bg-foreground" variant="outline" onClick={goHome}>
        Go Home
      </Button>
    </div>
  );
}

export default NotFoundButtonSection;

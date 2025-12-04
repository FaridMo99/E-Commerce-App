"use client";
import { logout } from "@/lib/queries/server/authQueries";
import useAuth from "@/stores/authStore";
import { AccessToken } from "@/types/types";
import { Loader2, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type LogoutButtonProps = {
  accessToken: AccessToken;
  text?:boolean
};

function LogoutButton({ accessToken, text }: LogoutButtonProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();
  const errorMessage = "Something went wrong. Try again later.";
  const clearState = useAuth((state) => state.clearState);

  async function logoutHandler() {
    if (!accessToken) return toast.error(errorMessage);

    try {
      setIsLoading(true);
      await logout(accessToken);
      clearState();
      router.refresh();
      toast.success("Logout successful!");
    } catch (err) {
      toast.error(errorMessage);
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      disabled={isLoading}
      onClick={logoutHandler}
      title="logout"
      className={`${text ? "md:hidden flex items-center px-4" : "hidden md:block"} ${isLoading ? "cursor-wait" : "cursor-pointer"}`}
      aria-label="logout"
    >
      {isLoading ? (
        <Loader2 className="animate-spin" />
      ) : text ? (
          "Logout"
      ) : (
        <LogOut />
      )}
    </button>
  );
}

export default LogoutButton;

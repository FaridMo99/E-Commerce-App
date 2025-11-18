"use client";
import { logout } from "@/lib/queries/authQueries";
import useAuth from "@/stores/authStore";
import { AccessToken } from "@/types/types";
import { Loader2, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type LogoutButtonProps = {
  accessToken: AccessToken,
}

function LogoutButton({accessToken}:LogoutButtonProps) {

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();
  const errorMessage = "Something went wrong. Try again later.";
  const clearState = useAuth(state=>state.clearState)

  async function logoutHandler() {
    if (!accessToken) return toast.error(errorMessage);

    try {
      setIsLoading(true);
      await logout(accessToken);
      clearState()
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
      className={`hidden md:block ${isLoading ? "cursor-wait" : "cursor-pointer"}`}
      aria-label="logout"
    >
      {!isLoading ? <LogOut /> : <Loader2 className="animate-spin" />}
    </button>
  );
}

export default LogoutButton;

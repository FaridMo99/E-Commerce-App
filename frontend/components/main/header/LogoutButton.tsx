"use client";
import { logout } from "@/lib/queries/client/authQueries";
import useAuth from "@/stores/authStore";
import { useMutation } from "@tanstack/react-query";
import { Loader2, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type LogoutButtonProps = {
  text?:boolean
};

function LogoutButton({ text }: LogoutButtonProps) {
  const router = useRouter();
  const {clearState, accessToken} = useAuth((state) => state);

  const { mutate, isPending } = useMutation({
    mutationKey: ["logging user out"],
    mutationFn: () => logout(accessToken!),
    onError: () => {
      toast.error("Something went wrong.Try again")
    },
    onSuccess: () => {
      clearState()
      router.refresh()
      toast.success("Logout successful!");
    }
  })

  return (
    <button
      disabled={isPending}
      onClick={() => mutate()}
      title="logout"
      className={`${text ? "md:hidden flex items-center px-4" : "hidden md:block"} ${isPending ? "cursor-wait" : "cursor-pointer"}`}
      aria-label="logout"
    >
      {isPending ? (
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

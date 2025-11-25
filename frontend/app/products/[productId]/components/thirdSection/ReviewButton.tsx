"use client";
import useAuth from "@/stores/authStore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ReviewModal } from "./ReviewModal";
import { JSX } from "react";

type ReviewButtonProps = {
  buttonText: string | JSX.Element;
  emptyReviews?: boolean;
};

function ReviewButton({emptyReviews, buttonText}:ReviewButtonProps) {
  const accessToken = useAuth((state) => state.accessToken);
  const router = useRouter();

  function clickHandler(e: React.MouseEvent<HTMLButtonElement>) {
      if (!accessToken) {
      e.preventDefault();
      toast.info("You have to be logged in to give a review");
      router.push("/login");
    }
  }

  if(emptyReviews) return (
      <div className=" flex justify-center items-center gap-2 self-center pt-20">
        <p className="">Pretty empty in here... </p>
        <ReviewModal buttonText="Leave a Review" clickHandler={clickHandler} defaultPublic />
      </div>
  );
  
  return (
    <ReviewModal
      buttonText={buttonText}
      clickHandler={clickHandler}
      defaultPublic
    />
  );
}

export default ReviewButton;

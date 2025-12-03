"use client"
import LoadingPage from "@/components/main/LoadingPage";
import { getUserReviews } from "@/lib/queries/client/usersQueries";
import useAuth from "@/stores/authStore";
import { useQuery } from "@tanstack/react-query";
import ReviewCard from "./components/ReviewCard";
import SectionWrapper from "@/components/main/SectionWrapper";


function Page() {
  const accessToken = useAuth(state=>state.accessToken)

  const { data: reviews, isLoading, isError, error } = useQuery({
    queryKey: ["get user product reviews"],
    queryFn: () => getUserReviews(accessToken!),
    placeholderData:pre=>pre
  })

  if(isLoading) return <LoadingPage />
  if (isError) throw error
  
  return (
    <SectionWrapper header="Reviews" as="main" styles="px-8">
      <div className="w-full flex flex-col justify-between items-center">
        {reviews?.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </SectionWrapper>
  );
}

export default Page;

"use client"

import LoadingPage from "@/components/main/LoadingPage";
import { getUserReviews } from "@/lib/queries/client/usersQueries";
import useAuth from "@/stores/authStore";
import { useQuery } from "@tanstack/react-query";
import ReviewCard from "./components/ReviewCard";



//server component not possible since accesstoken needed which only exists client side
//but also not important for seo

//custom error page and throw on iserror to trigger it
function Page() {
  const accessToken = useAuth(state=>state.accessToken)

  const { data: reviews, isLoading, isError, error } = useQuery({
    queryKey: ["get user product reviews"],
    queryFn: () => getUserReviews(accessToken!),
  })

  if(isLoading) return <LoadingPage />
  if (isError) throw error
  
  return (
    <main className="px-8">
      <h2 className="text-3xl font-extrabold mb-2">Reviews({reviews?.length})</h2>
      <div className="w-full flex flex-col justify-between items-center">
        {reviews?.map(review=><ReviewCard key={review.id} review={review}/>)}
      </div>
    </main>
  );
}

export default Page;

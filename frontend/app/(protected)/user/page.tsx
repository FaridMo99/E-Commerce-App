"use client"
import { useQuery } from "@tanstack/react-query";
import { getUser } from "@/lib/queries/client/usersQueries";
import useAuth from "@/stores/authStore";
import LoadingPage from "@/components/main/LoadingPage";
import UserTabs from "./components/UserTabs";
import SectionWrapper from "@/components/main/SectionWrapper";

function Page() {
  const accessToken = useAuth(state => state.accessToken)
  
  const { data: user, isLoading, isError, error } = useQuery({
    queryKey: ["get user"],
    queryFn:()=>getUser(accessToken!)
  })

  if (isLoading) return <LoadingPage />

  if (isError || !user) throw error

  return (
    <SectionWrapper as="main" header={`Welcome ${user?.name}`} styles="px-8">
      <p>Here you can Edit your Account</p>
      <UserTabs user={user} />
    </SectionWrapper>
  );
}

export default Page;

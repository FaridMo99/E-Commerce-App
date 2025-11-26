"use client"
import { useQuery } from "@tanstack/react-query";
import DeleteAccountButton from "./components/DeleteAccountButton";
import { getUser } from "@/lib/queries/client/usersQueries";
import useAuth from "@/stores/authStore";
import LoadingPage from "@/components/main/LoadingPage";
import { UpdateAccountModal } from "./components/UpdateAccountModal";


//if oauth user with out password, give info here he can set password here
//make delete a modal
//make birthdate and address cleaner
//changing email should,
  //require old password to do so
  //send email to old account to ask if it was you, if not you can change password with link
  //new email address has to verify with link
  //same for backend

function Page() {
  const accessToken = useAuth(state => state.accessToken)
  
  const { data: user, isLoading, isError, error } = useQuery({
    queryKey: ["get user"],
    queryFn:()=>getUser(accessToken!)
  })

  if (isLoading) return <LoadingPage />

  if(isError) throw error

  return (
    <main className="px-8">
      <h1 className="text-3xl font-extrabold mb-2">
        Welcome {user?.name}
      </h1>
      <p>Here you can Edit your Account</p>
      <UpdateAccountModal/>
      <DeleteAccountButton />
    </main>
  );
}

export default Page;

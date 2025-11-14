import ChangePasswordForm from "@/components/forms/change-password-form";
import "server-only";


//thats the email link redirect for changing your password as a user when forgetting, the token is in searchparams
//!!!! its not the route for when logged in changing the password
//add useauth and storing in state to all routes and other auth stuff you have to do etc. pp.
async function page({ searchParams }: { searchParams?: { token: string } }) {
  const param = await searchParams;
  if (!param?.token) throw new Error();

  const token = param.token;

  return <ChangePasswordForm token={token} />;
}

export default page;
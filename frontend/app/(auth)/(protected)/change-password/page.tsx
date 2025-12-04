import ChangePasswordForm from "@/components/forms/change-password-form";
import "server-only";

//thats the email link redirect for changing your password as a user when forgetting, the token is in searchparams
//!!!! its not the route for when logged in changing the password
async function page(props: PageProps<"/change-password">) {
  const {token} = await props.searchParams;
  if (!token) throw new Error();


  return <ChangePasswordForm token={token[0] ?? token} />;
}

export default page;

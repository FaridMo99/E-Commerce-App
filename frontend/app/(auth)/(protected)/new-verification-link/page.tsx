import NewVerifyLinkForm from "@/components/forms/new-verify-link-form";
import "server-only";

//this is for when signed up but the link expired/not found etc.
function page() {
  return (
    <NewVerifyLinkForm headerText="Enter your E-Mail to request a new Link" />
  );
}

export default page;

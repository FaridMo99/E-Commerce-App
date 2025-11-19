import NewVerifyLinkForm from "@/components/forms/new-verify-link-form";
import "server-only";


function page() {
  return (
    <NewVerifyLinkForm headerText="Enter your E-Mail to request a new Link" />
  );
}

export default page;

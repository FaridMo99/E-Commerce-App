import { Metadata } from "next";
import "server-only";

export const metadata: Metadata = {
  title: "Authentication",
  description: "Log in or create an account.",
};

async function layout(props: LayoutProps<"/">) {
  return (
    <div className="flex w-full h-full items-center justify-center">
      <div className="w-full max-w-sm">{props.children}</div>
    </div>
  );
}

export default layout;

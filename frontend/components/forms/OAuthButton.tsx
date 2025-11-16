"use client";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { ReactNode } from "react";
import { apiBaseUrl } from "@/config/constants";
import { OAuthProvider } from "@/types/types";

type OAuthButtonProps = {
  bgColor: `#${string}`;
  logoSvg: ReactNode;
  disabled: boolean;
  provider: OAuthProvider;
  text: string;
};

function OAuthButton({
  bgColor,
  logoSvg,
  disabled,
  provider,
  text,
}: OAuthButtonProps) {
  const router = useRouter();
  return (
    <Button
      disabled={disabled}
      style={{ backgroundColor: bgColor, color: "white" }}
      type="button"
      onClick={() => {
        router.push(`${apiBaseUrl}/auth/oauth/${provider}`);
      }}
    >
      {logoSvg}
      <span>{text}</span>
    </Button>
  );
}

export default OAuthButton;

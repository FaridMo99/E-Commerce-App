"use client";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import useAuth from "@/stores/authStore";
import { AccessToken, User } from "@/types/types";
import { CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type SuccessCardProps = {
  action: "Signup" | "Login",
  accessToken: AccessToken,
  user:User
}

function SuccessCard({ action, accessToken, user }:SuccessCardProps) {
  const [counter, setCounter] = useState<number>(3);
  const router = useRouter();
  const setState = useAuth(state => state.setState)

    useEffect(() => {
      setState(accessToken, user);
    }, [accessToken, user, setState]);
  
  useEffect(() => {
    if (counter === 0) {
      router.push("/");
      return;
    }

    const timer = setTimeout(() => {
      setCounter((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [counter, router]);

  return (
    <Card className="h-100 bg-backgroundBright justify-center items-center text-center text-white text-lg font-bold">
      <CardTitle>
        {action} successful! You&apos;ll be redirected shortly...{counter}
      </CardTitle>
      <CardContent>
        <CheckCircle2 className="text-foreground" size={50} />
      </CardContent>
    </Card>
  );
}

export default SuccessCard;

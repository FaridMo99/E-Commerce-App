"use client";

import { Route } from "@/types/types";
import { BookOpen, ChartColumn } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const routes: Route[] = [
  {
    icon: ChartColumn,
    text: "Dashboard",
    link: "/user/dashboard",
  },
  {
    icon: BookOpen,
    text: "Product Actions",
    link: "/user/actions",
  },
];

function Navbar() {
  const pathname = usePathname();

  return (
    <aside className="h-screen w-[10vw] bg-foreground fixed top-0 left-0 pt-[20vh] flex flex-col items-center">
      {routes.map((route) => {
        const isActive = pathname.startsWith(route.link);

        return (
          <Link
            key={route.link}
            href={route.link}
            title={route.text}
            className={`mb-4 w-8/10 h-14 flex justify-center items-center rounded-lg
              bg-foreground hover:brightness-120
              ${isActive ? "brightness-125" : ""}
            `}
          >
            <route.icon className="text-white" />
          </Link>
        );
      })}
    </aside>
  );
}

export default Navbar;

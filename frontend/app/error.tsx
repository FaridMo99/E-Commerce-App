"use client";
import NotFoundButtonSection from "@/components/main/NotFoundButtonSection";

function Error() {
  return (
    <main className="w-full h-[50vh] flex justify-center items-center flex-col text-white">
      <h1 className="text-2xl font-extrabold">Oops, something went wrong...</h1>
      <NotFoundButtonSection />
    </main>
  );
}

export default Error;

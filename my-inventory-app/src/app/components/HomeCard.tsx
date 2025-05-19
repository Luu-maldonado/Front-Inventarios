"use client";

import { useRouter } from "next/navigation";
import { ReactNode } from "react";

interface HomeCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  route: string;
}

export default function HomeCard({ title, description, icon, route }: HomeCardProps) {
  const router = useRouter();

  return (
    <div
      className=" bg-[#27272A] text-[#FFFFFF] p-4 rounded-lg shadow-md hover:shadow-xl transition cursor-pointer hover:bg-zinc-700"
      onClick={() =>  router.push(route)}
    >
      <h3 className="flex justify-center mb-6 text-center text-xl font-semibold mb-2">{title}</h3>
      <div className="flex justify-center text-3xl mb-4">{icon}</div>
      <p className="flex text-center text-sm text-zinc-300">{description}</p>
    </div>
  );
}

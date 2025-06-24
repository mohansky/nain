"use client";

import { calculateAge } from "@/lib/utils";
import type { ChildCardButtonProps } from "@/types";
import UserAvatar from "../ui/userAvatar";

export default function ChildCardButton({ child }: ChildCardButtonProps) {
  const age = calculateAge(child.dateOfBirth);
  return (
    <div className="card">
      <div key={child.id} className="flex items-center space-x-3 mb-5">
        <UserAvatar src={child.profileImage} alt={child.name} size={100} />
        <div className="flex flex-col">
          <h3 className="text-xl font-bold">{child.name}</h3>
          <p className="text-sm text-base-content/60">{age.ageString}</p>
        </div>
      </div>
    </div>
  );
}

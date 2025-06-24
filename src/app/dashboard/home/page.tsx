"use client";
// Home page.tsx
import ChildCardButton from "@/components/children/child-card-button";
import AccessDenied from "@/components/layout/accessDenied";
// import ActivityCard from "@/components/styledcomps/activityCard";
import ChildDevelopmentDashboard from "@/components/styledcomps/childDevelopment";
import { useChildren } from "@/hooks/useChildren";
import { useSession } from "@/lib/auth-client";

export default function ProfilePage() {
  const { data: session, isPending } = useSession();
  const { children } = useChildren();

  if (isPending) {
    return (
      <div className="container mx-auto mt-20 p-6">
        <div className="flex w-52 flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="skeleton h-32 w-32 shrink-0 rounded-full"></div>
            <div className="flex flex-col gap-4">
              <div className="skeleton h-4 w-32"></div>
              <div className="skeleton h-4 w-44"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return <AccessDenied />;
  }

  return (
    <div className="container max-w-lg mx-auto p-6">
      {children.map((child) => (
        <ChildCardButton key={child.id} child={child} />
      ))}

      <ChildDevelopmentDashboard />
    </div>
  );
}

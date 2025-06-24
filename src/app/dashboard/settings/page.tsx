"use client";
// src/pages/dashboard/settings.tsx
import { useSession } from "@/lib/auth-client";
import { useUserProfile } from "@/hooks/useUserProfile";
import { formatDate } from "@/lib/utils";
import AccessDenied from "@/components/layout/accessDenied";
import { Card, CardContent } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import UserAvatar from "@/components/ui/userAvatar";
import UserProfileForm from "@/components/forms/user-profile-form";
import { Suspense } from "react";
import Loading from "./loading";

export default function DashboardPage() {
  const { data: session, isPending } = useSession();
  const {
    data: profileData,
    isLoading: isProfileLoading,
    error: profileError,
    refetch: refetchProfile,
  } = useUserProfile();
 
  const handleProfileUpdate = async () => { 
    await refetchProfile(); 
    window.location.reload();
  };

  if (isPending) {
    return (
      <Loading /> 
    );
  }

  if (!session) {
    return <AccessDenied />;
  }

  return (
    <Suspense fallback={<Loading />}>

    <div className="container max-w-lg pb-20 mx-auto p-6">
      <Card>
        <CardContent>
          <Heading size="sm" fontstyle="openSans" className="font-bold">
            Profile Info
          </Heading>
          
          {isProfileLoading ? (
            <Loading />
          ) : profileError ? (
            <div className="alert alert-error">
              <span className="text-sm">{profileError}</span>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between space-x-2">
                <UserAvatar
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  size={80}
                />
                <div>
                  {!profileData?.userProfile?.onboardingCompleted ? (
                    <a href="/onboarding" className="btn btn-warning btn-sm">
                      Complete Setup
                    </a>
                  ) : (
                    <UserProfileForm onProfileUpdate={handleProfileUpdate} />
                  )}
                </div>
              </div>

              {/* Basic Info */}
              <div className="space-y-3">
                <span className="flex flex-col">
                  <small>Name</small>
                  <Heading fontweight="normal" size="xs" className="mb-0">
                    {session.user.name}
                  </Heading>
                  <p className="text-xs opacity-60">
                    Member since {formatDate(session.user.createdAt)}
                  </p>
                </span>
                <span className="flex flex-col">
                  <small>Email</small>
                  <Heading fontweight="normal" size="xs">
                    {session.user.email}
                  </Heading>
                </span>
                {profileData?.userProfile ? (
                  <>
                    {profileData.userProfile.phone && (
                      <span className="flex flex-col">
                        <small>Phone</small>
                        <Heading fontweight="normal" size="xs">
                          {profileData.userProfile.phone}
                        </Heading>
                      </span>
                    )}
                    <span className="flex flex-col">
                      <small>Language</small>
                      <Heading fontweight="normal" size="xs">
                        {getLanguageFlag(profileData?.userProfile?.language)}
                      </Heading>
                    </span>

                    <div className="flex items-center justify-between space-x-2">
                      <div
                        className={`badge badge-md badge-soft ${
                          profileData.userProfile.onboardingCompleted
                            ? "badge-success"
                            : "badge-warning"
                        }`}
                      >
                        {profileData.userProfile.onboardingCompleted
                          ? "Onboarding Complete"
                          : "Onboarding Incomplete"}
                      </div>

                      <span
                        className={`badge badge-md badge-soft ${
                          session.user.emailVerified
                            ? "badge-success"
                            : "badge-error"
                        }`}
                      >
                        {session.user.emailVerified
                          ? "Email verified"
                          : "Email not verified"}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="alert alert-info">
                    <span className="text-sm">Profile not set up yet</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      {profileError && (
        <div className="toast toast-top toast-end">
          <div className="alert alert-error">
            <span>Failed to load profile data</span>
          </div>
        </div>
      )}
    </div>
    </Suspense>
  );
}

// Helper function to get language flag
function getLanguageFlag(language: string | undefined): string {
  const languageFlags: Record<string, string> = {
    English: "A English",
    Hindi: "अ Hindi",
    Assamese: "ৰ Assamese",
    Bengali: "র Bengali",
    Kannada: "ಕ Kannada",
    Tamil: "ம Tamil",
    Marathi: "अ Marathi",
  };

  return languageFlags[language || ""] || "🌐";
}
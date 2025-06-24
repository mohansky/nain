"use client";
// src/components/auth/user-menu.tsx
import { useSession, signOut } from "@/lib/auth-client";
import Link from "next/link";
import UserAvatar from "@/components/ui/userAvatar";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "../ui/button";

export default function UserMenu() {
  const { data: session, isPending } = useSession();
  const navigationItems = [
    {
      href: "/dashboard/settings",
      label: "Settings",
    },
    {
      href: "/dashboard/children",
      label: "Children",
    },
    {
      href: "/dashboard/activity",
      label: "Activity",
    },
    {
      href: "/dashboard/milestones",
      label: "Milestones",
    },
  ];

  if (isPending) {
    return <div className="skeleton h-10 w-10 rounded-full"></div>;
  }

  if (!session) {
    return (
      <div className="navbar-end">
        <Link href="/auth/signin" className="btn btn-ghost">
          Sign In
        </Link>
        <Link href="/auth/signup" className="btn btn-primary">
          Sign Up
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* <div className="navbar-end">
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button">
            <UserAvatar
              className={session ? "avatar-online" : "avatar-offline"}
              src={session.user.image}
              alt={session.user.name || "User"}
            />
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52 space-y-2.5"
          >
            <li>
              <span className="font-semibold mx-auto">
                Signed in as {session.user.name}
              </span>
            </li>
            {navigationItems.map((item, index) => (
              <li key={index}>
                <Link href={item.href} className="btn btn-soft">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <button
                className="btn btn-error"
                onClick={async () => {
                  await signOut({
                    fetchOptions: {
                      onSuccess: () => {
                        window.location.href = "/";
                      },
                    },
                  });
                }}
              >
                Sign Out
              </button>
            </li>
          </ul>
        </div>
      </div> */}
      <Sheet>
        <SheetTrigger asChild>
          <div tabIndex={0} role="button">
            <UserAvatar
              className={session ? "avatar-online" : "avatar-offline"}
              src={session.user.image}
              alt={session.user.name || "User"}
            />
          </div>
        </SheetTrigger>
        <SheetContent >
          <SheetHeader>
            <SheetTitle className="pt-10">Account</SheetTitle>
            <div>
              <UserAvatar
                className={session ? "avatar-online" : "avatar-offline"}
                src={session.user.image}
                alt={session.user.name || "User"}
              />
            </div>
            <SheetDescription>
              Signed in as {session.user.name}
            </SheetDescription>
          </SheetHeader>

          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow-none bg-base-100 rounded-box w-full space-y-2.5"
          >
            {navigationItems.map((item, index) => (
              <li key={index}>
                <Link href={item.href} className="btn btn-soft">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <SheetFooter>
            <SheetClose asChild>
              <Button
                variant="error"
                onClick={async () => {
                  await signOut({
                    fetchOptions: {
                      onSuccess: () => {
                        window.location.href = "/";
                      },
                    },
                  });
                }}
              >
                Sign Out
              </Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}

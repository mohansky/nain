// src/app/auth/signin/page.tsx
import SignInForm from "@/components/auth/sign-in-form";
import Link from "next/link";

export default function SignInPage() {
  return (
    <div className="hero min-h-screen">
      <div className="w-full max-w-sm">
        <SignInForm />
        <div className="text-center mt-4">
          <span className="text-sm">Dont have an account? </span>
          <Link href="/auth/signup" className="link link-primary">
            Sign up here
          </Link>
        </div>
      </div>
    </div>
  );
}

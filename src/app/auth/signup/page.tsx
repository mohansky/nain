// src/app/auth/signup/page.tsx
import SignUpForm from "@/components/auth/sign-up-form";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <div className="hero min-h-screen">
      <div className="w-full max-w-sm">
        <SignUpForm />
        <div className=" text-center mt-4">
          <span className="text-sm">Already have an account? </span>
          <Link href="/auth/signin" className="link link-primary">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
}

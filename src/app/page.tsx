// Home page.tsx
import Image from "next/image";

export default function Home() {
  return (
    <div className="hero min-h-screen">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold">Welcome to</h1>
          <Image src="/nainlogo.svg" alt="Nain Logo" width={150} height={150} className="mx-auto my-5" />
          <p className="py-6">
            Helping you to manage your child&apos;s development
          </p>
          <div className="space-x-4">
            <a href="/auth/signin" className="btn btn-primary">
              Get Started
            </a>
            <a href="/dashboard" className="btn btn-outline">
              Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
// Home page.tsx
export default function Home() {
  return (
    <div className="hero min-h-screen">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold">Hello there</h1>
          <p className="py-6">
            Welcome to our awesome app built with Better Auth, Next.js, Turso, and DaisyUI!
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
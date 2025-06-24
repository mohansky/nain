import React from "react";

export default function AccessDenied() {
  return (
    <div className="hero min-h-screen">
      <div className="hero-content text-center">
        <div>
          <h1 className="text-3xl font-bold">Access Denied</h1>
          <p className="py-6">Please sign in to access the dashboard.</p>
          <a href="/auth/signin" className="btn btn-primary">
            Sign In
          </a>
        </div>
      </div>
    </div>
  );
}

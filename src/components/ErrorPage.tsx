/**
 * ErrorPage — React Router error boundary page. Catches routing errors
 * and displays the error message or status text to the user.
 */
import React from "react";
import { useRouteError } from "react-router-dom";

export default function ErrorPage() {
  const error = useRouteError() as { statusText?: string; message?: string };
  console.error(error);

  return (
    <div className="flex items-center justify-center min-h-screen bg-surface">
      <div className="text-center px-8 py-10 rounded-md bg-surface-card border border-surface-border shadow-card max-w-md">
        <h1 className="text-4xl font-bold text-accent mb-4">Oops!</h1>
        <p className="text-gray-400 mb-2">Sorry, an unexpected error has occurred.</p>
        <p className="text-gray-500 text-sm italic">
          {error.statusText || error.message}
        </p>
      </div>
    </div>
  );
}
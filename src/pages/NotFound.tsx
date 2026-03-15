import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <h1 className="text-6xl font-bold text-gray-300">404</h1>
      <p className="mt-2 text-lg text-gray-600">Page not found</p>
      <Link
        to="/"
        className="mt-4 rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
      >
        Back to Home
      </Link>
    </div>
  );
}

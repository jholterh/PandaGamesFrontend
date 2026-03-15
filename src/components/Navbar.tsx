import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <nav className="border-b-2 border-dashed border-panda-green/20 bg-panda-cream/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 text-xl font-black text-panda-black">
          <span className="text-2xl">🐼</span>
          <span className="font-nunito tracking-tight">Panda Gang</span>
        </Link>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link
                to="/profile"
                className="text-sm font-semibold text-panda-green hover:text-panda-green-light"
              >
                🎋 {user?.username}
              </Link>
              <button
                onClick={logout}
                className="text-sm text-panda-black/50 hover:text-panda-black/80"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/sign-in"
                className="text-sm font-semibold text-panda-black/60 hover:text-panda-black"
              >
                Sign In
              </Link>
              <Link
                to="/sign-up"
                className="rounded-full bg-panda-green px-4 py-1.5 text-sm font-bold text-white shadow-sm transition hover:bg-panda-green-light hover:shadow-md"
              >
                Join the Gang
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

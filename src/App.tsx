import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { Navbar } from "./components/Navbar";
import { Dashboard } from "./pages/Dashboard";
import { AppPage } from "./pages/AppPage";
import { LeaderboardPage } from "./pages/LeaderboardPage";
import { Profile } from "./pages/Profile";
import { NotFound } from "./pages/NotFound";
import { SignIn } from "./auth/SignIn";
import { SignUp } from "./auth/SignUp";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="/sign-up" element={<SignUp />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route path="/apps/:slug" element={<AppPage />} />
            <Route path="/leaderboards/:slug" element={<LeaderboardPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

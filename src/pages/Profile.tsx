import { useState, useEffect, type FormEvent } from "react";
import api from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { Spinner } from "../components/Spinner";

export function Profile() {
  const { user } = useAuth();
  const [username, setUsername] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (user) setUsername(user.username);
  }, [user]);

  if (!user) return <Spinner />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      await api.put("/api/v1/users/me", { username });
      setMessage("Profile updated!");
    } catch (err: any) {
      setMessage(err.response?.data?.errors?.join(", ") || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Profile</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            disabled
            value={user.email}
            className="w-full rounded border border-gray-200 bg-gray-50 px-3 py-2 text-gray-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Username
          </label>
          <input
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {message && (
          <p className="text-sm text-gray-600">{message}</p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="rounded bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </form>
    </div>
  );
}

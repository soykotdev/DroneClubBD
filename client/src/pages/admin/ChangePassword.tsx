import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { changePasswordSchema } from "@droneclub/shared";
import { api, ApiRequestError } from "@/lib/api";
import { useAuth } from "@/features/auth/AuthProvider";

/** Forced initial-password change, per spec Sections 14 & 25. */
export default function ChangePassword() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    const parsed = changePasswordSchema.safeParse({ currentPassword, newPassword, confirmPassword });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/auth/change-password", parsed.data);
      // Password change revokes every session server-side — sign in again with the new password.
      await logout();
      navigate("/admin/login", { replace: true });
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Unable to change password.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-light px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="font-heading text-xl font-semibold text-brand-black">Set a New Password</h1>
        <p className="mt-2 text-sm text-brand-graphite">
          You&apos;re using a temporary password. Choose a new one before continuing.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <input
            type="password"
            required
            placeholder="Current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="min-h-[44px] w-full rounded-lg border border-brand-border px-4 focus:border-brand-red focus:outline-none"
          />
          <input
            type="password"
            required
            placeholder="New password (min. 12 characters)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="min-h-[44px] w-full rounded-lg border border-brand-border px-4 focus:border-brand-red focus:outline-none"
          />
          <input
            type="password"
            required
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="min-h-[44px] w-full rounded-lg border border-brand-border px-4 focus:border-brand-red focus:outline-none"
          />

          {error && (
            <p role="alert" className="text-sm text-brand-red">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="min-h-[44px] w-full rounded-full bg-brand-red text-sm font-semibold text-white transition hover:bg-brand-red-dark disabled:opacity-60"
          >
            {submitting ? "Updating…" : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

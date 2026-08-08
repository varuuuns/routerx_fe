import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Logo } from "../components/Logo";
import { Button } from "../components/Button";
import { useAuth } from "../lib/auth";
import { api, ApiError } from "../lib/api";

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const pendingLongLink = (location.state as { longLink?: string } | null)?.longLink;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      await register(username, password);

      // If they arrived here from the landing-page shorten form, finish the
      // job now that they have an account, and hand the result to the dashboard.
      if (pendingLongLink) {
        try {
          const shortened = await api.shorten({ longLink: pendingLongLink });
          navigate("/dashboard", { state: { justCreated: shortened } });
          return;
        } catch {
          // Registration still succeeded even if this particular shorten failed
          // (e.g. rare alias collision) - fall through to a plain dashboard visit.
        }
      }
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-soft px-6">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-white p-8">
        <Link to="/" className="block text-center">
          <Logo />
        </Link>
        <h1 className="mt-6 text-center text-xl font-bold text-ink">Create your account</h1>
        <p className="mt-1 text-center text-sm text-sub">
          {pendingLongLink ? "One account and we'll shorten your link." : "Free, self-hosted, yours."}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-ink">
            Username
            <input
              required
              minLength={3}
              maxLength={32}
              pattern="[a-zA-Z0-9\-_.]+"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="rounded-lg border border-border px-3.5 py-2.5 text-sm focus:border-accent focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-ink">
            Password
            <input
              required
              type="password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg border border-border px-3.5 py-2.5 text-sm focus:border-accent focus:outline-none"
            />
            <span className="text-xs text-muted">At least 8 characters.</span>
          </label>

          {error && <p className="text-sm font-medium text-red-600">{error}</p>}

          <Button type="submit" variant="primary" className="mt-2 w-full" disabled={loading}>
            {loading ? "Creating account…" : "Sign up free"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-sub">
          Already have an account?{" "}
          <Link to="/login" state={location.state} className="font-semibold text-accent">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

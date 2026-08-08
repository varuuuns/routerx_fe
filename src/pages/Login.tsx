import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Logo } from "../components/Logo";
import { Button } from "../components/Button";
import { useAuth } from "../lib/auth";
import { ApiError } from "../lib/api";

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(username, password);
      navigate("/dashboard", { state: location.state });
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
        <h1 className="mt-6 text-center text-xl font-bold text-ink">Log in to routerx</h1>
        <p className="mt-1 text-center text-sm text-sub">Own your links. Own your data.</p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-ink">
            Username
            <input
              required
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg border border-border px-3.5 py-2.5 text-sm focus:border-accent focus:outline-none"
            />
          </label>

          {error && <p className="text-sm font-medium text-red-600">{error}</p>}

          <Button type="submit" variant="primary" className="mt-2 w-full" disabled={loading}>
            {loading ? "Logging in…" : "Log in"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-sub">
          Don't have an account?{" "}
          <Link to="/register" state={location.state} className="font-semibold text-accent">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

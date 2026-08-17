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
    <div className="flex min-h-screen items-center justify-center bg-surface px-6">
      <div className="w-full max-w-sm rounded-xl border border-border bg-white p-8">
        <Link to="/" className="block text-center">
          <Logo />
        </Link>
        <h1 className="mt-6 text-center font-serif text-2xl text-ink italic">Log in to routerx</h1>
        <p className="mt-1 text-center text-sm text-sub">Own your links. Own your data.</p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-ink">
            Username
            <input
              required
              name="username"
              autoComplete="username"
              spellCheck={false}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="rounded-md border border-border px-3.5 py-2.5 text-sm focus:border-ink focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-ink">
            Password
            <input
              required
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-md border border-border px-3.5 py-2.5 text-sm focus:border-ink focus:outline-none"
            />
          </label>

          {error && <p className="text-sm font-medium text-[#9F2F2D]">{error}</p>}

          <Button type="submit" className="mt-2 w-full" disabled={loading}>
            {loading ? "Logging in…" : "Log in"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-sub">
          Don't have an account?{" "}
          <Link to="/register" state={location.state} className="font-medium text-pale-blue-text">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

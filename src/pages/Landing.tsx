import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Logo } from "../components/Logo";
import { Button } from "../components/Button";
import { useAuth } from "../lib/auth";
import { api, ApiError, type ShortenResponse } from "../lib/api";

const FEATURES = [
  {
    glyph: "⌂",
    title: "Custom domains",
    desc: "Serve short links from routerx.in or any domain you own — not a shared, throwaway one.",
  },
  {
    glyph: "◔",
    title: "Real-time analytics",
    desc: "Every click streamed through ClickHouse and queryable the moment it happens.",
  },
  {
    glyph: "▣",
    title: "Self-hosted",
    desc: "Runs entirely on infrastructure you control. Your links, your data, no vendor lock-in.",
  },
  {
    glyph: "▹",
    title: "API-first",
    desc: "A clean REST API with JWT auth behind every operation — built for automation.",
  },
];

export function Landing() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [longLink, setLongLink] = useState("");
  const [result, setResult] = useState<ShortenResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!longLink.trim()) return;

    if (!isAuthenticated) {
      // Anonymous visitors can't call POST /v1/shorten (it's JWT-protected) -
      // send them to create an account first, carrying the URL along so we
      // can shorten it for them right after.
      navigate("/register", { state: { longLink } });
      return;
    }

    setLoading(true);
    try {
      const res = await api.shorten({ longLink });
      setResult(res);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <nav className="flex items-center justify-between border-b border-border px-16 py-6">
        <Logo />
        <div className="flex items-center gap-8 text-sm font-medium text-sub">
          <span>Docs</span>
          <span>Analytics</span>
          <span>Self-hosting</span>
        </div>
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link to="/dashboard">
              <Button variant="dark">Go to dashboard</Button>
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-sm font-semibold text-ink">
                Log in
              </Link>
              <Link to="/register">
                <Button variant="dark">Sign up free</Button>
              </Link>
            </>
          )}
        </div>
      </nav>

      <section className="flex flex-col items-center px-16 pt-28 pb-24 text-center">
        <span className="rounded-full bg-accent-soft px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.2em] text-accent">
          SELF-HOSTED · OWN YOUR INFRASTRUCTURE
        </span>

        <h1 className="mt-7 max-w-3xl text-6xl font-extrabold tracking-tight text-ink">
          Own every link you shorten.
        </h1>

        <p className="mt-7 max-w-xl text-lg leading-relaxed text-sub">
          A self-hosted link shortener with real-time click analytics, custom domains, and zero
          vendor lock-in — running on infrastructure you control end to end.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-7 flex w-full max-w-xl items-center gap-2 rounded-full border border-border bg-white p-2"
        >
          <input
            type="url"
            required
            value={longLink}
            onChange={(e) => setLongLink(e.target.value)}
            placeholder="https://your-really-long-link.com/campaign/summer"
            className="flex-1 bg-transparent px-4 py-2.5 text-sm text-ink placeholder:text-muted focus:outline-none"
          />
          <Button type="submit" variant="primary" className="rounded-full" disabled={loading}>
            {loading ? "Shortening…" : "Shorten"}
          </Button>
        </form>

        {result && (
          <a
            href={`https://routerx.in/${result.shortAlias}`}
            target="_blank"
            rel="noreferrer"
            className="mt-3 flex items-center gap-2 text-sm font-medium text-accent"
          >
            → <span className="font-mono">routerx.in/{result.shortAlias}</span>
          </a>
        )}
        {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}

        <p className="mt-8 text-[11px] font-semibold tracking-[0.2em] text-muted">
          BUILT ON CASSANDRA · CLICKHOUSE · REDIS · ZOOKEEPER
        </p>
      </section>

      <section className="bg-soft px-16 py-24">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-xl border border-border bg-white p-6">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-soft text-base font-bold text-accent">
                {f.glyph}
              </div>
              <h3 className="mt-3 text-base font-semibold text-ink">{f.title}</h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-sub">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="flex items-center justify-between bg-ink px-16 py-8">
        <Logo light />
        <p className="text-[13px] text-neutral-400">
          Self-hosted on your own infrastructure. © 2026 routerx.
        </p>
      </footer>
    </div>
  );
}

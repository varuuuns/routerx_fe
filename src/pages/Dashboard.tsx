import { useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Logo } from "../components/Logo";
import { Button } from "../components/Button";
import { useAuth } from "../lib/auth";
import { api, ApiError, type ShortenResponse } from "../lib/api";

const NAV_ITEMS = [
  { label: "Overview", glyph: "▦", active: true },
  { label: "Links", glyph: "⛓", active: false },
  { label: "Analytics", glyph: "◔", active: false },
  { label: "API keys", glyph: "▹", active: false },
  { label: "Settings", glyph: "⚙", active: false },
];

function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function Dashboard() {
  const { username, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const justCreated = (location.state as { justCreated?: ShortenResponse } | null)?.justCreated;

  const [links, setLinks] = useState<ShortenResponse[]>(justCreated ? [justCreated] : []);
  const [longLink, setLongLink] = useState("");
  const [shortAlias, setShortAlias] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.shorten({
        longLink,
        shortAlias: shortAlias.trim() || undefined,
      });
      setLinks((prev) => [res, ...prev]);
      setLongLink("");
      setShortAlias("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <div className="flex min-h-screen bg-white">
      <aside className="flex w-60 flex-col gap-1 bg-ink px-5 py-7">
        <div className="mb-7">
          <Logo light />
        </div>
        {NAV_ITEMS.map((item) => (
          <div
            key={item.label}
            className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm ${
              item.active ? "bg-accent font-semibold text-white" : "text-neutral-400"
            }`}
            title={item.active ? undefined : "Not built yet"}
          >
            <span>{item.glyph}</span>
            {item.label}
          </div>
        ))}
        <div className="mt-auto">
          <button
            onClick={handleLogout}
            className="w-full rounded-lg px-3 py-2.5 text-left text-sm text-neutral-400 hover:bg-white/5 hover:text-white"
          >
            Log out
          </button>
        </div>
      </aside>

      <main className="flex-1 px-10 py-9">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[26px] font-extrabold tracking-tight text-ink">Overview</h1>
            <p className="mt-1 text-sm text-sub">Your links at a glance</p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-border py-1.5 pr-3.5 pl-1.5">
            <div className="flex h-6.5 w-6.5 items-center justify-center rounded-full bg-accent-soft text-[11px] font-semibold text-accent">
              {username?.slice(0, 2).toUpperCase()}
            </div>
            <span className="text-[13px] font-semibold text-ink">{username}</span>
          </div>
        </div>

        <p className="mt-6 rounded-lg border border-border bg-soft px-4 py-3 text-[13px] text-sub">
          routerx doesn't have a "list my links" API yet, so this table only shows links you create
          in this browser session — nothing is fetched from stored history. Refreshing clears it.
        </p>

        <form
          onSubmit={handleCreate}
          className="mt-6 flex flex-col gap-3 rounded-xl border border-border bg-white p-5 sm:flex-row sm:items-end"
        >
          <label className="flex flex-1 flex-col gap-1.5 text-sm font-medium text-ink">
            Destination URL
            <input
              required
              type="url"
              value={longLink}
              onChange={(e) => setLongLink(e.target.value)}
              placeholder="https://example.com/some/long/path"
              className="rounded-lg border border-border px-3.5 py-2.5 text-sm focus:border-accent focus:outline-none"
            />
          </label>
          <label className="flex w-full flex-col gap-1.5 text-sm font-medium text-ink sm:w-48">
            Custom alias (optional)
            <input
              value={shortAlias}
              onChange={(e) => setShortAlias(e.target.value)}
              placeholder="7 characters"
              maxLength={7}
              className="rounded-lg border border-border px-3.5 py-2.5 font-mono text-sm focus:border-accent focus:outline-none"
            />
          </label>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? "Creating…" : "+ New link"}
          </Button>
        </form>
        {error && <p className="mt-2 text-sm font-medium text-red-600">{error}</p>}

        <div className="mt-8 overflow-hidden rounded-xl border border-border">
          <div className="flex bg-soft px-6 py-3 text-[11px] font-semibold tracking-[0.2em] text-muted">
            <span className="w-64">SHORT LINK</span>
            <span className="flex-1">DESTINATION</span>
            <span className="w-28">CREATED</span>
          </div>
          {links.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-sub">
              No links yet this session — create one above.
            </div>
          ) : (
            links.map((link) => (
              <div
                key={link.shortAlias + link.createdAt}
                className="flex items-center border-t border-border px-6 py-4 text-[13.5px]"
              >
                <a
                  href={`https://routerx.in/${link.shortAlias}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-64 font-mono text-accent"
                >
                  routerx.in/{link.shortAlias}
                </a>
                <span className="flex-1 truncate pr-4 text-ink">{link.longLink}</span>
                <span className="w-28 text-sub">{timeAgo(link.createdAt)}</span>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

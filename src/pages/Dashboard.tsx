import { useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  SquaresFour,
  LinkSimple,
  ChartPieSlice,
  Key,
  Gear,
} from "@phosphor-icons/react";
import { Logo } from "../components/Logo";
import { Button } from "../components/Button";
import { useAuth } from "../lib/auth";
import { api, ApiError, type ShortenResponse } from "../lib/api";

const NAV_ITEMS = [
  { label: "Overview", icon: SquaresFour, active: true },
  { label: "Links", icon: LinkSimple, active: false },
  { label: "Analytics", icon: ChartPieSlice, active: false },
  { label: "API keys", icon: Key, active: false },
  { label: "Settings", icon: Gear, active: false },
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
    <div className="flex min-h-screen bg-canvas">
      <aside className="flex w-60 flex-col gap-1 bg-[#161615] px-5 py-7">
        <div className="mb-7">
          <Logo light />
        </div>
        {NAV_ITEMS.map((item) => (
          <div
            key={item.label}
            className={`flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm ${
              item.active ? "bg-white/[0.06] font-medium text-white" : "text-neutral-400"
            }`}
            title={item.active ? undefined : "Not built yet"}
          >
            <item.icon size={16} weight="bold" aria-hidden="true" />
            {item.label}
          </div>
        ))}
        <div className="mt-auto">
          <button
            onClick={handleLogout}
            className="w-full rounded-md px-3 py-2.5 text-left text-sm text-neutral-400 hover:bg-white/5 hover:text-white"
          >
            Log out
          </button>
        </div>
      </aside>

      <main className="flex-1 px-10 py-9">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl text-ink italic">Overview</h1>
            <p className="mt-1 text-sm text-sub">Your links at a glance</p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-border py-1.5 pr-3.5 pl-1.5">
            <div className="flex h-6.5 w-6.5 items-center justify-center rounded-full bg-pale-blue text-[11px] font-semibold text-pale-blue-text">
              {username?.slice(0, 2).toUpperCase()}
            </div>
            <span className="text-[13px] font-medium text-ink">{username}</span>
          </div>
        </div>

        <p className="mt-6 rounded-md border border-border bg-surface px-4 py-3 text-[13px] text-sub">
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
              name="longLink"
              autoComplete="url"
              value={longLink}
              onChange={(e) => setLongLink(e.target.value)}
              placeholder="https://example.com/some/long/path"
              className="rounded-md border border-border px-3.5 py-2.5 text-sm focus:border-ink focus:outline-none"
            />
          </label>
          <label className="flex w-full flex-col gap-1.5 text-sm font-medium text-ink sm:w-48">
            Custom alias (optional)
            <input
              name="shortAlias"
              autoComplete="off"
              spellCheck={false}
              value={shortAlias}
              onChange={(e) => setShortAlias(e.target.value)}
              placeholder="7 characters"
              maxLength={7}
              className="rounded-md border border-border px-3.5 py-2.5 font-mono text-sm focus:border-ink focus:outline-none"
            />
          </label>
          <Button type="submit" disabled={loading}>
            {loading ? "Creating…" : "+ New link"}
          </Button>
        </form>
        {error && <p className="mt-2 text-sm font-medium text-[#9F2F2D]">{error}</p>}

        <div className="mt-8 overflow-hidden rounded-xl border border-border">
          <div className="flex bg-surface px-6 py-3 text-[11px] font-medium tracking-[0.15em] text-sub uppercase">
            <span className="w-64">Short link</span>
            <span className="flex-1">Destination</span>
            <span className="w-28">Created</span>
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
                  className="w-64 font-mono text-pale-blue-text"
                >
                  routerx.in/{link.shortAlias}
                </a>
                <span className="min-w-0 flex-1 truncate pr-4 text-ink">{link.longLink}</span>
                <span className="w-28 text-sub">{timeAgo(link.createdAt)}</span>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

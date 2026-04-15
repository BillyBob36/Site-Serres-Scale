"use client";

import { useState, FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Sparkles, Loader2 } from "lucide-react";
import { useTranslation } from "../../lib/i18n/i18nContext";

export default function LoginForm() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : t("login_error_generic"));
        return;
      }
      const from = searchParams.get("from");
      let safe = "/app-admin";
      if (
        from &&
        from.startsWith("/app-admin") &&
        !from.startsWith("/app-admin/login") &&
        !from.includes("..") &&
        !from.includes("//")
      ) {
        safe = from;
      }
      window.location.href = safe;
    } catch {
      setError(t("login_error_network"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-zinc-100 p-6">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900/80 p-8 shadow-2xl">
        <div className="flex items-center gap-2 mb-6 justify-center">
          <Sparkles className="text-green-400" size={24} />
          <h1 className="text-lg font-semibold tracking-tight">{t("login_title")}</h1>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="admin-user" className="block text-xs text-zinc-500 mb-1">
              {t("login_username")}
            </label>
            <input
              id="admin-user"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500/50"
              required
            />
          </div>
          <div>
            <label htmlFor="admin-pass" className="block text-xs text-zinc-500 mb-1">
              {t("login_password")}
            </label>
            <input
              id="admin-pass"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500/50"
              required
            />
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg text-sm transition"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : null}
            {t("login_submit")}
          </button>
        </form>
        <p className="mt-6 text-center text-xs text-zinc-600">
          <Link href="/" className="text-zinc-500 hover:text-zinc-400">
            {t("login_back")}
          </Link>
        </p>
      </div>
    </div>
  );
}

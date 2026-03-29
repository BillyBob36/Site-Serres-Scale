import Link from "next/link";

/** Racine : pas l’outil. Landings sur /{slug}, administration sur /app-admin */
export default function RootPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 bg-zinc-950 text-zinc-300 p-8">
      <p className="text-sm text-zinc-500">eco-environnement.com</p>
      <Link
        href="/app-admin"
        className="text-sm font-medium text-green-400 hover:text-green-300 underline underline-offset-4"
      >
        Outil de génération de landings
      </Link>
    </main>
  );
}

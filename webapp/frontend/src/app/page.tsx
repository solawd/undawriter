import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-white">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm flex flex-col gap-8">
        <h1 className="text-5xl font-bold text-primary">UndaWriter Insure</h1>
        <p className="text-xl text-secondary">
          Welcome to the UndaWriter Insurance Self-Service Ecosystem
        </p>
        <div className="flex gap-4 mt-8">
          <Link
            href="/customer"
            className="rounded-full bg-primary text-white px-8 py-3 hover:bg-opacity-90 transition-all font-semibold shadow-lg"
          >
            Customer Portal
          </Link>
          <Link
            href="/staff"
            className="rounded-full border-2 border-primary text-primary px-8 py-3 hover:bg-primary hover:text-white transition-all font-semibold"
          >
            Staff Portal
          </Link>
        </div>
      </div>
    </main>
  );
}

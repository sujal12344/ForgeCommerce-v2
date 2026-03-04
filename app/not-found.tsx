import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-background px-6 text-center">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-xl">F</span>
        </div>
        <span className="text-xl font-bold tracking-tight">ForgeCommerce</span>
      </div>

      <div>
        <p className="text-8xl font-black bg-linear-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent leading-none mb-4">
          404
        </p>
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Page not found
        </h2>
        <p className="text-muted-foreground text-sm max-w-xs mx-auto leading-relaxed">
          The page you{"'"}re looking for doesn{"'"}t exist or has been moved.
        </p>
      </div>

      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-lg bg-linear-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:scale-105 shadow-sm"
      >
        Go back home
      </Link>
    </div>
  );
}

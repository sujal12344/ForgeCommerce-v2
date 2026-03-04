export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Left branding panel — hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-slate-900 via-blue-950 to-indigo-900 flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-blue-600/10 to-indigo-600/5" />
        <div className="absolute top-24 left-16 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-24 right-16 w-56 h-56 bg-indigo-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-sm text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-11 w-11 rounded-xl bg-linear-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">F</span>
            </div>
            <span className="text-white text-2xl font-bold tracking-tight">ForgeCommerce</span>
          </div>

          <p className="text-blue-200/80 text-base leading-relaxed mb-10">
            Your all-in-one commerce backend. Manage stores, products, and orders with a powerful dashboard.
          </p>

          <div className="space-y-3 text-left">
            {["Multi-store management", "Real-time analytics", "Stripe-powered checkout", "Production-ready API"].map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <div className="h-5 w-5 rounded-full bg-blue-500/20 border border-blue-400/30 flex items-center justify-center shrink-0">
                  <svg className="h-3 w-3 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-blue-100/80 text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right content panel */}
      <div className="flex flex-1 items-center justify-center p-6 bg-background">
        {children}
      </div>
    </div>
  );
}

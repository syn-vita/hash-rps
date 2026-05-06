import { ConnectButton } from "@rainbow-me/rainbowkit";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";

export default function Layout({ children }) {
  const { pathname } = useLocation();

  return (
    <div className="relative min-h-dvh overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.28),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(244,63,94,0.16),transparent_28%)]" />
      <div className="pointer-events-none absolute inset-0 bg-grid bg-[size:44px_44px] opacity-15" />
      <div className="pointer-events-none absolute inset-0 scanlines opacity-15" />

      <header className="relative z-10 border-b border-primary/20 bg-background/70 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-5">
            <Link
              to="/home"
              className="text-sm uppercase tracking-[0.35em] text-secondary hover:text-foreground focus-visible:rounded-sm"
            >
              RPS Chain
            </Link>
            <nav className="flex items-center gap-2 rounded-full border border-primary/20 bg-surface/60 p-1">
              <Link
                to="/home"
                className={`rounded-full px-4 py-2 text-sm uppercase tracking-[0.22em] transition-colors ${
                  pathname === "/home" || pathname === "/game"
                    ? "bg-primary text-white shadow-neon"
                    : "text-foreground/70 hover:text-foreground"
                }`}
              >
                Play
              </Link>
              <Link
                to="/history"
                className={`rounded-full px-4 py-2 text-sm uppercase tracking-[0.22em] transition-colors ${
                  pathname === "/history"
                    ? "bg-primary text-white shadow-neon"
                    : "text-foreground/70 hover:text-foreground"
                }`}
              >
                History
              </Link>
            </nav>
          </div>
          <ConnectButton accountStatus="address" chainStatus="icon" showBalance={false} />
        </div>
      </header>

      <motion.main
        className="relative z-10 mx-auto flex min-h-[calc(100dvh-81px)] w-full max-w-6xl flex-col items-center justify-center px-4 py-8 sm:px-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        {children}
      </motion.main>
    </div>
  );
}

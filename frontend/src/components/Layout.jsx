import { ConnectButton } from "@rainbow-me/rainbowkit";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";

export default function Layout({ children }) {
  const { pathname } = useLocation();

  return (
    <div className="relative min-h-dvh bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-4">
            <Link
              to="/home"
              className="flex items-center gap-2 focus-visible:rounded-sm"
            >
              <span className="h-[7px] w-[7px] rounded-full bg-primary shadow-live-dot" />
              <span className="text-[13px] font-bold uppercase tracking-[0.06em] text-foreground">
                Hash RPS
              </span>
            </Link>
            <nav className="flex items-center gap-[3px] rounded-pill border border-border bg-surface p-[3px]">
              <Link
                to="/home"
                className={`rounded-[5px] px-4 py-[6px] text-[11px] font-medium tracking-[0.04em] transition-colors ${
                  pathname === "/home" || pathname === "/game"
                    ? "bg-surface-raised text-foreground"
                    : "text-foreground-muted hover:text-foreground"
                }`}
              >
                Play
              </Link>
              <Link
                to="/history"
                className={`rounded-[5px] px-4 py-[6px] text-[11px] font-medium tracking-[0.04em] transition-colors ${
                  pathname === "/history"
                    ? "bg-surface-raised text-foreground"
                    : "text-foreground-muted hover:text-foreground"
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
        className="mx-auto flex min-h-[calc(100dvh-57px)] w-full max-w-6xl flex-col items-center justify-center px-4 py-8 sm:px-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        {children}
      </motion.main>
    </div>
  );
}

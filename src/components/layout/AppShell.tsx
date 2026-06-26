import { type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Upload } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { isMockMode } from "@/lib/supabase";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#0C0F0D" }}>
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar — minimal, just the demo badge and upload CTA */}
        <header
          className="h-14 flex items-center justify-between px-6 shrink-0"
          style={{
            borderBottom: "1px solid rgba(194,255,69,0.06)",
            background: "rgba(12,15,13,0.9)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div className="flex items-center gap-3">
            {isMockMode && (
              <span
                className="rounded-full px-2.5 py-1 text-[11px] font-bold font-mono uppercase tracking-wider"
                style={{
                  background: "rgba(194,255,69,0.08)",
                  color: "#C2FF45",
                  border: "1px solid rgba(194,255,69,0.20)",
                }}
              >
                demo • sem supabase
              </span>
            )}
          </div>

          <Link
            to="/upload"
            id="btn-upload-topbar"
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-transform hover:scale-[1.03]"
            style={{
              background: "#C2FF45",
              color: "#0C0F0D",
            }}
          >
            <Upload className="h-3.5 w-3.5" />
            Novo upload
          </Link>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

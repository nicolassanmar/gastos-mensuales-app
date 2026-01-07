"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Home } from "lucide-react";

export const Navbar = () => {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="mb-8 rounded-lg bg-white/10 backdrop-blur-sm">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-8">
          <Link
            href="/"
            className={`flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              isActive("/")
                ? "bg-white text-slate-900"
                : "text-white hover:bg-white/20"
            }`}
          >
            <Home className="h-5 w-5" />
            <span>Inicio</span>
          </Link>
          <Link
            href="/statistics"
            className={`flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              isActive("/statistics")
                ? "bg-white text-slate-900"
                : "text-white hover:bg-white/20"
            }`}
          >
            <BarChart3 className="h-5 w-5" />
            <span>Estadísticas</span>
          </Link>
        </div>
        <div className="text-xl font-bold text-white">Monitor de Gastos</div>
      </div>
    </nav>
  );
};

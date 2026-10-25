"use client";

import Link from "next/link";
import { Pill, ShieldCheck, ArrowRight, Menu, X } from "lucide-react";
import { useState } from "react";
import { APP_CONFIG } from "@/lib/constants";

export function LandingNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#F2F5F3]/90 backdrop-blur-md border-b border-emerald-950/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-800 to-brand-900 flex items-center justify-center text-white shadow-neu-sm transition-transform group-hover:scale-105">
            <Pill className="w-6 h-6 text-brand-300 -rotate-45" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-brand-900 flex items-center gap-1.5">
              {APP_CONFIG.name}
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
            </span>
            <span className="text-[11px] font-medium text-emerald-700/80 tracking-wide uppercase">
              Pharmacy Operating System
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-emerald-900/80">
          <a href="#features" className="hover:text-brand-600 transition-colors">Features</a>
          <a href="#preview" className="hover:text-brand-600 transition-colors">Preview</a>
          <a href="#workflow" className="hover:text-brand-600 transition-colors">Workflow</a>
          <a href="#benefits" className="hover:text-brand-600 transition-colors">Benefits</a>
        </nav>

        {/* CTA Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="px-5 py-2.5 text-sm font-semibold text-brand-900 hover:text-brand-700 bg-white/70 hover:bg-white rounded-xl shadow-neu-sm transition-all"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="px-5 py-2.5 text-sm font-semibold text-white bg-brand-800 hover:bg-brand-900 rounded-xl shadow-neu-button flex items-center gap-2 liquid-btn transition-all active:scale-95"
          >
            Get Started
            <ArrowRight className="w-4 h-4 text-brand-300" />
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-xl bg-white shadow-neu-sm text-brand-900"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#F2F5F3] border-b border-emerald-950/10 px-4 pt-3 pb-6 space-y-3 animate-fade-in shadow-neu-elevated">
          <div className="flex flex-col gap-3 text-sm font-medium text-emerald-950 px-2 py-2">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 hover:text-brand-600"
            >
              Features
            </a>
            <a
              href="#preview"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 hover:text-brand-600"
            >
              Preview
            </a>
            <a
              href="#workflow"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 hover:text-brand-600"
            >
              Workflow
            </a>
            <a
              href="#benefits"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 hover:text-brand-600"
            >
              Benefits
            </a>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-emerald-950/5">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 text-sm font-semibold text-brand-900 bg-white rounded-xl shadow-neu-sm"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 text-sm font-semibold text-white bg-brand-800 rounded-xl shadow-neu-button"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

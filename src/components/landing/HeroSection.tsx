"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, Shield, Clock, Zap } from "lucide-react";
import { APP_CONFIG } from "@/lib/constants";

export function HeroSection() {
  return (
    <section className="relative pt-12 pb-24 overflow-hidden perspective-1000">
      {/* Decorative ambient glowing background orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-r from-brand-400/20 via-brand-500/15 to-emerald-700/20 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="absolute top-1/3 left-10 w-72 h-72 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none animate-float-3d" />
      <div className="absolute top-1/2 right-10 w-80 h-80 bg-brand-300/15 rounded-full blur-3xl pointer-events-none animate-float-reverse-3d" />

      {/* Floating 3D Aspect Badges (Visible on medium/large screens) */}
      <div className="hidden lg:block absolute left-8 xl:left-16 top-32 z-20 animate-float-3d">
        <div className="bg-white/85 backdrop-blur-md p-4 rounded-2xl shadow-glow-emerald border border-emerald-100/80 flex items-center gap-3.5 hover:scale-105 transition-transform duration-300">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-700 to-brand-900 text-brand-300 flex items-center justify-center shadow-md">
            <span className="text-xl">💊</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
              <span>৳ 48,250 Daily Net</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-extrabold">+14.2%</span>
            </div>
            <p className="text-[11px] text-gray-500">True COGS Weighted Profit</p>
          </div>
        </div>
      </div>

      <div className="hidden lg:block absolute right-8 xl:right-16 top-40 z-20 animate-float-reverse-3d">
        <div className="bg-white/85 backdrop-blur-md p-4 rounded-2xl shadow-glow-mint border border-emerald-100/80 flex items-center gap-3.5 hover:scale-105 transition-transform duration-300">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-white flex items-center justify-center shadow-md">
            <span className="text-xl">⚡</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
              <span>99.4% Stock Accuracy</span>
            </div>
            <p className="text-[11px] text-gray-500">Multi-Unit POS Auto-Sync</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 relative z-10">
        {/* Top Pills / Badges with 3D depth */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 backdrop-blur-md shadow-glow-mint border border-emerald-200/60 text-xs font-semibold text-emerald-950 transition-transform hover:scale-105 duration-300">
          <span className="flex h-2.5 w-2.5 rounded-full bg-brand-500 animate-pulse" />
          <span>Tailored for Bangladesh Pharmacies</span>
          <span className="text-gray-300">•</span>
          <span className="text-brand-800 font-bold">BDT (৳) & Asia/Dhaka Accounting</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-brand-950 max-w-4xl mx-auto leading-[1.12]">
          Intelligent Operations for Modern Pharmacies:{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-brand-700 to-emerald-950 drop-shadow-sm">
            Precision Stock & Fast Mini POS
          </span>
        </h1>

        {/* Short Subheadline */}
        <p className="text-base sm:text-xl text-emerald-900/80 max-w-2xl mx-auto leading-relaxed font-normal">
          Eliminate inventory discrepancies, calculate true profit using automated weighted-average costs, and speed through point-of-sale counter queues in seconds.
        </p>

        {/* Call to Actions with colorful glowing hover shadows */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-3">
          <Link
            href="/register"
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-brand-800 to-brand-900 hover:from-brand-700 hover:to-brand-800 text-white font-bold rounded-2xl shadow-glow-dark hover:shadow-glow-emerald flex items-center justify-center gap-2.5 liquid-btn transition-all duration-300 hover:-translate-y-1 active:scale-95 group text-sm sm:text-base border border-emerald-600/30"
          >
            <span>Get Started with {APP_CONFIG.name}</span>
            <ArrowRight className="w-4 h-4 text-brand-300 group-hover:translate-x-1.5 transition-transform" />
          </Link>

          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-emerald-50/80 text-brand-950 font-bold rounded-2xl shadow-neu-button hover:shadow-glow-mint border border-emerald-900/10 flex items-center justify-center gap-2 text-sm sm:text-base transition-all duration-300 hover:-translate-y-1"
          >
            <span>Staff Sign In</span>
          </Link>
        </div>

        {/* Trust Badges with 3D hover lift */}
        <div className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold text-emerald-950 max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-2.5 p-3 rounded-2xl bg-white/80 backdrop-blur-sm shadow-neu-sm hover:shadow-glow-mint transition-all duration-300 hover:-translate-y-1 border border-emerald-100/60">
            <Zap className="w-4 h-4 text-brand-600" />
            <span>Instant Strip/Box POS</span>
          </div>
          <div className="flex items-center justify-center gap-2.5 p-3 rounded-2xl bg-white/80 backdrop-blur-sm shadow-neu-sm hover:shadow-glow-emerald transition-all duration-300 hover:-translate-y-1 border border-emerald-100/60">
            <Shield className="w-4 h-4 text-brand-600" />
            <span>Server-Verified Audit</span>
          </div>
          <div className="flex items-center justify-center gap-2.5 p-3 rounded-2xl bg-white/80 backdrop-blur-sm shadow-neu-sm hover:shadow-glow-mint transition-all duration-300 hover:-translate-y-1 border border-emerald-100/60">
            <Clock className="w-4 h-4 text-brand-600" />
            <span>Dhaka Day Boundaries</span>
          </div>
          <div className="flex items-center justify-center gap-2.5 p-3 rounded-2xl bg-white/80 backdrop-blur-sm shadow-neu-sm hover:shadow-glow-emerald transition-all duration-300 hover:-translate-y-1 border border-emerald-100/60">
            <Sparkles className="w-4 h-4 text-brand-600" />
            <span>ImageKit & Sharp CDN</span>
          </div>
        </div>
      </div>
    </section>
  );
}

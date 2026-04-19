"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { BadgeSVG } from "@/components/badges/BadgeSVG";
import {
  Shield,
  Ticket,
  QrCode,
  ArrowRight,
  Sparkles,
  Users,
  Layers,
  Zap,
} from "lucide-react";
import { formatNumber } from "@/lib/utils";

const FEATURES = [
  {
    icon: Shield,
    title: "Soulbound Identity",
    description: "Non-transferable SBTs as tamper-proof community passports. One identity per member, verified on-chain.",
    accent: "from-emerald-500 to-teal-500",
  },
  {
    icon: Ticket,
    title: "Event Badges",
    description: "ERC-1155 badges for events with cryptographic claim flows. Attendees prove participation forever.",
    accent: "from-blue-500 to-indigo-500",
  },
  {
    icon: QrCode,
    title: "QR Gate Verification",
    description: "Zero-gas O2O verification. Scan QR at the door, verify badge ownership instantly on-chain.",
    accent: "from-purple-500 to-pink-500",
  },
];

const STATS = [
  { label: "Communities", value: 24, icon: Users },
  { label: "Badges Minted", value: 3847, icon: Layers },
  { label: "Events Created", value: 156, icon: Sparkles },
  { label: "Verifications", value: 12430, icon: Zap },
];

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.12 } },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Hero Section ──────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Background effects (removed colorful blurred circles for pure noir) */}
        <div className="absolute inset-0 bg-background" />

        {/* Floating badges */}
        <div className="absolute top-20 right-10 lg:right-32 opacity-30 animate-float hidden lg:block">
          <BadgeSVG eventName="Hackathon" communityName="TechClub" eventId={1} size={120} />
        </div>
        <div className="absolute bottom-32 left-10 lg:left-24 opacity-20 animate-float hidden lg:block" style={{ animationDelay: "2s" }}>
          <BadgeSVG eventName="Marathon" communityName="SportsFed" eventId={3} size={100} />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial="initial"
            animate="animate"
            variants={stagger}
          >
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs text-white font-medium mb-8"
            >
              <Sparkles className="w-3.5 h-3.5" strokeWidth={1.25} />
              Powered by Ethereum · Sepolia Testnet
            </motion.div>

            <motion.h1
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tighter text-white leading-[1.1] text-heading"
            >
              Your Community,
              <br />
              On-Chain.
            </motion.h1>

            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="max-w-2xl mx-auto mt-6 text-lg sm:text-xl text-muted-foreground leading-relaxed"
            >
              Issue tamper-proof Soulbound Tokens as community passports and
              ERC-1155 badges for events. Verify attendance with a single QR scan.
              No backend. No database. Pure Web3.
            </motion.p>

            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10"
            >
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-10 py-3 rounded-full bg-white text-black font-semibold text-sm transition-transform duration-300 hover:scale-105"
              >
                Launch App
                <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
              </Link>
              <a
                href="https://github.com/communigate"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-10 py-3 rounded-full border border-white/10 bg-black/40 text-white font-medium text-sm transition-all duration-300 hover:border-white/40"
              >
                View on GitHub
              </a>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-2">
            <motion.div
              className="w-1 h-2 rounded-full bg-[#00d4aa]"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
        </div>
      </section>

      {/* ── Stats Bar ─────────────────────────────────────────── */}
      <section className="relative z-10 -mt-12 max-w-5xl mx-auto px-4 sm:px-6 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass rounded-2xl p-6 grid grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <stat.icon className="w-5 h-5 text-[#00d4aa] mx-auto mb-2" />
              <p className="text-2xl sm:text-3xl font-bold text-slate-100">
                {formatNumber(stat.value)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── Features Bento Grid ───────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-24">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter text-white">
            Built for Real Communities
          </h2>
          <div className="mx-auto mt-6 w-16 h-[1px] rainbow-gradient" />
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything your organization needs to go on-chain — from identity to event verification.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="md:col-span-12 lg:col-span-6 bg-card border border-white/5 rounded-2xl p-8 hover:border-white/20 transition-all duration-500 overflow-hidden relative group"
          >
            <div className="absolute inset-x-0 bottom-0 h-1 rainbow-gradient opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-12 h-12 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center mb-5">
              <Shield className="w-6 h-6 text-white" strokeWidth={1.25} />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">
              Soulbound Identity
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Non-transferable SBTs as tamper-proof community passports. One identity per member, verified on-chain.
            </p>
          </motion.div>

          {FEATURES.slice(1).map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (i + 1) * 0.15, duration: 0.5 }}
              className="md:col-span-6 lg:col-span-3 bg-card border border-white/5 rounded-2xl p-8 hover:border-white/20 transition-all duration-500 overflow-hidden relative group"
            >
              <div className="absolute inset-x-0 bottom-0 h-1 rainbow-gradient opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-12 h-12 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center mb-5">
                <feature.icon className="w-6 h-6 text-white" strokeWidth={1.25} />
              </div>
              <h3 className="text-lg font-bold text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA Section ───────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-card border border-white/5 rounded-[2rem] p-12 sm:p-16 text-center relative overflow-hidden"
        >
          <div className="absolute -top-12 -right-12 w-96 h-96 bg-white/5 blur-3xl rounded-full" />

          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tighter">
              Ready to deploy your community?
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
              Deploy your own SBT contracts and start issuing identity passports in minutes.
              No backend required.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-10 py-4 rounded-full bg-white text-black font-semibold transition-transform duration-300 hover:scale-105"
            >
              Get Started
              <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#00d4aa] to-[#0984e3] flex items-center justify-center">
              <span className="text-white font-bold text-[10px]">CG</span>
            </div>
            <span className="text-sm text-slate-500">CommuniGate © 2026</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <a href="#" className="hover:text-slate-300 transition-colors">Docs</a>
            <a href="#" className="hover:text-slate-300 transition-colors">GitHub</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Sepolia</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

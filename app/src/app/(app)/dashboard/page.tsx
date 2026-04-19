"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/shared/GlassCard";
import { MOCK_COMMUNITIES } from "@/lib/mock/communities";
import { MOCK_EVENTS } from "@/lib/mock/events";
import { formatNumber, formatAddress } from "@/lib/utils";
import {
  Users,
  Calendar,
  Layers,
  Plus,
  ArrowUpRight,
  Shield,
  Copy,
  Ticket,
  QrCode,
} from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
};

export default function DashboardPage() {
  const totalMembers = MOCK_COMMUNITIES.reduce((sum, c) => sum + c.memberCount, 0);
  const totalEvents = MOCK_COMMUNITIES.reduce((sum, c) => sum + c.eventCount, 0);
  const totalBadges = MOCK_COMMUNITIES.reduce((sum, c) => sum + c.totalBadgesMinted, 0);

  return (
    <motion.div initial="initial" animate="animate" variants={stagger}>
      {/* Page Header */}
      <motion.div variants={fadeUp} transition={{ duration: 0.4 }} className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-100">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your communities, events, and badges
        </p>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        variants={fadeUp}
        transition={{ duration: 0.4 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        {[
          { label: "Communities", value: MOCK_COMMUNITIES.length, icon: Shield, color: "text-teal-400" },
          { label: "Total Members", value: totalMembers, icon: Users, color: "text-blue-400" },
          { label: "Events Created", value: totalEvents, icon: Calendar, color: "text-purple-400" },
          { label: "Badges Minted", value: totalBadges, icon: Layers, color: "text-amber-400" },
        ].map((stat) => (
          <GlassCard key={stat.label} className="p-4">
            <div className="flex items-center justify-between">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold text-slate-100 mt-2">
              {formatNumber(stat.value)}
            </p>
          </GlassCard>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        variants={fadeUp}
        transition={{ duration: 0.4 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
      >
        {[
          { label: "Deploy Community", icon: Plus, href: "#", color: "from-[#00d4aa] to-[#00b894]" },
          { label: "Claim Badge", icon: Ticket, href: "/claim", color: "from-blue-500 to-indigo-500" },
          { label: "Scan QR", icon: QrCode, href: "/scanner", color: "from-purple-500 to-pink-500" },
        ].map((action) => (
          <Link key={action.label} href={action.href}>
            <GlassCard hoverable className="p-4 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shrink-0`}>
                <action.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-200">{action.label}</p>
                <p className="text-xs text-muted-foreground">Quick action</p>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-500 ml-auto" />
            </GlassCard>
          </Link>
        ))}
      </motion.div>

      {/* Communities Grid */}
      <motion.div variants={fadeUp} transition={{ duration: 0.4 }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-200">Your Communities</h2>
          <button className="flex items-center gap-1.5 text-xs text-[#00d4aa] hover:text-[#00b894] transition-colors font-medium">
            <Plus className="w-3.5 h-3.5" />
            Deploy New
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {MOCK_COMMUNITIES.map((community, i) => {
            const events = MOCK_EVENTS[community.badgeProxy] || [];
            const activeEvents = events.filter((e) => e.status === 1).length;

            return (
              <motion.div
                key={community.sbtProxy}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
              >
                <Link href={`/community/${i}`}>
                  <GlassCard hoverable className="p-6 h-full">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00d4aa]/20 to-[#0984e3]/20 border border-white/10 flex items-center justify-center">
                        <span className="text-lg font-bold text-gradient">
                          {community.symbol.slice(0, 2)}
                        </span>
                      </div>
                      {activeEvents > 0 && (
                        <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2 py-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          {activeEvents} active
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <h3 className="text-base font-semibold text-slate-200 mb-1">
                      {community.name}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-4">
                      {community.description}
                    </p>

                    {/* Contract addresses */}
                    <div className="space-y-1.5 mb-4">
                      <div className="flex items-center gap-2 text-[10px]">
                        <span className="text-slate-500 w-8">SBT</span>
                        <span className="font-mono text-slate-400">
                          {formatAddress(community.sbtProxy, 6)}
                        </span>
                        <Copy className="w-3 h-3 text-slate-600 cursor-pointer hover:text-slate-400" />
                      </div>
                      <div className="flex items-center gap-2 text-[10px]">
                        <span className="text-slate-500 w-8">Badge</span>
                        <span className="font-mono text-slate-400">
                          {formatAddress(community.badgeProxy, 6)}
                        </span>
                        <Copy className="w-3 h-3 text-slate-600 cursor-pointer hover:text-slate-400" />
                      </div>
                    </div>

                    {/* Stats row */}
                    <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Users className="w-3.5 h-3.5" />
                        {community.memberCount}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Calendar className="w-3.5 h-3.5" />
                        {community.eventCount}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Layers className="w-3.5 h-3.5" />
                        {community.totalBadgesMinted}
                      </div>
                    </div>
                  </GlassCard>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}

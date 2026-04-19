"use client";

import React, { use } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/shared/GlassCard";
import { EventStatusBadge } from "@/components/events/EventStatusBadge";
import { MOCK_COMMUNITIES } from "@/lib/mock/communities";
import { MOCK_EVENTS } from "@/lib/mock/events";
import { MOCK_MEMBERS } from "@/lib/mock/communities";
import { formatAddress, formatNumber } from "@/lib/utils";
import {
  Users,
  Calendar,
  Layers,
  Settings,
  ArrowLeft,
  Copy,
  Shield,
  User,
  Plus,
  ExternalLink,
} from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export default function CommunityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const communityIndex = parseInt(id);
  const community = MOCK_COMMUNITIES[communityIndex];

  if (!community) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-slate-400">Community not found</p>
      </div>
    );
  }

  const events = MOCK_EVENTS[community.badgeProxy] || [];
  const members = MOCK_MEMBERS[community.sbtProxy] || [];

  const ROLE_CONFIG: Record<string, { color: string; icon: React.ReactNode }> = {
    admin: { color: "text-amber-400", icon: <Shield className="w-3 h-3" /> },
    affair: { color: "text-blue-400", icon: <Users className="w-3 h-3" /> },
    member: { color: "text-emerald-400", icon: <User className="w-3 h-3" /> },
  };

  return (
    <motion.div initial="initial" animate="animate" variants={{ animate: { transition: { staggerChildren: 0.08 } } }}>
      {/* Back + Header */}
      <motion.div variants={fadeUp} transition={{ duration: 0.4 }}>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-slate-300 transition-colors mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Dashboard
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#00d4aa]/20 to-[#0984e3]/20 border border-white/10 flex items-center justify-center">
              <span className="text-xl font-bold text-gradient">
                {community.symbol.slice(0, 2)}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-100">{community.name}</h1>
              <p className="text-xs text-muted-foreground mt-0.5">{community.description}</p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-full glass glass-hover text-sm text-slate-300">
            <Settings className="w-4 h-4" />
            Settings
          </button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={fadeUp} transition={{ duration: 0.4 }} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Members", value: community.memberCount, icon: Users, color: "text-blue-400" },
          { label: "Events", value: community.eventCount, icon: Calendar, color: "text-purple-400" },
          { label: "Badges Minted", value: community.totalBadgesMinted, icon: Layers, color: "text-amber-400" },
          { label: "SBT Contract", value: formatAddress(community.sbtProxy, 6), icon: Shield, color: "text-teal-400", isMono: true },
        ].map((stat) => (
          <GlassCard key={stat.label} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
              <span className="text-[10px] text-muted-foreground">{stat.label}</span>
            </div>
            <p className={`text-xl font-bold text-slate-100 ${"isMono" in stat && stat.isMono ? "font-mono text-sm" : ""}`}>
              {typeof stat.value === "number" ? formatNumber(stat.value) : stat.value}
            </p>
          </GlassCard>
        ))}
      </motion.div>

      {/* Contract Addresses */}
      <motion.div variants={fadeUp} transition={{ duration: 0.4 }} className="mb-8">
        <GlassCard className="p-5">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">Contract Addresses</h3>
          <div className="space-y-2">
            {[
              { label: "SBT Proxy", addr: community.sbtProxy },
              { label: "Badge Proxy", addr: community.badgeProxy },
              { label: "Admin", addr: community.adminAddress },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/[0.02]">
                <span className="text-xs text-slate-500">{item.label}</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-slate-300">{formatAddress(item.addr, 8)}</span>
                  <Copy className="w-3 h-3 text-slate-600 cursor-pointer hover:text-slate-400 transition-colors" />
                  <ExternalLink className="w-3 h-3 text-slate-600 cursor-pointer hover:text-slate-400 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Events List */}
        <motion.div variants={fadeUp} transition={{ duration: 0.4 }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-200">Events</h2>
            <button className="flex items-center gap-1.5 text-xs text-[#00d4aa] hover:text-[#00b894] transition-colors">
              <Plus className="w-3.5 h-3.5" />
              Create Event
            </button>
          </div>
          <div className="space-y-3">
            {events.map((event) => (
              <GlassCard key={event.id} hoverable className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-slate-200">{event.name}</h4>
                  <EventStatusBadge status={event.status} />
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{event.currentMinted}/{event.maxCapacity} minted</span>
                  <span>{event.createdAt.toLocaleDateString()}</span>
                </div>
                {/* Capacity bar */}
                <div className="mt-3 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#00d4aa] to-[#0984e3] transition-all duration-500"
                    style={{ width: `${(event.currentMinted / event.maxCapacity) * 100}%` }}
                  />
                </div>
              </GlassCard>
            ))}
            {events.length === 0 && (
              <GlassCard className="p-8 text-center">
                <Calendar className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No events yet</p>
              </GlassCard>
            )}
          </div>
        </motion.div>

        {/* Members List */}
        <motion.div variants={fadeUp} transition={{ duration: 0.4 }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-200">Members</h2>
            <span className="text-xs text-muted-foreground">{members.length} shown</span>
          </div>
          <GlassCard className="p-0 overflow-hidden">
            <div className="divide-y divide-white/5">
              {members.map((member) => {
                const roleConf = ROLE_CONFIG[member.role] || { color: "text-slate-400", icon: <User className="w-3 h-3" /> };
                return (
                  <div key={member.address} className="flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00d4aa]/20 to-[#0984e3]/20 flex items-center justify-center">
                        <span className="text-xs font-bold text-slate-300">
                          {(member.displayName || "?").slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-200">{member.displayName}</p>
                        <p className="text-[10px] font-mono text-slate-500">{formatAddress(member.address)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`flex items-center gap-1 text-[10px] ${roleConf.color}`}>
                        {roleConf.icon}
                        {member.role}
                      </span>
                      <span className="text-[10px] text-slate-600 font-mono">#{member.sbtTokenId}</span>
                    </div>
                  </div>
                );
              })}
              {members.length === 0 && (
                <div className="p-8 text-center">
                  <Users className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No members data available</p>
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </motion.div>
  );
}

"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/shared/GlassCard";
import { BadgeSVG } from "@/components/badges/BadgeSVG";
import { MOCK_USER_BADGES } from "@/lib/mock/badges";
import { QRCodeSVG } from "qrcode.react";
import { ImageIcon, Grid3X3, List, X, QrCode } from "lucide-react";

const ACCENT_COLORS = ["#00d4aa", "#0984e3", "#a855f7", "#f59e0b", "#ef4444", "#ec4899"];

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export default function GalleryPage() {
  const [selectedBadge, setSelectedBadge] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const badge = selectedBadge !== null ? MOCK_USER_BADGES[selectedBadge] : null;

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={{ animate: { transition: { staggerChildren: 0.08 } } }}
    >
      <motion.div variants={fadeUp} transition={{ duration: 0.4 }} className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-100">
              Badge Gallery
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {MOCK_USER_BADGES.length} badges collected
            </p>
          </div>
          <div className="flex items-center gap-1 p-1 rounded-lg glass">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-md transition-colors ${viewMode === "grid" ? "bg-white/10 text-slate-200" : "text-slate-500 hover:text-slate-300"}`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-md transition-colors ${viewMode === "list" ? "bg-white/10 text-slate-200" : "text-slate-500 hover:text-slate-300"}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {MOCK_USER_BADGES.length === 0 ? (
        <motion.div variants={fadeUp} transition={{ duration: 0.4 }}>
          <GlassCard className="p-16 text-center">
            <ImageIcon className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-400 mb-2">No badges yet</h3>
            <p className="text-sm text-slate-600">
              Claim your first badge from the Claim Portal
            </p>
          </GlassCard>
        </motion.div>
      ) : viewMode === "grid" ? (
        <motion.div
          variants={fadeUp}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5"
        >
          {MOCK_USER_BADGES.map((b, i) => (
            <motion.div
              key={`${b.communityId}-${b.eventId}-${i}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
            >
              <GlassCard
                hoverable
                className="p-5 text-center cursor-pointer"
                onClick={() => setSelectedBadge(i)}
              >
                <div className="flex justify-center mb-3">
                  <BadgeSVG
                    eventName={b.eventName}
                    communityName={b.communityName}
                    eventId={b.eventId}
                    accentColor={ACCENT_COLORS[i % ACCENT_COLORS.length]}
                    size={160}
                  />
                </div>
                <h4 className="text-sm font-semibold text-slate-200 truncate">
                  {b.eventName}
                </h4>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {b.communityName}
                </p>
                <p className="text-[10px] text-slate-600 mt-1">
                  {b.mintedAt.toLocaleDateString()}
                </p>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div variants={fadeUp} transition={{ duration: 0.4 }}>
          <GlassCard className="p-0 overflow-hidden">
            <div className="divide-y divide-white/5">
              {MOCK_USER_BADGES.map((b, i) => (
                <div
                  key={`${b.communityId}-${b.eventId}-${i}`}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors cursor-pointer"
                  onClick={() => setSelectedBadge(i)}
                >
                  <BadgeSVG
                    eventName={b.eventName}
                    communityName={b.communityName}
                    eventId={b.eventId}
                    accentColor={ACCENT_COLORS[i % ACCENT_COLORS.length]}
                    size={60}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-slate-200 truncate">{b.eventName}</h4>
                    <p className="text-xs text-muted-foreground">{b.communityName}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-slate-400">{b.mintedAt.toLocaleDateString()}</p>
                    <p className="text-[10px] font-mono text-slate-600">#{b.eventId.toString().padStart(4, "0")}</p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Badge Detail Modal */}
      {badge && selectedBadge !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setSelectedBadge(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-3xl p-8 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-200">Badge Detail</h3>
              <button
                onClick={() => setSelectedBadge(null)}
                className="text-slate-500 hover:text-slate-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex justify-center mb-6">
              <BadgeSVG
                eventName={badge.eventName}
                communityName={badge.communityName}
                eventId={badge.eventId}
                accentColor={ACCENT_COLORS[selectedBadge % ACCENT_COLORS.length]}
                size={200}
              />
            </div>

            <div className="text-center mb-6">
              <h4 className="text-base font-semibold text-slate-200">{badge.eventName}</h4>
              <p className="text-sm text-muted-foreground">{badge.communityName}</p>
              <p className="text-xs text-slate-600 mt-1 font-mono">{badge.tokenURI}</p>
            </div>

            {/* QR Code for O2O */}
            <div className="flex flex-col items-center p-5 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center gap-1.5 mb-3">
                <QrCode className="w-3.5 h-3.5 text-[#00d4aa]" />
                <span className="text-xs text-slate-400">O2O Verification QR</span>
              </div>
              <div className="p-3 bg-white rounded-xl">
                <QRCodeSVG
                  value={`communigate://verify/${badge.communityId}/${badge.eventId}`}
                  size={150}
                  level="H"
                  bgColor="#ffffff"
                  fgColor="#0B1021"
                />
              </div>
              <p className="text-[10px] text-slate-600 mt-2">
                Show this at the event gate
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4 text-center">
              <div className="p-3 rounded-xl bg-white/[0.02]">
                <p className="text-[10px] text-slate-500">Minted</p>
                <p className="text-xs text-slate-300">{badge.mintedAt.toLocaleDateString()}</p>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02]">
                <p className="text-[10px] text-slate-500">Event ID</p>
                <p className="text-xs text-slate-300 font-mono">#{badge.eventId.toString().padStart(4, "0")}</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

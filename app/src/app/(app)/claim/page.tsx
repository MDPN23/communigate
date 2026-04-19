"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/shared/GlassCard";
import { BadgeSVG } from "@/components/badges/BadgeSVG";
import { TransactionToast } from "@/components/shared/TransactionToast";
import { useMockTransaction } from "@/hooks/useMockTransaction";
import { MOCK_CLAIMABLE_BADGES } from "@/lib/mock/badges";
import { MOCK_USER_BADGES } from "@/lib/mock/badges";
import { Ticket, CheckCircle2, Sparkles, ArrowRight } from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export default function ClaimPage() {
  const tx = useMockTransaction();
  const [claimedIds, setClaimedIds] = useState<Set<number>>(new Set());

  const handleClaim = async (eventId: number) => {
    await tx.write({ delayMs: 3000 });
    setClaimedIds((prev) => new Set(prev).add(eventId));
    setTimeout(() => tx.reset(), 4000);
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={{ animate: { transition: { staggerChildren: 0.08 } } }}
    >
      <motion.div variants={fadeUp} transition={{ duration: 0.4 }} className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-100">
          Claim Portal
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Discover and claim your community badges
        </p>
      </motion.div>

      {/* Available Claims */}
      <motion.div variants={fadeUp} transition={{ duration: 0.4 }} className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-[#00d4aa]" />
          <h2 className="text-lg font-semibold text-slate-200">Available to Claim</h2>
        </div>

        {MOCK_CLAIMABLE_BADGES.length === 0 && !claimedIds.size ? (
          <GlassCard className="p-12 text-center">
            <Ticket className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No badges available to claim right now</p>
            <p className="text-xs text-slate-600 mt-1">Check back when new events are activated</p>
          </GlassCard>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {MOCK_CLAIMABLE_BADGES.map((badge) => {
              const isClaimed = claimedIds.has(badge.eventId);
              return (
                <GlassCard key={badge.eventId} className="p-6 text-center">
                  <div className="flex justify-center mb-4">
                    <BadgeSVG
                      eventName={badge.eventName}
                      communityName={badge.communityName}
                      eventId={badge.eventId}
                      accentColor={isClaimed ? "#00d4aa" : "#0984e3"}
                      size={180}
                    />
                  </div>
                  <h3 className="text-base font-semibold text-slate-200 mb-1">
                    {badge.eventName}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    {badge.communityName}
                  </p>

                  {isClaimed ? (
                    <div className="flex items-center justify-center gap-2 text-sm text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      Claimed!
                    </div>
                  ) : (
                    <button
                      onClick={() => handleClaim(badge.eventId)}
                      disabled={tx.isPending || tx.isConfirming}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#00d4aa] to-[#00b894] text-white font-semibold text-sm transition-all duration-300 hover:shadow-[0_0_24px_rgba(0,212,170,0.4)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed btn-glow"
                    >
                      {tx.isPending || tx.isConfirming ? (
                        "Processing..."
                      ) : (
                        <>
                          Claim Badge
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  )}
                </GlassCard>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Already Claimed */}
      <motion.div variants={fadeUp} transition={{ duration: 0.4 }}>
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 className="w-4 h-4 text-slate-500" />
          <h2 className="text-lg font-semibold text-slate-200">Already Claimed</h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {MOCK_USER_BADGES.map((badge, i) => (
            <GlassCard key={`${badge.communityId}-${badge.eventId}-${i}`} className="p-4 text-center">
              <div className="flex justify-center mb-3">
                <BadgeSVG
                  eventName={badge.eventName}
                  communityName={badge.communityName}
                  eventId={badge.eventId}
                  size={120}
                />
              </div>
              <h4 className="text-xs font-semibold text-slate-300 truncate">{badge.eventName}</h4>
              <p className="text-[10px] text-muted-foreground">{badge.communityName}</p>
              <p className="text-[10px] text-slate-600 mt-1">{badge.mintedAt.toLocaleDateString()}</p>
            </GlassCard>
          ))}
        </div>
      </motion.div>

      {/* Transaction Toast */}
      <TransactionToast
        status={tx.status}
        hash={tx.hash}
        error={tx.error}
        label="Claiming Event Badge"
        onClose={tx.reset}
      />
    </motion.div>
  );
}

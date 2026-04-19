"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/shared/GlassCard";
import { formatAddress } from "@/lib/utils";
import { QrCode, Camera, CheckCircle2, XCircle, RotateCcw, Zap } from "lucide-react";

type ScanResult = "idle" | "scanning" | "verified" | "rejected";

const MOCK_BADGE_HOLDERS = [
  "0xdef4560000000000000000000000000000000002",
  "0x7890ab0000000000000000000000000000000003",
  "0xcdef120000000000000000000000000000000004",
  "0x1234567890abcdef1234567890abcdef12345678",
];

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export default function ScannerPage() {
  const [scanResult, setScanResult] = useState<ScanResult>("idle");
  const [scannedAddress, setScannedAddress] = useState("");

  const simulateScan = () => {
    setScanResult("scanning");

    setTimeout(() => {
      // Randomly pick an address (70% chance badge holder, 30% random)
      const isHolder = Math.random() > 0.3;
      const addr = isHolder
        ? MOCK_BADGE_HOLDERS[Math.floor(Math.random() * MOCK_BADGE_HOLDERS.length)]
        : "0x0000000000000000000000000000000000000000";

      setScannedAddress(addr);
      setScanResult(isHolder ? "verified" : "rejected");
    }, 2000);
  };

  const resetScan = () => {
    setScanResult("idle");
    setScannedAddress("");
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={{ animate: { transition: { staggerChildren: 0.08 } } }}
    >
      <motion.div variants={fadeUp} transition={{ duration: 0.4 }} className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-100">
          QR Scanner
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Verify event badge holders at the gate — zero gas cost
        </p>
      </motion.div>

      <div className="max-w-lg mx-auto">
        <motion.div variants={fadeUp} transition={{ duration: 0.4 }}>
          <GlassCard className="p-6">
            {/* Scanner preview area */}
            <div className="relative aspect-square rounded-2xl overflow-hidden mb-6 bg-black/40 border border-white/5">
              {/* Scanner frame overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                {scanResult === "idle" && (
                  <div className="text-center">
                    <div className="w-48 h-48 border-2 border-dashed border-white/20 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                      <Camera className="w-12 h-12 text-slate-600" />
                    </div>
                    <p className="text-sm text-slate-500">Camera preview area</p>
                    <p className="text-xs text-slate-600 mt-1">
                      Click below to simulate a QR scan
                    </p>
                  </div>
                )}

                {scanResult === "scanning" && (
                  <div className="text-center">
                    <div className="w-48 h-48 border-2 border-[#00d4aa] rounded-2xl flex items-center justify-center mb-4 mx-auto animate-pulse">
                      <QrCode className="w-12 h-12 text-[#00d4aa] animate-pulse" />
                    </div>
                    <p className="text-sm text-[#00d4aa]">Scanning...</p>
                  </div>
                )}

                {scanResult === "verified" && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center"
                  >
                    <div className="w-48 h-48 border-2 border-emerald-400 rounded-2xl flex items-center justify-center mb-4 mx-auto bg-emerald-500/5 shadow-[0_0_60px_rgba(16,185,129,0.2)]">
                      <CheckCircle2 className="w-16 h-16 text-emerald-400" />
                    </div>
                    <p className="text-lg font-semibold text-emerald-400">Verified ✓</p>
                    <p className="text-xs text-slate-400 mt-1">Badge holder confirmed</p>
                  </motion.div>
                )}

                {scanResult === "rejected" && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center"
                  >
                    <div className="w-48 h-48 border-2 border-red-400 rounded-2xl flex items-center justify-center mb-4 mx-auto bg-red-500/5 shadow-[0_0_60px_rgba(239,68,68,0.2)]">
                      <XCircle className="w-16 h-16 text-red-400" />
                    </div>
                    <p className="text-lg font-semibold text-red-400">Not Found</p>
                    <p className="text-xs text-slate-400 mt-1">No badge for this event</p>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Scanned address info */}
            {scannedAddress && (
              <div className="mb-4 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Scanned Address</span>
                  <span className="font-mono text-xs text-slate-300">
                    {formatAddress(scannedAddress, 8)}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-slate-500">balanceOf()</span>
                  <span className={`text-xs font-mono ${scanResult === "verified" ? "text-emerald-400" : "text-red-400"}`}>
                    {scanResult === "verified" ? "1" : "0"}
                  </span>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3">
              {scanResult === "idle" || scanResult === "scanning" ? (
                <button
                  onClick={simulateScan}
                  disabled={scanResult === "scanning"}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-r from-[#00d4aa] to-[#00b894] text-white font-semibold text-sm transition-all duration-300 hover:shadow-[0_0_24px_rgba(0,212,170,0.4)] active:scale-95 disabled:opacity-50 btn-glow"
                >
                  {scanResult === "scanning" ? (
                    "Scanning..."
                  ) : (
                    <>
                      <QrCode className="w-4 h-4" />
                      Simulate Scan
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={resetScan}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-full border border-white/15 text-slate-300 font-medium text-sm hover:bg-white/5 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Scan Again
                </button>
              )}
            </div>
          </GlassCard>
        </motion.div>

        {/* Info card */}
        <motion.div variants={fadeUp} transition={{ duration: 0.4 }} className="mt-6">
          <GlassCard className="p-5">
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-slate-300 mb-1">
                  Zero Gas Verification
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  QR scanning calls <code className="font-mono text-[#00d4aa] bg-white/5 px-1 rounded">balanceOf()</code> — 
                  a read-only view function. No transaction needed, no gas fees. 
                  Verification is instant and free.
                </p>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </motion.div>
  );
}

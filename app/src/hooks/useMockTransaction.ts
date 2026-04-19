"use client";

import { useState, useCallback } from "react";
import { TxStatus, TxResult } from "@/lib/types";
import { sleep, mockTxHash } from "@/lib/utils";

/**
 * Mock transaction hook — simulates the Wagmi tx lifecycle:
 *   idle → pending → confirming → success/error
 *
 * Will be replaced by:
 *   useWriteContract() + useWaitForTransactionReceipt()
 */
export function useMockTransaction() {
  const [result, setResult] = useState<TxResult>({ status: "idle" });

  const write = useCallback(async (
    options?: { failRate?: number; delayMs?: number }
  ) => {
    const { failRate = 0, delayMs = 2000 } = options ?? {};

    try {
      // Step 1: Pending (waiting for wallet confirmation)
      setResult({ status: "pending" });
      await sleep(delayMs * 0.4);

      // Step 2: Confirming (tx submitted, waiting for block)
      const hash = mockTxHash();
      setResult({ status: "confirming", hash });
      await sleep(delayMs * 0.6);

      // Step 3: Success or failure
      if (Math.random() < failRate) {
        setResult({ status: "error", hash, error: "Transaction reverted" });
      } else {
        setResult({ status: "success", hash });
      }
    } catch {
      setResult({ status: "error", error: "User rejected transaction" });
    }
  }, []);

  const reset = useCallback(() => {
    setResult({ status: "idle" });
  }, []);

  return {
    ...result,
    write,
    reset,
    isPending: result.status === "pending",
    isConfirming: result.status === "confirming",
    isSuccess: result.status === "success",
    isError: result.status === "error",
    isIdle: result.status === "idle",
  };
}

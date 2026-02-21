import { motion } from "framer-motion";
import type { W2Result, ContractResult } from "../lib/types";

const fmt = (n: number) =>
  Math.round(n).toLocaleString("en-US", { maximumFractionDigits: 0 });

interface HeroMetricsProps {
  w2Result: W2Result;
  contractResult: ContractResult;
}

export default function HeroMetrics({
  w2Result,
  contractResult,
}: HeroMetricsProps) {
  const diff = w2Result.net - contractResult.net;
  const w2Wins = diff > 0;
  const absDiff = Math.abs(diff);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* W-2 Net */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative overflow-hidden rounded-2xl p-5
          dark:bg-positive-500/10 bg-positive-50
          dark:border-positive-500/20 border-positive-200 border"
      >
        <div
          className="absolute top-0 right-0 w-24 h-24 rounded-full
          dark:bg-positive-500/10 bg-positive-100
          -translate-y-1/2 translate-x-1/2"
        />
        <p className="text-xs font-medium uppercase tracking-wider dark:text-positive-400 text-positive-600 mb-1">
          W-2 Net
        </p>
        <p className="text-3xl sm:text-4xl font-extrabold tabular-nums dark:text-positive-400 text-positive-600">
          ${fmt(w2Result.net)}
        </p>
        <p className="text-xs dark:text-base-400 text-base-500 mt-1">
          ${fmt(w2Result.monthly)}/mo
        </p>
      </motion.div>

      {/* 1099 Net */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative overflow-hidden rounded-2xl p-5
          dark:bg-accent-500/10 bg-indigo-50
          dark:border-accent-500/20 border-indigo-200 border"
      >
        <div
          className="absolute top-0 right-0 w-24 h-24 rounded-full
          dark:bg-accent-500/10 bg-indigo-100
          -translate-y-1/2 translate-x-1/2"
        />
        <p className="text-xs font-medium uppercase tracking-wider dark:text-accent-400 text-accent-600 mb-1">
          1099 Net
        </p>
        <p className="text-3xl sm:text-4xl font-extrabold tabular-nums dark:text-accent-400 text-accent-600">
          ${fmt(contractResult.net)}
        </p>
        <p className="text-xs dark:text-base-400 text-base-500 mt-1">
          ${fmt(contractResult.monthly)}/mo
        </p>
      </motion.div>

      {/* Difference */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative overflow-hidden rounded-2xl p-5
          dark:bg-base-800 bg-white
          dark:border-base-700 border-base-200 border"
      >
        <p className="text-xs font-medium uppercase tracking-wider dark:text-base-400 text-base-500 mb-1">
          Difference
        </p>
        <p
          className={`text-3xl sm:text-4xl font-extrabold tabular-nums ${
            w2Wins
              ? "dark:text-positive-400 text-positive-600"
              : "dark:text-accent-400 text-accent-600"
          }`}
        >
          {diff >= 0 ? "+" : "-"}${fmt(absDiff)}
        </p>
        <div className="mt-2">
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              w2Wins
                ? "dark:bg-positive-500/20 bg-positive-100 dark:text-positive-400 text-positive-700"
                : "dark:bg-accent-500/20 bg-indigo-100 dark:text-accent-400 text-accent-700"
            }`}
          >
            {w2Wins ? "W-2 wins" : diff === 0 ? "Even" : "1099 wins"}
          </span>
        </div>
      </motion.div>
    </div>
  );
}

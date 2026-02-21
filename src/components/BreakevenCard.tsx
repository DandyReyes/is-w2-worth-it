import { motion } from "framer-motion";

const fmt = (n: number) =>
  Math.round(n).toLocaleString("en-US", { maximumFractionDigits: 0 });

interface BreakevenCardProps {
  breakEvenRate: number;
  w2Net: number;
  filingLabel: string;
}

export default function BreakevenCard({
  breakEvenRate,
  w2Net,
  filingLabel,
}: BreakevenCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.4, type: "spring", stiffness: 200, damping: 20 }}
      className="relative"
    >
      {/* Gradient border wrapper */}
      <div className="p-[1px] rounded-2xl bg-gradient-to-r from-accent-500 via-positive-500 to-accent-500">
        <div
          className="rounded-2xl p-6 sm:p-8 text-center
          dark:bg-base-900 bg-white"
        >
          <p className="text-xs font-semibold uppercase tracking-wider dark:text-base-400 text-base-500 mb-2">
            Break-Even 1099 Rate
          </p>
          <p
            className="text-4xl sm:text-5xl font-extrabold tabular-nums
            bg-gradient-to-r from-accent-400 to-positive-400 bg-clip-text text-transparent"
          >
            ${breakEvenRate.toFixed(2)}/hr
          </p>
          <p className="mt-3 text-sm dark:text-base-400 text-base-500 max-w-md mx-auto">
            The minimum 1099 rate needed to match your W-2 take-home of{" "}
            <span className="font-semibold dark:text-white text-base-900">
              ${fmt(w2Net)}
            </span>{" "}
            ({filingLabel})
          </p>
        </div>
      </div>
    </motion.div>
  );
}

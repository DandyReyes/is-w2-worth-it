import { motion } from "framer-motion";
import type { ComparisonRow } from "../lib/types";

const fmtCurrency = (n: number) => {
  const abs = Math.abs(Math.round(n));
  const formatted = abs.toLocaleString("en-US", { maximumFractionDigits: 0 });
  if (n < 0) return `-$${formatted}`;
  return `$${formatted}`;
};

const fmtPercent = (n: number) => `${n.toFixed(1)}%`;

interface ComparisonTableProps {
  rows: ComparisonRow[];
}

export default function ComparisonTable({ rows }: ComparisonTableProps) {
  return (
    <div>
      {/* Desktop Table (md+) */}
      <div
        className="hidden md:block overflow-hidden rounded-2xl
        dark:bg-base-800/50 bg-white
        dark:border-base-700/50 border-base-200 border"
      >
        <table className="w-full">
          <thead>
            <tr className="dark:bg-base-800 bg-base-100">
              <th
                className="text-left text-xs font-semibold uppercase tracking-wider
                dark:text-base-400 text-base-500 px-5 py-3"
              >
                Line Item
              </th>
              <th
                className="text-right text-xs font-semibold uppercase tracking-wider
                dark:text-positive-400 text-positive-600 px-5 py-3"
              >
                W-2
              </th>
              <th
                className="text-right text-xs font-semibold uppercase tracking-wider
                dark:text-accent-400 text-accent-600 px-5 py-3"
              >
                1099
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const isNet = row.isHighlightRow;
              const w2Better =
                !row.isPercent &&
                !row.isDeduction &&
                row.w2Value > row.contractValue;
              const c1099Better =
                !row.isPercent &&
                !row.isDeduction &&
                row.contractValue > row.w2Value;

              // For deduction rows, less negative is better
              const w2BetterDed =
                row.isDeduction && row.w2Value > row.contractValue;
              const c1099BetterDed =
                row.isDeduction && row.contractValue > row.w2Value;

              // For percent (effective tax rate), lower is better
              const w2BetterPct =
                row.isPercent && row.w2Value < row.contractValue;
              const c1099BetterPct =
                row.isPercent && row.contractValue < row.w2Value;

              const showW2Win = w2Better || w2BetterDed || w2BetterPct;
              const showC1099Win =
                c1099Better || c1099BetterDed || c1099BetterPct;

              // Skip rows where both values are zero
              if (row.w2Value === 0 && row.contractValue === 0) return null;

              return (
                <motion.tr
                  key={row.label}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className={`
                    border-t dark:border-base-700/50 border-base-100
                    ${isNet ? "dark:bg-base-800 bg-base-50" : ""}
                  `}
                >
                  <td
                    className={`px-5 py-3 text-sm ${
                      isNet
                        ? "font-bold dark:text-white text-base-900"
                        : "dark:text-base-300 text-base-600"
                    }`}
                  >
                    {row.label}
                  </td>
                  <td
                    className={`px-5 py-3 text-right tabular-nums ${
                      isNet
                        ? "text-lg font-bold dark:text-positive-400 text-positive-600"
                        : row.isDeduction
                          ? "text-sm dark:text-negative-400 text-negative-500"
                          : row.isAddition
                            ? "text-sm dark:text-positive-400 text-positive-600"
                            : "text-sm dark:text-base-300 text-base-600"
                    } ${showW2Win && isNet ? "dark:drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]" : ""}`}
                  >
                    {row.w2Value === 0 && !isNet
                      ? "—"
                      : row.isPercent
                        ? fmtPercent(row.w2Value)
                        : fmtCurrency(row.w2Value)}
                    {showW2Win && isNet && (
                      <span className="ml-2 inline-block w-2 h-2 rounded-full bg-positive-400" />
                    )}
                  </td>
                  <td
                    className={`px-5 py-3 text-right tabular-nums ${
                      isNet
                        ? "text-lg font-bold dark:text-accent-400 text-accent-600"
                        : row.isDeduction
                          ? "text-sm dark:text-negative-400 text-negative-500"
                          : row.isAddition
                            ? "text-sm dark:text-positive-400 text-positive-600"
                            : "text-sm dark:text-base-300 text-base-600"
                    } ${showC1099Win && isNet ? "dark:drop-shadow-[0_0_8px_rgba(129,140,248,0.3)]" : ""}`}
                  >
                    {row.contractValue === 0 && !isNet
                      ? "—"
                      : row.isPercent
                        ? fmtPercent(row.contractValue)
                        : fmtCurrency(row.contractValue)}
                    {showC1099Win && isNet && (
                      <span className="ml-2 inline-block w-2 h-2 rounded-full bg-accent-400" />
                    )}
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Stacked Cards */}
      <div className="md:hidden space-y-2">
        {rows.map((row, i) => {
          if (row.w2Value === 0 && row.contractValue === 0) return null;
          const isNet = row.isHighlightRow;

          return (
            <motion.div
              key={row.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`rounded-xl p-4 border
                ${
                  isNet
                    ? "dark:bg-base-800 bg-white dark:border-base-600 border-base-300"
                    : "dark:bg-base-800/30 bg-base-50 dark:border-base-800 border-base-200"
                }
              `}
            >
              <p
                className={`text-xs uppercase tracking-wider mb-2 ${
                  isNet
                    ? "font-bold dark:text-white text-base-900"
                    : "dark:text-base-400 text-base-500"
                }`}
              >
                {row.label}
              </p>
              <div className="flex justify-between items-baseline gap-4">
                <div>
                  <span className="text-[10px] uppercase tracking-wider dark:text-positive-400/60 text-positive-600/60">
                    W-2
                  </span>
                  <p
                    className={`tabular-nums ${
                      isNet
                        ? "text-xl font-bold dark:text-positive-400 text-positive-600"
                        : row.isDeduction
                          ? "text-sm dark:text-negative-400 text-negative-500"
                          : row.isAddition
                            ? "text-sm dark:text-positive-400 text-positive-600"
                            : "text-sm dark:text-base-300 text-base-600"
                    }`}
                  >
                    {row.w2Value === 0 && !isNet
                      ? "—"
                      : row.isPercent
                        ? fmtPercent(row.w2Value)
                        : fmtCurrency(row.w2Value)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase tracking-wider dark:text-accent-400/60 text-accent-600/60">
                    1099
                  </span>
                  <p
                    className={`tabular-nums ${
                      isNet
                        ? "text-xl font-bold dark:text-accent-400 text-accent-600"
                        : row.isDeduction
                          ? "text-sm dark:text-negative-400 text-negative-500"
                          : row.isAddition
                            ? "text-sm dark:text-positive-400 text-positive-600"
                            : "text-sm dark:text-base-300 text-base-600"
                    }`}
                  >
                    {row.contractValue === 0 && !isNet
                      ? "—"
                      : row.isPercent
                        ? fmtPercent(row.contractValue)
                        : fmtCurrency(row.contractValue)}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

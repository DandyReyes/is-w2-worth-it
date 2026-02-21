import { AnimatePresence, motion } from "framer-motion";
import type { BenefitMode, CoverageType, BenefitItem } from "../lib/types";

const fmt = (n: number) =>
  n.toLocaleString("en-US", { maximumFractionDigits: 0 });

interface BenefitsPanelProps {
  benefitMode: BenefitMode;
  setBenefitMode: (v: BenefitMode) => void;
  coverageType: CoverageType;
  setCoverageType: (v: CoverageType) => void;
  activeBenefits: BenefitItem[];
  customBenefits: BenefitItem[];
  updateCustomBenefit: (key: string, updates: Partial<BenefitItem>) => void;
  resetCustomBenefits: () => void;
  w2Rate: number;
}

const modes: { value: BenefitMode; label: string }[] = [
  { value: "off", label: "Off" },
  { value: "averages", label: "LA Averages" },
  { value: "custom", label: "Customize" },
];

export default function BenefitsPanel({
  benefitMode,
  setBenefitMode,
  coverageType,
  setCoverageType,
  activeBenefits,
  customBenefits,
  updateCustomBenefit,
  resetCustomBenefits,
  w2Rate,
}: BenefitsPanelProps) {
  const totalBenefits = activeBenefits
    .filter((b) => b.enabled)
    .reduce((sum, b) => sum + b.amount, 0);

  const displayBenefits =
    benefitMode === "custom" ? customBenefits : activeBenefits;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold dark:text-base-300 text-base-600 uppercase tracking-wider">
          W-2 Benefits
        </h3>
        {benefitMode !== "off" && (
          <span className="text-sm font-bold tabular-nums dark:text-positive-400 text-positive-600">
            +${fmt(totalBenefits)}/yr
          </span>
        )}
      </div>

      {/* Mode Selector */}
      <div className="flex dark:bg-base-800 bg-base-200 rounded-xl p-1">
        {modes.map((m) => (
          <button
            key={m.value}
            onClick={() => {
              setBenefitMode(m.value);
              if (m.value === "custom") resetCustomBenefits();
            }}
            className={`flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              benefitMode === m.value
                ? "dark:bg-positive-600 bg-positive-500 text-white shadow-lg"
                : "dark:text-base-400 text-base-500 dark:hover:text-white hover:text-base-900"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {benefitMode !== "off" && (
          <motion.div
            key={benefitMode}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            {/* Coverage Type Toggle */}
            <div className="mb-4">
              <div className="flex dark:bg-base-800/50 bg-base-100 rounded-lg p-1 max-w-xs">
                {(["individual", "family"] as CoverageType[]).map((ct) => (
                  <button
                    key={ct}
                    onClick={() => setCoverageType(ct)}
                    className={`flex-1 py-1.5 px-3 rounded-md text-xs font-semibold transition-all cursor-pointer capitalize ${
                      coverageType === ct
                        ? "dark:bg-base-700 bg-white dark:text-white text-base-900 shadow-sm"
                        : "dark:text-base-500 text-base-400"
                    }`}
                  >
                    {ct}
                  </button>
                ))}
              </div>
            </div>

            {/* Benefits List */}
            <div className="space-y-2">
              {displayBenefits.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between gap-3 py-2 px-3 rounded-lg
                    dark:bg-base-800/30 bg-base-50
                    dark:border-base-800 border-base-200 border"
                >
                  <label className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer">
                    {benefitMode === "custom" ? (
                      <input
                        type="checkbox"
                        checked={item.enabled}
                        onChange={(e) =>
                          updateCustomBenefit(item.key, {
                            enabled: e.target.checked,
                          })
                        }
                        className="w-3.5 h-3.5 rounded shrink-0
                          text-positive-500 bg-transparent
                          dark:border-base-600 border-base-400
                          focus:ring-positive-500/30 focus:ring-2"
                      />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-positive-500 shrink-0" />
                    )}
                    <span
                      className={`text-sm truncate ${
                        item.enabled
                          ? "dark:text-base-300 text-base-600"
                          : "dark:text-base-600 text-base-400 line-through"
                      }`}
                    >
                      {item.label}
                    </span>
                  </label>

                  <div className="shrink-0">
                    {benefitMode === "custom" && item.days !== undefined ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          value={item.days}
                          onChange={(e) =>
                            updateCustomBenefit(item.key, {
                              days: Number(e.target.value),
                            })
                          }
                          className="w-14 px-2 py-1 rounded-md text-xs text-right tabular-nums
                            dark:bg-base-900 bg-white
                            dark:text-white text-base-900
                            dark:border-base-700 border-base-300 border
                            outline-none"
                        />
                        <span className="text-xs dark:text-base-500 text-base-400 whitespace-nowrap">
                          days (${fmt(item.amount)})
                        </span>
                      </div>
                    ) : benefitMode === "custom" ? (
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs dark:text-base-500 text-base-400">
                          $
                        </span>
                        <input
                          type="number"
                          value={item.amount}
                          onChange={(e) =>
                            updateCustomBenefit(item.key, {
                              amount: Number(e.target.value),
                            })
                          }
                          className="w-24 pl-5 pr-2 py-1 rounded-md text-xs text-right tabular-nums
                            dark:bg-base-900 bg-white
                            dark:text-white text-base-900
                            dark:border-base-700 border-base-300 border
                            outline-none"
                        />
                      </div>
                    ) : (
                      <span
                        className={`text-sm font-medium tabular-nums ${
                          item.enabled
                            ? "dark:text-white text-base-900"
                            : "dark:text-base-600 text-base-400"
                        }`}
                      >
                        ${fmt(item.amount)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* PTO note */}
            {benefitMode === "averages" && (
              <p className="mt-2 text-xs dark:text-base-500 text-base-400">
                PTO & holidays computed at ${w2Rate}/hr × 8 hrs/day
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import type { FilingStatus, LaBizTaxClass } from "../lib/types";

const fmt = (n: number) =>
  n.toLocaleString("en-US", { maximumFractionDigits: 0 });

interface InputPanelProps {
  filingStatus: FilingStatus;
  setFilingStatus: (v: FilingStatus) => void;
  w2Rate: number;
  setW2Rate: (v: number) => void;
  contractRate: number;
  setContractRate: (v: number) => void;
  hours: number;
  setHours: (v: number) => void;
  healthInsuranceCost: number;
  setHealthInsuranceCost: (v: number) => void;
  bizExpenses: number;
  setBizExpenses: (v: number) => void;
  laBizTaxClass: LaBizTaxClass;
  setLaBizTaxClass: (v: LaBizTaxClass) => void;
  isServiceTrade: boolean;
  setIsServiceTrade: (v: boolean) => void;
}

export default function InputPanel({
  filingStatus,
  setFilingStatus,
  w2Rate,
  setW2Rate,
  contractRate,
  setContractRate,
  hours,
  setHours,
  healthInsuranceCost,
  setHealthInsuranceCost,
  bizExpenses,
  setBizExpenses,
  laBizTaxClass,
  setLaBizTaxClass,
  isServiceTrade,
  setIsServiceTrade,
}: InputPanelProps) {
  return (
    <div className="space-y-6">
      {/* Filing Status & Hours */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Filing Status - Pill Toggle */}
        <div>
          <label className="block text-xs font-medium dark:text-base-400 text-base-500 mb-2 uppercase tracking-wider">
            Filing Status
          </label>
          <div className="flex dark:bg-base-800 bg-base-200 rounded-xl p-1">
            {(["single", "mfj"] as FilingStatus[]).map((status) => (
              <button
                key={status}
                onClick={() => setFilingStatus(status)}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                  filingStatus === status
                    ? "dark:bg-accent-500 bg-accent-500 text-white shadow-lg"
                    : "dark:text-base-400 text-base-500 dark:hover:text-white hover:text-base-900"
                }`}
              >
                {status === "single" ? "Single" : "Married Filing Jointly"}
              </button>
            ))}
          </div>
        </div>

        {/* Annual Hours */}
        <div>
          <label className="block text-xs font-medium dark:text-base-400 text-base-500 mb-2 uppercase tracking-wider">
            Annual Hours
          </label>
          <input
            type="number"
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
            className="w-full px-4 py-2.5 rounded-xl
              dark:bg-base-800 bg-white
              dark:text-white text-base-900
              dark:border-base-700 border-base-300 border
              dark:focus:border-accent-500 focus:border-accent-500
              focus:ring-2 focus:ring-accent-500/20
              outline-none transition-all text-sm font-medium tabular-nums"
          />
          <p className="mt-1 text-xs dark:text-base-500 text-base-400">
            Full-time = 2,080 hrs/yr
          </p>
        </div>
      </div>

      {/* Hourly Rates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium dark:text-base-400 text-base-500 mb-2 uppercase tracking-wider">
            W-2 Hourly Rate
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 dark:text-base-500 text-base-400 font-medium">
              $
            </span>
            <input
              type="number"
              step="0.01"
              value={w2Rate}
              onChange={(e) => setW2Rate(Number(e.target.value))}
              className="w-full pl-8 pr-4 py-2.5 rounded-xl
                dark:bg-base-800 bg-white
                dark:text-white text-base-900
                dark:border-base-700 border-base-300 border
                dark:focus:border-positive-500 focus:border-positive-500
                focus:ring-2 focus:ring-positive-500/20
                outline-none transition-all text-sm font-medium tabular-nums"
            />
          </div>
          <p className="mt-1 text-xs dark:text-base-500 text-base-400">
            ${fmt(w2Rate * hours)}/yr gross
          </p>
        </div>

        <div>
          <label className="block text-xs font-medium dark:text-base-400 text-base-500 mb-2 uppercase tracking-wider">
            1099 Hourly Rate
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 dark:text-base-500 text-base-400 font-medium">
              $
            </span>
            <input
              type="number"
              step="0.01"
              value={contractRate}
              onChange={(e) => setContractRate(Number(e.target.value))}
              className="w-full pl-8 pr-4 py-2.5 rounded-xl
                dark:bg-base-800 bg-white
                dark:text-white text-base-900
                dark:border-base-700 border-base-300 border
                dark:focus:border-accent-500 focus:border-accent-500
                focus:ring-2 focus:ring-accent-500/20
                outline-none transition-all text-sm font-medium tabular-nums"
            />
          </div>
          <p className="mt-1 text-xs dark:text-base-500 text-base-400">
            ${fmt(contractRate * hours)}/yr gross
          </p>
        </div>
      </div>

      {/* 1099-Specific Deductions */}
      <div className="dark:bg-base-800/50 bg-base-100 rounded-xl p-4 space-y-4 border dark:border-base-700/50 border-base-200">
        <h3 className="text-sm font-semibold dark:text-base-300 text-base-600 uppercase tracking-wider">
          1099 Deductions & Costs
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs dark:text-base-400 text-base-500 mb-1.5">
              Health Insurance Cost (annual)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 dark:text-base-500 text-base-400 text-sm">
                $
              </span>
              <input
                type="number"
                value={healthInsuranceCost}
                onChange={(e) => setHealthInsuranceCost(Number(e.target.value))}
                className="w-full pl-7 pr-3 py-2 rounded-lg text-sm
                  dark:bg-base-900 bg-white
                  dark:text-white text-base-900
                  dark:border-base-700 border-base-300 border
                  dark:focus:border-accent-500 focus:border-accent-500
                  focus:ring-2 focus:ring-accent-500/20
                  outline-none transition-all tabular-nums"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs dark:text-base-400 text-base-500 mb-1.5">
              Business Expenses (annual)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 dark:text-base-500 text-base-400 text-sm">
                $
              </span>
              <input
                type="number"
                value={bizExpenses}
                onChange={(e) => setBizExpenses(Number(e.target.value))}
                className="w-full pl-7 pr-3 py-2 rounded-lg text-sm
                  dark:bg-base-900 bg-white
                  dark:text-white text-base-900
                  dark:border-base-700 border-base-300 border
                  dark:focus:border-accent-500 focus:border-accent-500
                  focus:ring-2 focus:ring-accent-500/20
                  outline-none transition-all tabular-nums"
              />
            </div>
          </div>
        </div>

        {/* LA Business Tax Classification */}
        <div>
          <label className="block text-xs dark:text-base-400 text-base-500 mb-1.5">
            LA City Business Tax Classification
          </label>
          <select
            value={laBizTaxClass}
            onChange={(e) => setLaBizTaxClass(e.target.value as LaBizTaxClass)}
            className="w-full px-3 py-2 rounded-lg text-sm
              dark:bg-base-900 bg-white
              dark:text-white text-base-900
              dark:border-base-700 border-base-300 border
              dark:focus:border-accent-500 focus:border-accent-500
              focus:ring-2 focus:ring-accent-500/20
              outline-none transition-all"
          >
            <option value="multimedia">Multimedia / Software (0.101%)</option>
            <option value="professions">
              Professions & Occupations (0.425%)
            </option>
            <option value="exempt">
              Exempt (gross ≤ $100K or outside LA city)
            </option>
          </select>
        </div>

        {/* Specified Service Trade Toggle + Tooltip */}
        <div className="relative group/tooltip inline-flex items-center gap-2">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={isServiceTrade}
              onChange={(e) => setIsServiceTrade(e.target.checked)}
              className="w-4 h-4 rounded
                text-accent-500 bg-transparent
                dark:border-base-600 border-base-400
                focus:ring-accent-500/30 focus:ring-2"
            />
            <span className="text-sm dark:text-base-300 text-base-600">
              Specified Service Trade (SSTB)
            </span>
          </label>

          {/* Info icon */}
          <span className="dark:text-base-500 text-base-400 cursor-help">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
              />
            </svg>
          </span>

          {/* Pure CSS Tooltip */}
          <div
            className="absolute bottom-full left-0 mb-2 w-80 p-3 rounded-xl
              dark:bg-base-800 bg-white shadow-xl
              dark:border-base-700 border-base-200 border
              text-xs leading-relaxed dark:text-base-300 text-base-600
              invisible group-hover/tooltip:visible
              opacity-0 group-hover/tooltip:opacity-100
              transition-opacity duration-200
              pointer-events-none z-50"
          >
            <p className="font-semibold dark:text-white text-base-900 mb-1">
              Specified Service Trade or Business (SSTB)
            </p>
            <p>
              Most tech consulting, software engineering, and professional
              services qualify as SSTBs. When enabled, the Section 199A QBI
              deduction (20% of business income) phases out between{" "}
              <strong>$191,950–$241,950</strong> (Single) or{" "}
              <strong>$383,900–$483,900</strong> (MFJ).
            </p>
            <p className="mt-1.5 dark:text-base-400 text-base-500">
              Disable this if your work is non-service based (e.g.,
              manufacturing, retail, real estate).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

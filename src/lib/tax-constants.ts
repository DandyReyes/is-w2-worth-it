// ─── 2025 Tax Year Constants — Los Angeles, CA ───

// Social Security
export const SS_WAGE_BASE = 176100;
export const SS_RATE_EMPLOYEE = 0.062;
export const SS_RATE_SELF = 0.124; // both halves

// Medicare
export const MEDICARE_RATE_EMPLOYEE = 0.0145;
export const MEDICARE_RATE_SELF = 0.029; // both halves
export const ADDITIONAL_MEDICARE_RATE = 0.009;
export const ADDITIONAL_MEDICARE_THRESHOLD_SINGLE = 200000;
export const ADDITIONAL_MEDICARE_THRESHOLD_MFJ = 250000;

// Self-Employment
export const SE_ADJUSTMENT = 0.9235; // only 92.35% of SE income is subject to SE tax

// California SDI (State Disability Insurance) — no wage cap as of 2024
export const CA_SDI_RATE = 0.012;

// LA City Business Tax (gross receipts)
export const LA_BIZ_TAX_MULTIMEDIA = 0.00101; // $1.01 per $1,000
export const LA_BIZ_TAX_PROFESSIONS = 0.00425; // $4.25 per $1,000
export const LA_BIZ_TAX_EXEMPTION_THRESHOLD = 100000; // no tax if gross ≤ $100K

// QBI (Section 199A) Deduction
export const QBI_DEDUCTION_RATE = 0.2; // 20% of qualified business income
export const QBI_PHASE_OUT_START_SINGLE = 191950;
export const QBI_PHASE_OUT_START_MFJ = 383900;
export const QBI_PHASE_OUT_RANGE_SINGLE = 50000;
export const QBI_PHASE_OUT_RANGE_MFJ = 100000;

// ─── Standard Deductions ───

export const FEDERAL_STD_DED_SINGLE = 15750;
export const FEDERAL_STD_DED_MFJ = 31500;
export const CA_STD_DED_SINGLE = 5706;
export const CA_STD_DED_MFJ = 11412;

// ─── Federal Brackets (2025) ───

export const FEDERAL_BRACKETS_SINGLE = [
  { limit: 11925, rate: 0.1 },
  { limit: 48475, rate: 0.12 },
  { limit: 103350, rate: 0.22 },
  { limit: 197300, rate: 0.24 },
  { limit: 250525, rate: 0.32 },
  { limit: 626350, rate: 0.35 },
  { limit: Infinity, rate: 0.37 },
];

export const FEDERAL_BRACKETS_MFJ = [
  { limit: 23850, rate: 0.1 },
  { limit: 96950, rate: 0.12 },
  { limit: 206700, rate: 0.22 },
  { limit: 394600, rate: 0.24 },
  { limit: 501050, rate: 0.32 },
  { limit: 751600, rate: 0.35 },
  { limit: Infinity, rate: 0.37 },
];

// ─── California Brackets (2025) ───
// Format: { min, max, base, rate } — tax = base + rate × (income − min)

export const CA_BRACKETS_SINGLE = [
  { min: 0, max: 11079, base: 0, rate: 0.01 },
  { min: 11079, max: 26264, base: 110.79, rate: 0.02 },
  { min: 26264, max: 41452, base: 414.49, rate: 0.04 },
  { min: 41452, max: 57542, base: 1022.01, rate: 0.06 },
  { min: 57542, max: 72724, base: 1987.41, rate: 0.08 },
  { min: 72724, max: 371479, base: 3201.97, rate: 0.093 },
  { min: 371479, max: 445771, base: 30986.26, rate: 0.103 },
  { min: 445771, max: 742953, base: 38638.27, rate: 0.113 },
  { min: 742953, max: 1000000, base: 72220.84, rate: 0.123 },
  { min: 1000000, max: Infinity, base: 103837.62, rate: 0.133 }, // includes 1% Mental Health Services
];

export const CA_BRACKETS_MFJ = [
  { min: 0, max: 22158, base: 0, rate: 0.01 },
  { min: 22158, max: 52528, base: 221.58, rate: 0.02 },
  { min: 52528, max: 82904, base: 828.98, rate: 0.04 },
  { min: 82904, max: 115084, base: 2044.02, rate: 0.06 },
  { min: 115084, max: 145448, base: 3974.82, rate: 0.08 },
  { min: 145448, max: 742958, base: 6403.94, rate: 0.093 },
  { min: 742958, max: 891542, base: 61972.37, rate: 0.103 },
  { min: 891542, max: 1485906, base: 77276.52, rate: 0.113 },
  { min: 1485906, max: 2000000, base: 144439.65, rate: 0.123 },
  { min: 2000000, max: Infinity, base: 207674.21, rate: 0.133 }, // includes 1% Mental Health Services
];

// ─── W-2 Benefit Defaults (LA tech averages, 2025) ───

export const FULL_TIME_HOURS = 2080;

export interface BenefitDefault {
  key: string;
  label: string;
  individual: number;
  family: number;
  /** If true, value is computed as `days × w2Rate × 8` instead of a fixed dollar amount */
  isDays?: boolean;
  /** If true, value is computed as `percent × gross` */
  isPercent?: boolean;
  percent?: number;
  individualDays?: number;
  familyDays?: number;
}

export const BENEFIT_DEFAULTS: BenefitDefault[] = [
  { key: "health", label: "Health Insurance", individual: 8400, family: 20000 },
  { key: "dental", label: "Dental Insurance", individual: 700, family: 1800 },
  { key: "vision", label: "Vision Insurance", individual: 150, family: 350 },
  {
    key: "401k",
    label: "401(k) Match",
    individual: 0,
    family: 0,
    isPercent: true,
    percent: 0.04,
  },
  {
    key: "pto",
    label: "PTO",
    individual: 0,
    family: 0,
    isDays: true,
    individualDays: 15,
    familyDays: 15,
  },
  {
    key: "holidays",
    label: "Paid Holidays",
    individual: 0,
    family: 0,
    isDays: true,
    individualDays: 10,
    familyDays: 10,
  },
  {
    key: "life",
    label: "Life / Disability Ins.",
    individual: 1000,
    family: 1000,
  },
  { key: "hsa", label: "HSA / FSA", individual: 750, family: 750 },
];

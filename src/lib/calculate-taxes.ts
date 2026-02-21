import type {
  FilingStatus,
  LaBizTaxClass,
  W2Result,
  ContractResult,
  BenefitItem,
} from "./types";
import {
  SS_WAGE_BASE,
  SS_RATE_EMPLOYEE,
  SS_RATE_SELF,
  MEDICARE_RATE_EMPLOYEE,
  MEDICARE_RATE_SELF,
  ADDITIONAL_MEDICARE_RATE,
  ADDITIONAL_MEDICARE_THRESHOLD_SINGLE,
  ADDITIONAL_MEDICARE_THRESHOLD_MFJ,
  SE_ADJUSTMENT,
  CA_SDI_RATE,
  LA_BIZ_TAX_MULTIMEDIA,
  LA_BIZ_TAX_PROFESSIONS,
  LA_BIZ_TAX_EXEMPTION_THRESHOLD,
  QBI_DEDUCTION_RATE,
  QBI_PHASE_OUT_START_SINGLE,
  QBI_PHASE_OUT_START_MFJ,
  QBI_PHASE_OUT_RANGE_SINGLE,
  QBI_PHASE_OUT_RANGE_MFJ,
  FEDERAL_STD_DED_SINGLE,
  FEDERAL_STD_DED_MFJ,
  CA_STD_DED_SINGLE,
  CA_STD_DED_MFJ,
  FEDERAL_BRACKETS_SINGLE,
  FEDERAL_BRACKETS_MFJ,
  CA_BRACKETS_SINGLE,
  CA_BRACKETS_MFJ,
} from "./tax-constants";

// ─── Federal Income Tax (progressive brackets) ───

export function calculateFederalTax(
  taxable: number,
  filing: FilingStatus,
): number {
  if (taxable <= 0) return 0;
  const brackets =
    filing === "mfj" ? FEDERAL_BRACKETS_MFJ : FEDERAL_BRACKETS_SINGLE;
  let tax = 0;
  let prev = 0;
  for (const b of brackets) {
    const segment = Math.min(taxable, b.limit) - prev;
    if (segment > 0) tax += segment * b.rate;
    if (taxable <= b.limit) break;
    prev = b.limit;
  }
  return tax;
}

// ─── California Income Tax (base + rate × excess) ───

export function calculateCATax(
  taxable: number,
  filing: FilingStatus,
): number {
  if (taxable <= 0) return 0;
  const brackets =
    filing === "mfj" ? CA_BRACKETS_MFJ : CA_BRACKETS_SINGLE;

  // Find the bracket the taxable income falls into
  for (const b of brackets) {
    if (taxable <= b.max) {
      return b.base + b.rate * (taxable - b.min);
    }
  }
  // Should never reach here (last bracket has max = Infinity)
  const last = brackets[brackets.length - 1];
  return last.base + last.rate * (taxable - last.min);
}

// ─── W-2 Calculation ───

export function calculateW2(
  rate: number,
  hours: number,
  filing: FilingStatus,
  benefits: BenefitItem[],
): W2Result {
  const gross = rate * hours;

  // FICA — employee share
  const ficaSS = Math.min(gross, SS_WAGE_BASE) * SS_RATE_EMPLOYEE;
  const ficaMedicare = gross * MEDICARE_RATE_EMPLOYEE;

  // Additional Medicare Tax (0.9% on wages above threshold)
  const addMedicareThreshold =
    filing === "mfj"
      ? ADDITIONAL_MEDICARE_THRESHOLD_MFJ
      : ADDITIONAL_MEDICARE_THRESHOLD_SINGLE;
  const ficaAdditionalMedicare =
    gross > addMedicareThreshold
      ? (gross - addMedicareThreshold) * ADDITIONAL_MEDICARE_RATE
      : 0;

  // California SDI (1.2%, no wage cap)
  const caSDI = gross * CA_SDI_RATE;

  // Income tax
  const fedStdDed =
    filing === "mfj" ? FEDERAL_STD_DED_MFJ : FEDERAL_STD_DED_SINGLE;
  const caStdDed =
    filing === "mfj" ? CA_STD_DED_MFJ : CA_STD_DED_SINGLE;

  const taxableFed = Math.max(0, gross - fedStdDed);
  const taxableCA = Math.max(0, gross - caStdDed);

  const fedTax = calculateFederalTax(taxableFed, filing);
  const caTax = calculateCATax(taxableCA, filing);

  // Benefits value
  const benefitsValue = benefits
    .filter((b) => b.enabled)
    .reduce((sum, b) => sum + b.amount, 0);

  const totalTax =
    fedTax + caTax + ficaSS + ficaMedicare + ficaAdditionalMedicare + caSDI;
  const net = gross - totalTax + benefitsValue;

  return {
    gross,
    fedTax,
    caTax,
    ficaSS,
    ficaMedicare,
    ficaAdditionalMedicare,
    caSDI,
    totalTax,
    benefitsValue,
    net,
    effectiveRate: gross > 0 ? (totalTax / gross) * 100 : 0,
    monthly: net / 12,
  };
}

// ─── 1099 / Contractor Calculation ───

export function calculate1099(
  rate: number,
  hours: number,
  filing: FilingStatus,
  healthInsuranceCost: number,
  bizExpenses: number,
  laBizTaxClass: LaBizTaxClass,
  isServiceTrade: boolean,
): ContractResult {
  const gross = rate * hours;

  // Self-employment tax — split into SS (capped) + Medicare (uncapped)
  const seBase = gross * SE_ADJUSTMENT;
  const seTaxSS = Math.min(seBase, SS_WAGE_BASE) * SS_RATE_SELF;
  const seTaxMedicare = seBase * MEDICARE_RATE_SELF;

  // Additional Medicare Tax on SE earnings above threshold
  const addMedicareThreshold =
    filing === "mfj"
      ? ADDITIONAL_MEDICARE_THRESHOLD_MFJ
      : ADDITIONAL_MEDICARE_THRESHOLD_SINGLE;
  const seTaxAdditionalMedicare =
    seBase > addMedicareThreshold
      ? (seBase - addMedicareThreshold) * ADDITIONAL_MEDICARE_RATE
      : 0;

  const seTaxTotal = seTaxSS + seTaxMedicare + seTaxAdditionalMedicare;
  const seDeductionHalf = seTaxTotal / 2;

  // Self-employed health insurance is an above-the-line deduction
  const healthInsuranceDeduction = healthInsuranceCost;

  // Business expenses reduce gross income
  const bizExpenseDeduction = bizExpenses;

  // AGI for federal
  const agi = gross - seDeductionHalf - healthInsuranceDeduction - bizExpenseDeduction;

  // QBI Deduction (Section 199A)
  // For specified service trades, phases out at higher incomes
  let qbiDeduction = 0;
  const qbi = Math.max(0, gross - bizExpenseDeduction - seDeductionHalf);
  if (qbi > 0) {
    const fullQBI = qbi * QBI_DEDUCTION_RATE;
    if (isServiceTrade) {
      const phaseOutStart =
        filing === "mfj"
          ? QBI_PHASE_OUT_START_MFJ
          : QBI_PHASE_OUT_START_SINGLE;
      const phaseOutRange =
        filing === "mfj"
          ? QBI_PHASE_OUT_RANGE_MFJ
          : QBI_PHASE_OUT_RANGE_SINGLE;

      if (agi <= phaseOutStart) {
        qbiDeduction = fullQBI;
      } else if (agi >= phaseOutStart + phaseOutRange) {
        qbiDeduction = 0; // fully phased out
      } else {
        // Linear phase-out
        const reduction = (agi - phaseOutStart) / phaseOutRange;
        qbiDeduction = fullQBI * (1 - reduction);
      }
    } else {
      qbiDeduction = fullQBI;
    }
  }

  // Federal taxable income
  const fedStdDed =
    filing === "mfj" ? FEDERAL_STD_DED_MFJ : FEDERAL_STD_DED_SINGLE;
  const taxableFed = Math.max(0, agi - fedStdDed - qbiDeduction);
  const fedTax = calculateFederalTax(taxableFed, filing);

  // CA taxable income (CA does not allow QBI deduction)
  const caStdDed =
    filing === "mfj" ? CA_STD_DED_MFJ : CA_STD_DED_SINGLE;
  const caAgi = gross - seDeductionHalf - healthInsuranceDeduction - bizExpenseDeduction;
  const taxableCA = Math.max(0, caAgi - caStdDed);
  const caTax = calculateCATax(taxableCA, filing);

  // LA City Business Tax
  let laBizTax = 0;
  if (laBizTaxClass !== "exempt" && gross > LA_BIZ_TAX_EXEMPTION_THRESHOLD) {
    const taxRate =
      laBizTaxClass === "multimedia"
        ? LA_BIZ_TAX_MULTIMEDIA
        : LA_BIZ_TAX_PROFESSIONS;
    laBizTax = gross * taxRate;
  }

  const totalTax = fedTax + caTax + seTaxTotal + laBizTax;
  const net =
    gross - totalTax - healthInsuranceCost - bizExpenses;

  return {
    gross,
    fedTax,
    caTax,
    seTaxSS,
    seTaxMedicare,
    seTaxAdditionalMedicare,
    seTaxTotal,
    seDeductionHalf,
    healthInsuranceDeduction,
    bizExpenseDeduction,
    qbiDeduction,
    laBizTax,
    totalTax,
    net,
    effectiveRate: gross > 0 ? ((totalTax + healthInsuranceCost + bizExpenses) / gross) * 100 : 0,
    monthly: net / 12,
  };
}

// ─── Break-Even Rate Calculator ───

export function calculateBreakeven(
  targetNet: number,
  hours: number,
  filing: FilingStatus,
  healthInsuranceCost: number,
  bizExpenses: number,
  laBizTaxClass: LaBizTaxClass,
  isServiceTrade: boolean,
): number {
  let low = 0;
  let high = 500;

  for (let i = 0; i < 80; i++) {
    const mid = (low + high) / 2;
    const result = calculate1099(
      mid,
      hours,
      filing,
      healthInsuranceCost,
      bizExpenses,
      laBizTaxClass,
      isServiceTrade,
    );
    if (result.net >= targetNet) {
      high = mid;
    } else {
      low = mid;
    }
  }

  return (low + high) / 2;
}

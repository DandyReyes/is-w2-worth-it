export type FilingStatus = "single" | "mfj";
export type CoverageType = "individual" | "family";
export type BenefitMode = "off" | "averages" | "custom";
export type LaBizTaxClass = "multimedia" | "professions" | "exempt";

export interface BenefitItem {
  key: string;
  label: string;
  enabled: boolean;
  /** Dollar amount — for PTO/holidays this is auto-computed from days × daily rate */
  amount: number;
  /** Only present for PTO/holidays — the number of days (amount is derived) */
  days?: number;
}

export interface BenefitConfig {
  mode: BenefitMode;
  coverageType: CoverageType;
  items: BenefitItem[];
}

export interface W2Result {
  gross: number;
  fedTax: number;
  caTax: number;
  ficaSS: number;
  ficaMedicare: number;
  ficaAdditionalMedicare: number;
  caSDI: number;
  totalTax: number;
  benefitsValue: number;
  net: number;
  effectiveRate: number;
  monthly: number;
}

export interface ContractResult {
  gross: number;
  fedTax: number;
  caTax: number;
  seTaxSS: number;
  seTaxMedicare: number;
  seTaxAdditionalMedicare: number;
  seTaxTotal: number;
  seDeductionHalf: number;
  healthInsuranceDeduction: number;
  bizExpenseDeduction: number;
  qbiDeduction: number;
  laBizTax: number;
  totalTax: number;
  net: number;
  effectiveRate: number;
  monthly: number;
}

export interface ComparisonRow {
  label: string;
  w2Value: number;
  contractValue: number;
  isHighlightRow?: boolean;
  /** true = this row represents a deduction / tax (shown in red) */
  isDeduction?: boolean;
  /** true = this row represents a benefit / addition (shown in green) */
  isAddition?: boolean;
  /** Format as percentage instead of currency */
  isPercent?: boolean;
}

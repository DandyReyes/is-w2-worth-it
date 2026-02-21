import { useMemo, useState, useCallback } from "react";
import type {
  FilingStatus,
  CoverageType,
  BenefitMode,
  BenefitItem,
  LaBizTaxClass,
  ComparisonRow,
} from "../lib/types";
import {
  BENEFIT_DEFAULTS,
  FULL_TIME_HOURS,
} from "../lib/tax-constants";
import {
  calculateW2,
  calculate1099,
  calculateBreakeven,
} from "../lib/calculate-taxes";

function buildBenefitItems(
  coverageType: CoverageType,
  w2Rate: number,
  hours: number,
): BenefitItem[] {
  const scale = hours / FULL_TIME_HOURS;
  return BENEFIT_DEFAULTS.map((def) => {
    let amount: number;
    let days: number | undefined;

    if (def.isDays) {
      days =
        coverageType === "family"
          ? (def.familyDays ?? 0)
          : (def.individualDays ?? 0);
      amount = days * w2Rate * 8 * scale;
    } else if (def.isPercent && def.percent) {
      amount = def.percent * w2Rate * hours;
    } else {
      amount =
        (coverageType === "family" ? def.family : def.individual) * scale;
    }

    return {
      key: def.key,
      label: def.label,
      enabled: true,
      amount: Math.round(amount),
      days,
    };
  });
}

export function useTaxCalculator() {
  // ─── Inputs ───
  const [filingStatus, setFilingStatus] = useState<FilingStatus>("single");
  const [w2Rate, setW2Rate] = useState(67);
  const [contractRate, setContractRate] = useState(75);
  const [hours, setHours] = useState(2080);

  // Benefits
  const [benefitMode, setBenefitMode] = useState<BenefitMode>("averages");
  const [coverageType, setCoverageType] = useState<CoverageType>("individual");
  const [customBenefits, setCustomBenefits] = useState<BenefitItem[]>(() =>
    buildBenefitItems("individual", 67, 2080),
  );

  // 1099-specific
  const [healthInsuranceCost, setHealthInsuranceCost] = useState(0);
  const [bizExpenses, setBizExpenses] = useState(0);
  const [laBizTaxClass, setLaBizTaxClass] =
    useState<LaBizTaxClass>("multimedia");
  const [isServiceTrade, setIsServiceTrade] = useState(true);

  // ─── Derived benefits ───
  const activeBenefits = useMemo<BenefitItem[]>(() => {
    if (benefitMode === "off") return [];
    if (benefitMode === "averages") {
      return buildBenefitItems(coverageType, w2Rate, hours);
    }
    // custom — recalculate day-based and percent-based items with current rate
    const scale = hours / FULL_TIME_HOURS;
    return customBenefits.map((item) => {
      const def = BENEFIT_DEFAULTS.find((d) => d.key === item.key);
      if (!def) return item;
      if (def.isDays && item.days !== undefined) {
        return { ...item, amount: Math.round(item.days * w2Rate * 8 * scale) };
      }
      if (def.isPercent && def.percent) {
        return {
          ...item,
          amount: Math.round(def.percent * w2Rate * hours),
        };
      }
      return item;
    });
  }, [benefitMode, coverageType, customBenefits, w2Rate, hours]);

  // ─── Calculations ───
  const w2Result = useMemo(
    () => calculateW2(w2Rate, hours, filingStatus, activeBenefits),
    [w2Rate, hours, filingStatus, activeBenefits],
  );

  const contractResult = useMemo(
    () =>
      calculate1099(
        contractRate,
        hours,
        filingStatus,
        healthInsuranceCost,
        bizExpenses,
        laBizTaxClass,
        isServiceTrade,
      ),
    [
      contractRate,
      hours,
      filingStatus,
      healthInsuranceCost,
      bizExpenses,
      laBizTaxClass,
      isServiceTrade,
    ],
  );

  const breakEvenRate = useMemo(
    () =>
      calculateBreakeven(
        w2Result.net,
        hours,
        filingStatus,
        healthInsuranceCost,
        bizExpenses,
        laBizTaxClass,
        isServiceTrade,
      ),
    [
      w2Result.net,
      hours,
      filingStatus,
      healthInsuranceCost,
      bizExpenses,
      laBizTaxClass,
      isServiceTrade,
    ],
  );

  // ─── Comparison rows ───
  const comparisonRows = useMemo<ComparisonRow[]>(() => {
    const w = w2Result;
    const c = contractResult;
    return [
      {
        label: "Gross Annual",
        w2Value: w.gross,
        contractValue: c.gross,
      },
      {
        label: "Federal Income Tax",
        w2Value: -w.fedTax,
        contractValue: -c.fedTax,
        isDeduction: true,
      },
      {
        label: "CA State Income Tax",
        w2Value: -w.caTax,
        contractValue: -c.caTax,
        isDeduction: true,
      },
      {
        label: "FICA / SE Tax",
        w2Value: -(w.ficaSS + w.ficaMedicare + w.ficaAdditionalMedicare),
        contractValue: -c.seTaxTotal,
        isDeduction: true,
      },
      {
        label: "CA SDI",
        w2Value: -w.caSDI,
        contractValue: 0,
        isDeduction: true,
      },
      {
        label: "LA City Business Tax",
        w2Value: 0,
        contractValue: -c.laBizTax,
        isDeduction: true,
      },
      {
        label: "Health Ins. Cost",
        w2Value: 0,
        contractValue: -c.healthInsuranceDeduction,
        isDeduction: true,
      },
      {
        label: "Business Expenses",
        w2Value: 0,
        contractValue: -c.bizExpenseDeduction,
        isDeduction: true,
      },
      {
        label: "QBI Deduction (tax savings)",
        w2Value: 0,
        contractValue: c.qbiDeduction > 0 ? c.qbiDeduction : 0,
        isAddition: true,
      },
      {
        label: "W-2 Benefits Value",
        w2Value: w.benefitsValue,
        contractValue: 0,
        isAddition: true,
      },
      {
        label: "Net Take-Home",
        w2Value: w.net,
        contractValue: c.net,
        isHighlightRow: true,
      },
      {
        label: "Effective Tax Rate",
        w2Value: w.effectiveRate,
        contractValue: c.effectiveRate,
        isPercent: true,
      },
      {
        label: "Monthly Take-Home",
        w2Value: w.monthly,
        contractValue: c.monthly,
      },
    ];
  }, [w2Result, contractResult]);

  // ─── Benefit updaters ───
  const updateCustomBenefit = useCallback(
    (key: string, updates: Partial<BenefitItem>) => {
      setCustomBenefits((prev) =>
        prev.map((item) =>
          item.key === key ? { ...item, ...updates } : item,
        ),
      );
    },
    [],
  );

  const resetCustomBenefits = useCallback(() => {
    setCustomBenefits(buildBenefitItems(coverageType, w2Rate, hours));
  }, [coverageType, w2Rate, hours]);

  return {
    // Inputs
    filingStatus,
    setFilingStatus,
    w2Rate,
    setW2Rate,
    contractRate,
    setContractRate,
    hours,
    setHours,

    // Benefits
    benefitMode,
    setBenefitMode,
    coverageType,
    setCoverageType,
    activeBenefits,
    customBenefits,
    updateCustomBenefit,
    resetCustomBenefits,

    // 1099-specific
    healthInsuranceCost,
    setHealthInsuranceCost,
    bizExpenses,
    setBizExpenses,
    laBizTaxClass,
    setLaBizTaxClass,
    isServiceTrade,
    setIsServiceTrade,

    // Results
    w2Result,
    contractResult,
    breakEvenRate,
    comparisonRows,
  } as const;
}

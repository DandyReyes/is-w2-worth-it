import { useMemo, useState } from "react";

const SS_WAGE_BASE_2025 = 176100;
const SS_RATE = 0.062;
const MEDICARE_RATE = 0.0145;
const SE_RATE = 0.153;
const SE_ADJUSTMENT = 0.9235;

// 2025 Standard Deductions
const FEDERAL_STD_DED_SINGLE = 15750;
const FEDERAL_STD_DED_MFJ = 31500;
const CA_STD_DED_SINGLE = 5706;
const CA_STD_DED_MFJ = 11412;

// 2025 Federal Brackets
const FEDERAL_BRACKETS_SINGLE = [
  { limit: 11925, rate: 0.1 },
  { limit: 48475, rate: 0.12 },
  { limit: 103350, rate: 0.22 },
  { limit: 197300, rate: 0.24 },
  { limit: 250525, rate: 0.32 },
  { limit: 626350, rate: 0.35 },
  { limit: Infinity, rate: 0.37 },
];

const FEDERAL_BRACKETS_MFJ = [
  { limit: 23850, rate: 0.1 },
  { limit: 96950, rate: 0.12 },
  { limit: 206700, rate: 0.22 },
  { limit: 394600, rate: 0.24 },
  { limit: 501050, rate: 0.32 },
  { limit: 751600, rate: 0.35 },
  { limit: Infinity, rate: 0.37 },
];

// 2025 CA Tax Calculation (progressive with base tax)
function calculateCATax(taxable: number, isMFJ: boolean): number {
  if (taxable <= 0) return 0;

  const brackets = isMFJ
    ? [
        { thresh: 22158, base: 0, rate: 0.01 },
        { thresh: 52528, base: 221.58, rate: 0.02 },
        { thresh: 82904, base: 828.98, rate: 0.04 },
        { thresh: 115084, base: 2044.02, rate: 0.06 },
        { thresh: 145448, base: 3974.82, rate: 0.08 },
        { thresh: 742958, base: 6403.94, rate: 0.093 },
        { thresh: 891542, base: 61972.37, rate: 0.103 },
        { thresh: 1485906, base: 77276.52, rate: 0.113 },
        { thresh: Infinity, base: 144439.65, rate: 0.123 },
      ]
    : [
        { thresh: 11079, base: 0, rate: 0.01 },
        { thresh: 26264, base: 110.79, rate: 0.02 },
        { thresh: 41452, base: 414.49, rate: 0.04 },
        { thresh: 57542, base: 1022.01, rate: 0.06 },
        { thresh: 72724, base: 1987.41, rate: 0.08 },
        { thresh: 371479, base: 3201.97, rate: 0.093 },
        { thresh: 445771, base: 30986.26, rate: 0.103 },
        { thresh: 742953, base: 38638.27, rate: 0.113 },
        { thresh: Infinity, base: 0, rate: 0.123 }, // simplified
      ];

  let tax = 0;
  let prev = 0;
  for (const b of brackets) {
    if (taxable <= prev) break;
    const segment = Math.min(taxable - prev, b.thresh - prev);
    if (segment > 0) tax += segment * b.rate;
    prev = b.thresh;
    if (taxable <= b.thresh) {
      tax += b.base;
      break;
    }
  }
  return tax;
}

function calculateFederalTax(taxable: number, isMFJ: boolean): number {
  if (taxable <= 0) return 0;
  const brackets = isMFJ ? FEDERAL_BRACKETS_MFJ : FEDERAL_BRACKETS_SINGLE;
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

// Typical W-2 benefits (adjust if family coverage on MFJ is higher)
const BENEFITS_VALUE = 7500 + 3500 + 3200; // health + 401k match + PTO equiv
const FULL_TIME_HOURS = 2080;

export default function LATaxCalculator() {
  const [filingStatus, setFilingStatus] = useState<"single" | "mfj">("single");
  const [w2Rate, setW2Rate] = useState(67);
  const [contractRate, setContractRate] = useState(75);
  const [hours, setHours] = useState(2080);
  const [includeBenefits, setIncludeBenefits] = useState(true);

  const isMFJ = filingStatus === "mfj";

  const fedStdDed = isMFJ ? FEDERAL_STD_DED_MFJ : FEDERAL_STD_DED_SINGLE;
  const caStdDed = isMFJ ? CA_STD_DED_MFJ : CA_STD_DED_SINGLE;

  const w2Calc = useMemo(() => {
    const gross = w2Rate * hours;
    const ssTax = Math.min(gross, SS_WAGE_BASE_2025) * SS_RATE;
    const medicareTax = gross * MEDICARE_RATE;
    const payrollTax = ssTax + medicareTax;

    const agi = gross;
    const taxableFed = Math.max(0, agi - fedStdDed);
    const taxableCA = Math.max(0, agi - caStdDed);

    const fedTax = calculateFederalTax(taxableFed, isMFJ);
    const caTax = calculateCATax(taxableCA, isMFJ);

    let net = gross - fedTax - caTax - payrollTax;

    let benefitsAdded = 0;
    if (includeBenefits) {
      const scale = hours / FULL_TIME_HOURS;
      benefitsAdded = BENEFITS_VALUE * scale;
      net += benefitsAdded;
    }

    return { gross, fedTax, caTax, payrollTax, benefitsAdded, net };
  }, [w2Rate, hours, includeBenefits, filingStatus]);

  const contractCalc = useMemo(() => {
    const gross = contractRate * hours;
    const seBase = gross * SE_ADJUSTMENT;
    const seTaxFull = seBase * SE_RATE;
    const seDeductHalf = seTaxFull / 2;

    const agi = gross - seDeductHalf;
    const taxableFed = Math.max(0, agi - fedStdDed);
    const taxableCA = Math.max(0, agi - caStdDed);

    const fedTax = calculateFederalTax(taxableFed, isMFJ);
    const caTax = calculateCATax(taxableCA, isMFJ);

    const net = gross - fedTax - caTax - seTaxFull;

    return { gross, fedTax, caTax, seTaxFull, net };
  }, [contractRate, hours, filingStatus]);

  const breakEvenRate = useMemo(() => {
    const targetNet = w2Calc.net;
    let low = 0;
    let high = 500;
    for (let i = 0; i < 60; i++) {
      const mid = (low + high) / 2;
      const testGross = mid * hours;
      const testSeBase = testGross * SE_ADJUSTMENT;
      const testSe = testSeBase * SE_RATE;
      const testAgi = testGross - testSe / 2;
      const testFed = calculateFederalTax(
        Math.max(0, testAgi - fedStdDed),
        isMFJ,
      );
      const testCa = calculateCATax(Math.max(0, testAgi - caStdDed), isMFJ);
      const testNet = testGross - testFed - testCa - testSe;
      if (testNet >= targetNet) high = mid;
      else low = mid;
    }
    return (low + high) / 2;
  }, [w2Calc.net, hours, filingStatus]);

  const format = (num: number) =>
    num.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-8 py-6 text-white">
          <h1 className="text-3xl font-bold">
            LA W-2 vs 1099 Calculator (2025 Taxes)
          </h1>
          <p className="mt-2 opacity-90">
            Los Angeles, CA • Updated for 2025 rules
          </p>
        </div>

        <div className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filing Status
              </label>
              <select
                value={filingStatus}
                onChange={(e) =>
                  setFilingStatus(e.target.value as "single" | "mfj")
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              >
                <option value="single">Single</option>
                <option value="mfj">Married Filing Jointly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Annual Hours (e.g. 2080)
              </label>
              <input
                type="number"
                value={hours}
                onChange={(e) => setHours(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                W-2 Hourly Rate ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={w2Rate}
                onChange={(e) => setW2Rate(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                1099 Hourly Rate ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={contractRate}
                onChange={(e) => setContractRate(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={includeBenefits}
              onChange={(e) => setIncludeBenefits(e.target.checked)}
              className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label className="ml-3 text-sm font-medium text-gray-700">
              Include typical W-2 benefits (~${format(BENEFITS_VALUE)} full-time
              equiv: health, 401(k) match, PTO)
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                W-2 Results ({filingStatus.toUpperCase()})
              </h2>
              <div className="space-y-3 text-sm">
                <p>
                  <span className="font-medium">Gross Annual:</span> $
                  {format(w2Calc.gross)}
                </p>
                <p>
                  <span className="font-medium">Federal Income Tax:</span> $
                  {format(w2Calc.fedTax)}
                </p>
                <p>
                  <span className="font-medium">CA State Income Tax:</span> $
                  {format(w2Calc.caTax)}
                </p>
                <p>
                  <span className="font-medium">FICA (your share):</span> $
                  {format(w2Calc.payrollTax)}
                </p>
                {includeBenefits && w2Calc.benefitsAdded > 0 && (
                  <p>
                    <span className="font-medium">Benefits value:</span> +$
                    {format(w2Calc.benefitsAdded)}
                  </p>
                )}
                <p className="pt-4 text-lg font-bold text-indigo-700">
                  Effective Net: ${format(Math.round(w2Calc.net))}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                1099 Results
              </h2>
              <div className="space-y-3 text-sm">
                <p>
                  <span className="font-medium">Gross Annual:</span> $
                  {format(contractCalc.gross)}
                </p>
                <p>
                  <span className="font-medium">Federal Income Tax:</span> $
                  {format(contractCalc.fedTax)}
                </p>
                <p>
                  <span className="font-medium">CA State Income Tax:</span> $
                  {format(contractCalc.caTax)}
                </p>
                <p>
                  <span className="font-medium">Self-Employment Tax:</span> $
                  {format(contractCalc.seTaxFull)}
                </p>
                <p className="pt-4 text-lg font-bold text-indigo-700">
                  Net: ${format(Math.round(contractCalc.net))}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-indigo-50 p-6 rounded-xl text-center border border-indigo-100">
            <h3 className="text-xl font-semibold text-indigo-800 mb-2">
              Break-Even 1099 Rate
            </h3>
            <p className="text-3xl font-bold text-indigo-700">
              ${breakEvenRate.toFixed(2)} /hr
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Required 1099 rate to match W-2 effective net of ~$
              {format(Math.round(w2Calc.net))} (
              {filingStatus === "mfj" ? "Married Filing Jointly" : "Single"})
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useTaxCalculator } from "../hooks/useTaxCalculator";
import ThemeToggle from "./ThemeToggle";
import InputPanel from "./InputPanel";
import BenefitsPanel from "./BenefitsPanel";
import HeroMetrics from "./HeroMetrics";
import ComparisonTable from "./ComparisonTable";
import BreakevenCard from "./BreakevenCard";

export default function Calculator() {
  const calc = useTaxCalculator();

  const filingLabel =
    calc.filingStatus === "mfj" ? "Married Filing Jointly" : "Single";

  return (
    <div className="min-h-screen dark:bg-base-950 bg-base-50 transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Header */}
        <header className="flex items-start justify-between mb-8 sm:mb-12">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold dark:text-white text-base-900">
              W-2 vs 1099
            </h1>
            <p className="mt-1 text-sm dark:text-base-400 text-base-500">
              Los Angeles, CA · 2025 Tax Year
            </p>
          </div>
          <ThemeToggle />
        </header>

        {/* Input Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8 sm:mb-10">
          {/* Main Inputs — takes 3/5 on lg */}
          <div
            className="lg:col-span-3 dark:bg-white/5 bg-white backdrop-blur-xl
            dark:border-white/10 border-base-200 border
            rounded-2xl p-5 sm:p-6 shadow-sm dark:shadow-none"
          >
            <InputPanel
              filingStatus={calc.filingStatus}
              setFilingStatus={calc.setFilingStatus}
              w2Rate={calc.w2Rate}
              setW2Rate={calc.setW2Rate}
              contractRate={calc.contractRate}
              setContractRate={calc.setContractRate}
              hours={calc.hours}
              setHours={calc.setHours}
              healthInsuranceCost={calc.healthInsuranceCost}
              setHealthInsuranceCost={calc.setHealthInsuranceCost}
              bizExpenses={calc.bizExpenses}
              setBizExpenses={calc.setBizExpenses}
              laBizTaxClass={calc.laBizTaxClass}
              setLaBizTaxClass={calc.setLaBizTaxClass}
              isServiceTrade={calc.isServiceTrade}
              setIsServiceTrade={calc.setIsServiceTrade}
            />
          </div>

          {/* Benefits Panel — takes 2/5 on lg */}
          <div
            className="lg:col-span-2 dark:bg-white/5 bg-white backdrop-blur-xl
            dark:border-white/10 border-base-200 border
            rounded-2xl p-5 sm:p-6 shadow-sm dark:shadow-none"
          >
            <BenefitsPanel
              benefitMode={calc.benefitMode}
              setBenefitMode={calc.setBenefitMode}
              coverageType={calc.coverageType}
              setCoverageType={calc.setCoverageType}
              activeBenefits={calc.activeBenefits}
              customBenefits={calc.customBenefits}
              updateCustomBenefit={calc.updateCustomBenefit}
              resetCustomBenefits={calc.resetCustomBenefits}
              w2Rate={calc.w2Rate}
            />
          </div>
        </div>

        {/* Hero Metrics */}
        <div className="mb-8 sm:mb-10">
          <HeroMetrics
            w2Result={calc.w2Result}
            contractResult={calc.contractResult}
          />
        </div>

        {/* Comparison Table */}
        <div className="mb-8 sm:mb-10">
          <h2 className="text-lg font-bold dark:text-white text-base-900 mb-4">
            Side-by-Side Breakdown
          </h2>
          <ComparisonTable rows={calc.comparisonRows} />
        </div>

        {/* Break-Even Card */}
        <div className="mb-8 sm:mb-10">
          <BreakevenCard
            breakEvenRate={calc.breakEvenRate}
            w2Net={calc.w2Result.net}
            filingLabel={filingLabel}
          />
        </div>
      </div>
    </div>
  );
}

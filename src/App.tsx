import { useState } from 'react';
import type { Inputs } from './types';
import { InputsPanel } from './components/InputsPanel';
import { NestEggWidget } from './components/NestEggWidget';
import { RentVsMortgageWidget } from './components/RentVsMortgageWidget';
import { SnapshotPanel } from './components/SnapshotPanel';

const DEFAULT_INPUTS: Inputs = {
  currentMonthlyRent: 6000,
  annualRentIncrease: 0.03,
  purchasePrice: 800000,
  downPayment: 160000,
  mortgageRate: 0.065,
  mortgageTerm: 30,
  investmentReturnRate: 0.07,
  projectionYears: 20,
  homeAppreciationRate: 0.03,
  monthlyBuyCosts: 2000,
  buyCostIncreaseRate: 0.03,
  otherSavings: 0,
  renovationCost: 0,
};

export default function App() {
  const [inputs, setInputs] = useState<Inputs>(DEFAULT_INPUTS);
  const [selectedYear, setSelectedYear] = useState(DEFAULT_INPUTS.projectionYears);

  const clampedYear = Math.min(selectedYear, inputs.projectionYears);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-900">Rent vs Buy — Dashboard</h1>
      </header>

      <div className="flex flex-col md:flex-row gap-4 p-4 max-w-7xl mx-auto">
        <aside className="w-full md:w-64 shrink-0">
          <InputsPanel inputs={inputs} onChange={setInputs} />
        </aside>

        <main className="flex-1 flex flex-col gap-4">
          <NestEggWidget inputs={inputs} selectedYear={clampedYear} />
          <RentVsMortgageWidget inputs={inputs} selectedYear={clampedYear} />
          <SnapshotPanel
            inputs={inputs}
            selectedYear={clampedYear}
            onYearChange={setSelectedYear}
          />
        </main>
      </div>
    </div>
  );
}

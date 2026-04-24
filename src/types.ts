export interface Inputs {
  currentMonthlyRent: number;
  annualRentIncrease: number; // decimal, e.g. 0.03
  purchasePrice: number;
  downPayment: number;
  mortgageRate: number; // decimal, e.g. 0.065
  mortgageTerm: number; // years
  investmentReturnRate: number; // decimal
  projectionYears: number;
  homeAppreciationRate: number; // decimal
  monthlyBuyCosts: number; // HOA, property tax, maintenance, etc.
  buyCostIncreaseRate: number; // decimal, annual escalation of buy costs
  otherSavings: number; // additional cash that compounds on both paths
  renovationCost: number; // one-time lump sum, buy path only (reduces investable savings)
}

export interface YearDataPoint {
  year: number;
  value: number;
}

export interface NestEggDataPoint {
  year: number;
  rentPath: number;
  buyPath: number;
}

export interface RentVsMortgageDataPoint {
  year: number;
  monthlyRent: number;
  monthlyMortgage: number;
  monthlyMortgageWithOverhead: number;
}

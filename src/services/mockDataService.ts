
import { MarketTrend, NeighborhoodData, PropertyAnalysis, PropertyData } from "@/types";

const calculatePropertyAnalysis = (property: PropertyData): PropertyAnalysis => {
  // Calculate total annual expenses
  const totalAnnualExpenses = 
    property.annualExpenses.propertyTax +
    property.annualExpenses.insurance +
    property.annualExpenses.maintenance +
    property.annualExpenses.propertyManagement +
    property.annualExpenses.vacancy +
    property.annualExpenses.other;

  // Calculate monthly mortgage payment (P&I)
  const loanAmount = property.purchasePrice - property.downPayment;
  const monthlyInterestRate = property.interestRate / 100 / 12;
  const numberOfPayments = property.loanTerm * 12;
  
  const monthlyMortgagePayment = 
    loanAmount * 
    (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) /
    (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);

  // Calculate annual rental income
  const annualRentalIncome = property.monthlyRent * 12;

  // Calculate Net Operating Income (NOI)
  const netOperatingIncome = annualRentalIncome - totalAnnualExpenses;

  // Calculate Cap Rate
  const capRate = (netOperatingIncome / property.purchasePrice) * 100;

  // Calculate annual cash flow
  const annualMortgagePayment = monthlyMortgagePayment * 12;
  const annualCashFlow = netOperatingIncome - annualMortgagePayment;
  const monthlyCashFlow = annualCashFlow / 12;

  // Calculate Cash on Cash Return
  const initialInvestment = property.downPayment + (property.purchasePrice * 0.03); // Adding 3% for closing costs
  const cashOnCashReturn = (annualCashFlow / initialInvestment) * 100;

  // Calculate Rent to Price Ratio
  const rentToPrice = ((property.monthlyRent * 12) / property.purchasePrice) * 100;

  // Calculate Return on Investment (ROI)
  const estimatedAnnualAppreciation = property.purchasePrice * 0.03; // Assuming 3% annual appreciation
  const totalAnnualReturn = annualCashFlow + estimatedAnnualAppreciation;
  const roi = (totalAnnualReturn / initialInvestment) * 100;

  // Calculate Break-even Point (months)
  const breakEvenPoint = initialInvestment / (monthlyCashFlow > 0 ? monthlyCashFlow : 1);

  return {
    propertyId: property.id,
    capRate: parseFloat(capRate.toFixed(2)),
    cashOnCashReturn: parseFloat(cashOnCashReturn.toFixed(2)),
    cashFlow: {
      monthly: parseFloat(monthlyCashFlow.toFixed(2)),
      annual: parseFloat(annualCashFlow.toFixed(2))
    },
    rentToPrice: parseFloat(rentToPrice.toFixed(2)),
    netOperatingIncome: parseFloat(netOperatingIncome.toFixed(2)),
    returnOnInvestment: parseFloat(roi.toFixed(2)),
    breakEvenPoint: parseFloat(breakEvenPoint.toFixed(1))
  };
};

const getMarketTrends = (city: string, state: string): MarketTrend => {
  // Simulate market trends based on location
  const seedValue = city.charCodeAt(0) + state.charCodeAt(0);
  const random = (min: number, max: number) => {
    const seed = (seedValue * 9301 + 49297) % 233280;
    const rnd = seed / 233280;
    return min + rnd * (max - min);
  };

  const priceChange = parseFloat(random(-5, 15).toFixed(1));
  const rentChange = parseFloat(random(-2, 10).toFixed(1));
  const medianPrice = Math.round(random(150000, 800000) / 1000) * 1000;
  const medianRent = Math.round(random(800, 3000) / 10) * 10;

  return {
    city,
    state,
    medianHomePrice: medianPrice,
    priceChange1Year: priceChange,
    medianRent,
    rentChange1Year: rentChange,
    daysOnMarket: Math.round(random(20, 90)),
    inventoryChange: parseFloat(random(-10, 20).toFixed(1))
  };
};

const getNeighborhoodData = (zipCode: string, city: string, state: string): NeighborhoodData => {
  // Simulate neighborhood data based on location
  const seedValue = zipCode.charCodeAt(0) + zipCode.charCodeAt(zipCode.length - 1);
  const random = (min: number, max: number) => {
    const seed = (seedValue * 9301 + 49297) % 233280;
    const rnd = seed / 233280;
    return min + rnd * (max - min);
  };

  return {
    zipCode,
    city,
    state,
    schoolRating: parseFloat(random(1, 10).toFixed(1)),
    crimeRate: ["Low", "Moderate", "High"][Math.floor(random(0, 3))],
    walkabilityScore: Math.round(random(0, 100)),
    transitScore: Math.round(random(0, 100)),
    population: Math.round(random(5000, 100000)),
    medianIncome: Math.round(random(30000, 120000) / 1000) * 1000,
    employmentRate: parseFloat(random(85, 98).toFixed(1))
  };
};

// Export the mock data service functions
export const mockDataService = {
  calculatePropertyAnalysis,
  getMarketTrends,
  getNeighborhoodData
};

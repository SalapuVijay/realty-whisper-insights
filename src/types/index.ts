
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

export interface PropertyData {
  id: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  purchasePrice: number;
  monthlyRent: number;
  annualExpenses: {
    propertyTax: number;
    insurance: number;
    maintenance: number;
    propertyManagement: number;
    vacancy: number;
    other: number;
  };
  downPayment: number;
  interestRate: number;
  loanTerm: number;
}

export interface PropertyAnalysis {
  propertyId: string;
  capRate: number;
  cashOnCashReturn: number;
  cashFlow: {
    monthly: number;
    annual: number;
  };
  rentToPrice: number;
  netOperatingIncome: number;
  returnOnInvestment: number;
  breakEvenPoint: number;
}

export interface MarketTrend {
  city: string;
  state: string;
  medianHomePrice: number;
  priceChange1Year: number;
  medianRent: number;
  rentChange1Year: number;
  daysOnMarket: number;
  inventoryChange: number;
}

export interface NeighborhoodData {
  zipCode: string;
  city: string;
  state: string;
  schoolRating: number;
  crimeRate: string;
  walkabilityScore: number;
  transitScore: number;
  population: number;
  medianIncome: number;
  employmentRate: number;
}

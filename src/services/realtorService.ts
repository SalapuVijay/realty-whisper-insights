
import { PropertyData, MarketTrend, NeighborhoodData } from "@/types";
import { getApiKey } from "@/utils/apiUtils";

export const searchProperties = async (location: string, minPrice?: number, maxPrice?: number, bedrooms?: number): Promise<PropertyData[]> => {
  const apiKey = getApiKey("realtor");
  if (!apiKey) {
    throw new Error("Realtor.com API key is required");
  }

  // In a real application, this would be a fetch call to the Realtor.com API
  console.log(`Searching properties in ${location} with Realtor.com API key: ${apiKey}`);
  
  // For now, return mock data
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        mockProperty1,
        mockProperty2,
        mockProperty3
      ]);
    }, 1000);
  });
};

export const getPropertyDetails = async (propertyId: string): Promise<PropertyData | null> => {
  const apiKey = getApiKey("realtor");
  if (!apiKey) {
    throw new Error("Realtor.com API key is required");
  }

  console.log(`Getting details for property ${propertyId} with Realtor.com API key: ${apiKey}`);
  
  // Return mock data
  return new Promise((resolve) => {
    setTimeout(() => {
      if (propertyId === "property1") {
        resolve(mockProperty1);
      } else if (propertyId === "property2") {
        resolve(mockProperty2);
      } else if (propertyId === "property3") {
        resolve(mockProperty3);
      } else {
        resolve(null);
      }
    }, 800);
  });
};

export const getMarketTrends = async (city: string, state: string): Promise<MarketTrend | null> => {
  const apiKey = getApiKey("realtor");
  if (!apiKey) {
    throw new Error("Realtor.com API key is required");
  }

  console.log(`Getting market trends for ${city}, ${state} with Realtor.com API key: ${apiKey}`);
  
  // Return mock data
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockMarketTrend);
    }, 1200);
  });
};

export const getNeighborhoodData = async (zipCode: string): Promise<NeighborhoodData | null> => {
  const apiKey = getApiKey("realtor");
  if (!apiKey) {
    throw new Error("Realtor.com API key is required");
  }

  console.log(`Getting neighborhood data for zip code ${zipCode} with Realtor.com API key: ${apiKey}`);
  
  // Return mock data
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockNeighborhoodData);
    }, 1000);
  });
};

// Mock data
const mockProperty1: PropertyData = {
  id: "property1",
  address: "123 Main St",
  city: "San Francisco",
  state: "CA",
  zipCode: "94105",
  purchasePrice: 1200000,
  monthlyRent: 4500,
  annualExpenses: {
    propertyTax: 12000,
    insurance: 3600,
    maintenance: 6000,
    propertyManagement: 5400,
    vacancy: 2700,
    other: 1200
  },
  downPayment: 240000,
  interestRate: 4.5,
  loanTerm: 30
};

const mockProperty2: PropertyData = {
  id: "property2",
  address: "456 Market St",
  city: "San Francisco",
  state: "CA",
  zipCode: "94103",
  purchasePrice: 950000,
  monthlyRent: 3800,
  annualExpenses: {
    propertyTax: 9500,
    insurance: 2800,
    maintenance: 4750,
    propertyManagement: 4560,
    vacancy: 2280,
    other: 950
  },
  downPayment: 190000,
  interestRate: 4.25,
  loanTerm: 30
};

const mockProperty3: PropertyData = {
  id: "property3",
  address: "789 Valencia St",
  city: "San Francisco",
  state: "CA",
  zipCode: "94110",
  purchasePrice: 1450000,
  monthlyRent: 5200,
  annualExpenses: {
    propertyTax: 14500,
    insurance: 4350,
    maintenance: 7250,
    propertyManagement: 6240,
    vacancy: 3120,
    other: 1450
  },
  downPayment: 290000,
  interestRate: 4.75,
  loanTerm: 30
};

const mockMarketTrend: MarketTrend = {
  city: "San Francisco",
  state: "CA",
  medianHomePrice: 1250000,
  priceChange1Year: 4.2,
  medianRent: 3800,
  rentChange1Year: 2.8,
  daysOnMarket: 22,
  inventoryChange: -5.3
};

const mockNeighborhoodData: NeighborhoodData = {
  zipCode: "94105",
  city: "San Francisco",
  state: "CA",
  schoolRating: 8.2,
  crimeRate: "Low",
  walkabilityScore: 92,
  transitScore: 95,
  population: 25000,
  medianIncome: 120000,
  employmentRate: 97.3
};

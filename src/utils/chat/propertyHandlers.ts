
import { PropertyData, PropertyAnalysis } from "@/types";
import { mockDataService } from "@/services/mockDataService";
import * as zillowService from "@/services/zillowService";

export const handleSetProperty = (
  message: string,
  price: number | null = null,
  rent: number | null = null,
  address: string | null = null,
  city: string | null = null,
  state: string | null = null,
  zip: string | null = null
): PropertyData => {
  return {
    id: Date.now().toString(),
    address: address || "123 Sample St",
    city: city || "Austin",
    state: state || "TX",
    zipCode: zip || "78701",
    purchasePrice: price || 350000,
    monthlyRent: rent || 2200,
    annualExpenses: {
      propertyTax: Math.round(0.012 * (price || 350000)),
      insurance: Math.round(0.005 * (price || 350000)),
      maintenance: Math.round(0.005 * (price || 350000)),
      propertyManagement: Math.round(0.1 * 12 * (rent || 2200)),
      vacancy: Math.round(0.05 * 12 * (rent || 2200)),
      other: 500
    },
    downPayment: Math.round(0.2 * (price || 350000)),
    interestRate: 5.5,
    loanTerm: 30
  };
};

export const analyzeRealProperty = async (property: PropertyData): Promise<PropertyAnalysis> => {
  try {
    const zillowData = await zillowService.getPropertyEstimate(
      property.address,
      property.city,
      property.state,
      property.zipCode
    );
    
    if (zillowData) {
      const enrichedProperty: PropertyData = {
        ...property,
        purchasePrice: zillowData.purchasePrice || property.purchasePrice,
        monthlyRent: zillowData.monthlyRent || property.monthlyRent,
        annualExpenses: zillowData.annualExpenses || property.annualExpenses
      };
      
      return mockDataService.calculatePropertyAnalysis(enrichedProperty);
    }
    
    return mockDataService.calculatePropertyAnalysis(property);
  } catch (error) {
    console.error("Error analyzing real property:", error);
    return mockDataService.calculatePropertyAnalysis(property);
  }
};

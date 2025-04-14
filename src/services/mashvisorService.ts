
import { PropertyData, PropertyAnalysis } from "@/types";

// Replace with your actual API key
const MASHVISOR_API_KEY = "YOUR_MASHVISOR_API_KEY";
const MASHVISOR_BASE_URL = "https://api.mashvisor.com/v1.1";

interface MashvisorPropertyData {
  id: string;
  address: {
    line: string;
    city: string;
    state: string;
    zipcode: string;
  };
  price: number;
  rental: {
    monthly_rate: number;
  };
  expenses: {
    property_tax: number;
    insurance: number;
    maintenance: number;
    property_management: number;
    vacancy: number;
    other: number;
  };
  cap_rate: number;
  cash_on_cash: number;
  monthly_cash_flow: number;
}

export const searchProperties = async (
  city: string,
  state: string,
  zipCode?: string
): Promise<PropertyData[]> => {
  try {
    const params = new URLSearchParams({
      state,
      city,
      ...(zipCode && { zip_code: zipCode }),
      page: "1",
      items: "5"
    });

    const response = await fetch(
      `${MASHVISOR_BASE_URL}/client/airbnb-property/search?${params.toString()}`,
      {
        method: "GET",
        headers: {
          "x-api-key": MASHVISOR_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    if (!response.ok) {
      console.error("Mashvisor API error:", await response.text());
      return [];
    }

    const data = await response.json();
    return transformMashvisorData(data.content.properties);
  } catch (error) {
    console.error("Error fetching Mashvisor properties:", error);
    return [];
  }
};

export const getPropertyDetails = async (
  propertyId: string
): Promise<PropertyData | null> => {
  try {
    const response = await fetch(
      `${MASHVISOR_BASE_URL}/client/airbnb-property/view?property_id=${propertyId}`,
      {
        method: "GET",
        headers: {
          "x-api-key": MASHVISOR_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    if (!response.ok) {
      console.error("Mashvisor API error:", await response.text());
      return null;
    }

    const data = await response.json();
    const properties = transformMashvisorData([data.content.property]);
    return properties.length > 0 ? properties[0] : null;
  } catch (error) {
    console.error("Error fetching Mashvisor property details:", error);
    return null;
  }
};

export const getMarketData = async (
  city: string,
  state: string
): Promise<any> => {
  try {
    const params = new URLSearchParams({
      state,
      city
    });

    const response = await fetch(
      `${MASHVISOR_BASE_URL}/client/airbnb-property/market?${params.toString()}`,
      {
        method: "GET",
        headers: {
          "x-api-key": MASHVISOR_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    if (!response.ok) {
      console.error("Mashvisor API error:", await response.text());
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching Mashvisor market data:", error);
    return null;
  }
};

// Helper function to transform Mashvisor data to our app's format
const transformMashvisorData = (
  properties: MashvisorPropertyData[]
): PropertyData[] => {
  return properties.map((prop) => ({
    id: prop.id,
    address: prop.address.line,
    city: prop.address.city,
    state: prop.address.state,
    zipCode: prop.address.zipcode,
    purchasePrice: prop.price,
    monthlyRent: prop.rental.monthly_rate,
    annualExpenses: {
      propertyTax: prop.expenses.property_tax,
      insurance: prop.expenses.insurance,
      maintenance: prop.expenses.maintenance,
      propertyManagement: prop.expenses.property_management,
      vacancy: prop.expenses.vacancy,
      other: prop.expenses.other || 500
    },
    downPayment: Math.round(prop.price * 0.2), // Assuming 20% down payment
    interestRate: 5.5, // Default interest rate
    loanTerm: 30 // Default loan term
  }));
};

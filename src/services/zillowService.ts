
import { PropertyData, NeighborhoodData } from "@/types";

// Replace with your actual API key
const ZILLOW_API_KEY = "YOUR_ZILLOW_API_KEY";
const ZILLOW_BASE_URL = "https://api.bridgedataoutput.com/api/v2/zestimate";

interface ZillowPropertyResponse {
  address: {
    streetAddress: string;
    city: string;
    state: string;
    zipcode: string;
  };
  zestimate: number;
  rentZestimate: number;
  taxAssessment: number;
}

export const getPropertyEstimate = async (
  address: string,
  city: string,
  state: string,
  zipCode: string
): Promise<Partial<PropertyData> | null> => {
  try {
    const params = new URLSearchParams({
      access_token: ZILLOW_API_KEY,
      address,
      citystatezip: `${city}, ${state} ${zipCode}`
    });

    const response = await fetch(`${ZILLOW_BASE_URL}?${params.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      console.error("Zillow API error:", await response.text());
      return null;
    }

    const data = await response.json();
    const propertyData = data.response as ZillowPropertyResponse;

    return {
      purchasePrice: propertyData.zestimate,
      monthlyRent: propertyData.rentZestimate / 12, // Annual rent estimate to monthly
      annualExpenses: {
        propertyTax: propertyData.taxAssessment,
        insurance: Math.round(propertyData.zestimate * 0.005), // Estimate insurance at 0.5% of property value
        maintenance: Math.round(propertyData.zestimate * 0.01), // Estimate maintenance at 1% of property value
        propertyManagement: Math.round((propertyData.rentZestimate / 12) * 0.1 * 12), // 10% of monthly rent
        vacancy: Math.round((propertyData.rentZestimate / 12) * 0.05 * 12), // 5% of monthly rent
        other: 500
      }
    };
  } catch (error) {
    console.error("Error fetching Zillow property data:", error);
    return null;
  }
};

export const getNeighborhoodData = async (
  zipCode: string,
  city: string,
  state: string
): Promise<NeighborhoodData | null> => {
  try {
    const params = new URLSearchParams({
      access_token: ZILLOW_API_KEY,
      zip: zipCode
    });

    const response = await fetch(
      `${ZILLOW_BASE_URL}/neighborhood?${params.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    if (!response.ok) {
      console.error("Zillow API error:", await response.text());
      return null;
    }

    const data = await response.json();
    
    // Transform Zillow data to our app's format
    return {
      zipCode,
      city,
      state,
      schoolRating: data.schools?.rating || 5,
      crimeRate: data.demographics?.crimeRate?.label || "Medium",
      walkabilityScore: data.walkability?.score || 50,
      transitScore: data.transportation?.score || 40,
      population: data.demographics?.population || 10000,
      medianIncome: data.demographics?.medianHouseholdIncome || 60000,
      employmentRate: data.demographics?.employmentRate || 95
    };
  } catch (error) {
    console.error("Error fetching Zillow neighborhood data:", error);
    return null;
  }
};


import { PropertyData } from "@/types";

interface EstatedPropertyResponse {
  data: {
    property: {
      address: {
        line_1: string;
        city: string;
        state: string;
        zip_code: string;
      };
      parcel: {
        apn: string;
        tax_year: number;
        tax_value: number;
        land_value: number;
        improvement_value: number;
      };
      structure: {
        year_built: number;
        beds: number;
        baths: number;
        total_area_sq_ft: number;
      };
      valuation: {
        value: number;
        high: number;
        low: number;
        forecast_standard_deviation: number;
      };
      owner: {
        name: string[];
      };
      assessments: Array<{
        year: number;
        land_value: number;
        improvement_value: number;
        total_value: number;
      }>;
    };
  };
  metadata: {
    timestamp: string;
  };
}

export const getPropertyDetails = async (
  address: string,
  city: string,
  state: string,
  zipCode: string,
  apiKey: string | null
): Promise<Partial<PropertyData> | null> => {
  if (!apiKey) {
    console.warn("Estated API key not provided");
    return null;
  }

  try {
    // Format the address for the API
    const formattedAddress = encodeURIComponent(`${address}, ${city}, ${state} ${zipCode}`);
    
    const response = await fetch(
      `https://apis.estated.com/v4/property?token=${apiKey}&address=${formattedAddress}`,
      {
        method: "GET",
        headers: {
          "Accept": "application/json",
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("Estated API error:", error);
      throw new Error(`Estated API error: ${response.status}`);
    }

    const data = await response.json() as EstatedPropertyResponse;
    
    // Extract property data from the response
    return {
      address: data.data.property.address.line_1,
      city: data.data.property.address.city,
      state: data.data.property.address.state,
      zipCode: data.data.property.address.zip_code,
      purchasePrice: data.data.property.valuation.value,
      additionalData: {
        yearBuilt: data.data.property.structure.year_built,
        beds: data.data.property.structure.beds,
        baths: data.data.property.structure.baths,
        sqft: data.data.property.structure.total_area_sq_ft,
        taxValue: data.data.property.parcel.tax_value,
        landValue: data.data.property.parcel.land_value,
        ownerName: data.data.property.owner.name.join(", "),
        assessmentHistory: data.data.property.assessments
      }
    };
  } catch (error) {
    console.error("Error calling Estated API:", error);
    return null;
  }
};

export const getPropertyHistory = async (
  address: string,
  city: string,
  state: string,
  zipCode: string,
  apiKey: string | null
): Promise<any | null> => {
  if (!apiKey) {
    console.warn("Estated API key not provided");
    return null;
  }

  try {
    // Format the address for the API
    const formattedAddress = encodeURIComponent(`${address}, ${city}, ${state} ${zipCode}`);
    
    const response = await fetch(
      `https://apis.estated.com/v4/property?token=${apiKey}&address=${formattedAddress}&include=sales`,
      {
        method: "GET",
        headers: {
          "Accept": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Estated API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error calling Estated API for property history:", error);
    return null;
  }
};

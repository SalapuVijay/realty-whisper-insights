
import { PropertyData } from "@/types";

// Define types for Realtor.com API responses
interface RealtorPropertyResponse {
  properties: RealtorProperty[];
  meta: {
    total: number;
    count: number;
  };
}

interface RealtorProperty {
  property_id: string;
  address: {
    line: string;
    city: string;
    state: string;
    postal_code: string;
  };
  price: number;
  beds: number;
  baths: number;
  building_size: {
    size: number;
    units: string;
  };
  thumbnail: string;
  lat: number;
  lon: number;
  year_built: number;
  property_type: string;
}

/**
 * Search for properties using the Realtor.com API
 */
export const searchProperties = async (location: string, minPrice?: number, maxPrice?: number): Promise<PropertyData[]> => {
  const apiKey = localStorage.getItem("realtor_api_key");
  
  if (!apiKey) {
    throw new Error("Realtor.com API key is required");
  }
  
  try {
    // This would be a real API call in production
    console.log(`Searching properties in ${location} with Realtor.com API`);
    
    // Mock data for demonstration
    return mockSearchProperties(location);
  } catch (error) {
    console.error("Error searching properties with Realtor.com API:", error);
    throw error;
  }
};

/**
 * Get property details from Realtor.com API
 */
export const getPropertyDetails = async (propertyId: string): Promise<PropertyData> => {
  const apiKey = localStorage.getItem("realtor_api_key");
  
  if (!apiKey) {
    throw new Error("Realtor.com API key is required");
  }
  
  try {
    // This would be a real API call in production
    console.log(`Getting property details for ${propertyId} with Realtor.com API`);
    
    // Mock data for demonstration
    return mockPropertyDetails(propertyId);
  } catch (error) {
    console.error("Error getting property details with Realtor.com API:", error);
    throw error;
  }
};

// Mock implementation
const mockSearchProperties = (location: string): PropertyData[] => {
  return [
    {
      id: "property-1",
      address: `123 Main St, ${location}`,
      price: 450000,
      beds: 3,
      baths: 2,
      sqft: 1800,
      yearBuilt: 2005,
      propertyType: "Single Family",
      lat: 37.7749,
      lng: -122.4194,
      imageUrl: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&q=75&fit=crop&w=600",
      description: "Beautiful single family home in desirable neighborhood."
    },
    {
      id: "property-2",
      address: `456 Oak Ave, ${location}`,
      price: 349000,
      beds: 2,
      baths: 2,
      sqft: 1200,
      yearBuilt: 2010,
      propertyType: "Condo",
      lat: 37.7833,
      lng: -122.4167,
      imageUrl: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&q=75&fit=crop&w=600",
      description: "Modern condo with amazing amenities."
    },
    {
      id: "property-3",
      address: `789 Pine St, ${location}`,
      price: 625000,
      beds: 4,
      baths: 3,
      sqft: 2400,
      yearBuilt: 1998,
      propertyType: "Single Family",
      lat: 37.7694,
      lng: -122.4862,
      imageUrl: "https://images.unsplash.com/photo-1416331108676-a22ccb276e35?auto=format&q=75&fit=crop&w=600",
      description: "Spacious family home with large backyard."
    }
  ];
};

const mockPropertyDetails = (propertyId: string): PropertyData => {
  return {
    id: propertyId,
    address: "123 Main St, San Francisco, CA 94105",
    price: 450000,
    beds: 3,
    baths: 2,
    sqft: 1800,
    yearBuilt: 2005,
    propertyType: "Single Family",
    lat: 37.7749,
    lng: -122.4194,
    imageUrl: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&q=75&fit=crop&w=600",
    description: "Beautiful single family home in desirable neighborhood."
  };
};

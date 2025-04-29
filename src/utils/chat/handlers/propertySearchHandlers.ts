
import { ChatContextType } from "../types";
import { PropertyData } from "@/types";
import { mockDataService } from "@/services/mockDataService";
import * as mashvisorService from "@/services/mashvisorService";

export async function handlePropertySearch(
  city: string,
  state: string,
  zipCode: string | undefined,
  mashvisorApiKey: string | null,
  chatContext: ChatContextType,
  setChatContext: (context: ChatContextType) => void
): Promise<string> {
  let response = `Searching for properties in ${city}, ${state}${zipCode ? ` ${zipCode}` : ''}...\n\n`;
  
  if (mashvisorApiKey) {
    try {
      const properties = await mashvisorService.searchProperties(city, state, zipCode);
      return formatSearchResults(properties, chatContext, setChatContext);
    } catch (error) {
      console.error("Error searching properties:", error);
      return response + "I encountered an error while searching for properties. Please check your API key or try again later.";
    }
  } else {
    return formatMockSearchResults(city, state, chatContext, setChatContext);
  }
}

export function formatSearchResults(
  properties: PropertyData[],
  chatContext: ChatContextType,
  setChatContext: (context: ChatContextType) => void
): string {
  if (!properties || properties.length === 0) {
    return "No properties found matching your search criteria. Try a different location or search terms.";
  }

  let response = `I found ${properties.length} properties in your selected area:\n\n`;
  
  properties.slice(0, 5).forEach((property, index) => {
    const capRate = ((property.monthlyRent * 12) / property.purchasePrice * 100).toFixed(2);
    
    response += `**Property ${index + 1}**:\n`;
    response += `🏠 ${property.address}, ${property.city}, ${property.state} ${property.zipCode}\n`;
    response += `💰 Price: $${property.purchasePrice.toLocaleString()}\n`;
    response += `💵 Rent: $${property.monthlyRent.toLocaleString()}/month\n`;
    response += `📊 Cap Rate: ${capRate}%\n\n`;
  });
  
  response += "You can ask me to analyze any of these properties in detail by saying 'analyze property 1' (or whichever number you're interested in).";
  return response;
}

export function formatMockSearchResults(
  city: string,
  state: string,
  chatContext: ChatContextType,
  setChatContext: (context: ChatContextType) => void
): string {
  const mockProperties = mockDataService.getProperties(city, state);
  return formatSearchResults(mockProperties, chatContext, setChatContext);
}

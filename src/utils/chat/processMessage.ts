
import { ChatMessage, PropertyData, PropertyAnalysis, NeighborhoodData } from "@/types";
import { ChatContextType } from "./types";
import { formatPropertyAnalysis, formatNeighborhoodData } from "./formatters";
import { handleSetProperty, analyzeRealProperty } from "./propertyHandlers";
import { getMarketTrendResponse } from "./marketHandlers";
import { mockDataService } from "@/services/mockDataService";
import * as mashvisorService from "@/services/mashvisorService";
import * as walkScoreService from "@/services/walkScoreService";
import * as estatedService from "@/services/estatedService";
import * as googlePlacesService from "@/services/googlePlacesService";
import * as dialogflowService from "@/services/dialogflowService";

export const processMessage = async (
  message: string,
  chatContext: ChatContextType,
  setChatContext: (context: ChatContextType) => void
): Promise<string> => {
  const lowerMessage = message.toLowerCase();
  let response = "";
  
  const apiKeys = chatContext.apiKeys || {
    mashvisor: localStorage.getItem("mashvisor_api_key"),
    zillow: localStorage.getItem("zillow_api_key"),
    realtor: localStorage.getItem("realtor_api_key"),
    googleMaps: localStorage.getItem("google_maps_api_key"),
    walkScore: localStorage.getItem("walkscore_api_key"),
    dialogflow: localStorage.getItem("dialogflow_api_key"),
    huggingface: localStorage.getItem("huggingface_api_key"),
    estated: localStorage.getItem("estated_api_key")
  };

  // Extract common patterns from the message
  const priceMatch = message.match(/price(?:[\s:]+)?\$?([\d,]+)/i);
  const rentMatch = message.match(/rent(?:[\s:]+)?\$?([\d,]+)/i);
  const addressMatch = message.match(/address(?:[\s:]+)?(.+?)(?:,|\sin|$)/i);
  const cityMatch = message.match(/(?:in|,)\s*([^,]+)(?:,|\s+[A-Z]{2})/i);
  const stateMatch = message.match(/([A-Z]{2})(?:\s+\d{5}|\s*$|,)/);
  const zipMatch = message.match(/(\d{5})/);

  // Handle different types of messages
  if (lowerMessage.includes("find property") || 
      lowerMessage.includes("search for property") || 
      lowerMessage.includes("find investment") ||
      lowerMessage.includes("show properties")) {
    
    response = await handlePropertySearch(
      cityMatch?.[1].trim() || "Austin",
      stateMatch?.[1].trim() || "TX",
      zipMatch?.[1],
      apiKeys.mashvisor,
      chatContext,
      setChatContext
    );
  }
  
  else if (lowerMessage.match(/analyze\s+property\s+(\d+)/i)) {
    response = await handlePropertyAnalysis(message, chatContext, setChatContext);
  }
  
  else if (lowerMessage.includes("set property") || 
           lowerMessage.includes("add property") || 
           lowerMessage.includes("new property")) {
    
    const price = priceMatch ? parseInt(priceMatch[1].replace(/,/g, "")) : null;
    const rent = rentMatch ? parseInt(rentMatch[1].replace(/,/g, "")) : null;
    
    const newProperty = handleSetProperty(
      message,
      price,
      rent,
      addressMatch?.[1].trim(),
      cityMatch?.[1].trim(),
      stateMatch?.[1].trim(),
      zipMatch?.[1]
    );
    
    const analysis = mockDataService.calculatePropertyAnalysis(newProperty);
    
    setChatContext({
      ...chatContext,
      property: newProperty,
      analysis
    });
    
    response = formatNewPropertyResponse(newProperty);
  }
  
  // ... Additional message handling for other cases (market trends, neighborhood insights, etc.)
  // The rest of the message handling logic would go here, broken down into similar handler functions
  
  return response || getDefaultResponse();
};

async function handlePropertySearch(
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

async function handlePropertyAnalysis(
  message: string, 
  chatContext: ChatContextType, 
  setChatContext: (context: ChatContextType) => void
): Promise<string> {
  const propertyIndexMatch = message.match(/analyze\s+property\s+(\d+)/i);
  
  if (!propertyIndexMatch || !propertyIndexMatch[1]) {
    return "Please specify which property you'd like to analyze, e.g., 'analyze property 1'.";
  }
  
  const propertyIndex = parseInt(propertyIndexMatch[1]) - 1;
  const mockProperties = mockDataService.getProperties("Austin", "TX");
  
  if (propertyIndex < 0 || propertyIndex >= mockProperties.length) {
    return `Please provide a valid property number between 1 and ${mockProperties.length}.`;
  }
  
  const selectedProperty = mockProperties[propertyIndex];
  const analysis = mockDataService.calculatePropertyAnalysis(selectedProperty);
  
  setChatContext({
    ...chatContext,
    property: selectedProperty,
    analysis
  });
  
  return `I've analyzed property #${propertyIndex + 1}:\n\n${formatPropertyAnalysis(analysis)}`;
}

function formatNewPropertyResponse(property: PropertyData): string {
  return `✅ I've set up a new property for you:\n\n` +
    `🏠 **Address**: ${property.address}, ${property.city}, ${property.state} ${property.zipCode}\n` +
    `💰 **Purchase Price**: $${property.purchasePrice.toLocaleString()}\n` +
    `💵 **Monthly Rent**: $${property.monthlyRent.toLocaleString()}\n` +
    `💸 **Down Payment**: $${property.downPayment.toLocaleString()} (${Math.round((property.downPayment / property.purchasePrice) * 100)}%)\n` +
    `📊 **Loan**: ${property.loanTerm}-year fixed at ${property.interestRate}% interest\n\n` +
    `I can now analyze this property for you. Try asking me for:\n` +
    `- Financial analysis\n` +
    `- Cash flow breakdown\n` +
    `- Return on investment\n` +
    `- Neighborhood insights\n` +
    `- Market trends`;
}

function formatSearchResults(
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

function formatMockSearchResults(
  city: string,
  state: string,
  chatContext: ChatContextType,
  setChatContext: (context: ChatContextType) => void
): string {
  const mockProperties = mockDataService.getProperties(city, state);
  return formatSearchResults(mockProperties, chatContext, setChatContext);
}

function getDefaultResponse(): string {
  return "I'm sorry, I didn't quite understand that request. You can ask me to:\n\n" +
         "• Analyze a property\n" +
         "• Show market trends\n" +
         "• Provide neighborhood insights\n" +
         "• Check walkability scores\n" +
         "• Find nearby amenities\n" +
         "• Look up property history\n" +
         "• Compare properties\n" +
         "• Set up a new property\n\n" +
         "For example, try saying 'analyze property' or 'show walkability score for 123 Main St, Austin TX'.";
}


import { ChatMessage, PropertyData, PropertyAnalysis } from "@/types";
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

// Add other helper functions here...

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

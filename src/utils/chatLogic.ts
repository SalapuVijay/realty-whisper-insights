import { ChatMessage, NeighborhoodData, PropertyData, PropertyAnalysis } from "@/types";
import { mockDataService } from "@/services/mockDataService";
import * as mashvisorService from "@/services/mashvisorService";
import * as zillowService from "@/services/zillowService";
import * as estatedService from "@/services/estatedService";
import * as walkScoreService from "@/services/walkScoreService";
import * as googlePlacesService from "@/services/googlePlacesService";
import * as huggingfaceService from "@/services/huggingfaceService";

export type ChatContextType = {
  property: PropertyData | null;
  setProperty: (property: PropertyData | null) => void;
  analysis: PropertyAnalysis | null;
  comparisonProperties: PropertyData[];
  addComparisonProperty: (property: PropertyData) => void;
  removeComparisonProperty: (id: string) => void;
  apiKeys?: {
    mashvisor: string | null;
    zillow: string | null;
    realtor: string | null;
    googleMaps: string | null;
    walkScore: string | null;
    dialogflow: string | null;
    huggingface: string | null;
    estated: string | null;
  }
};

const defaultPropertyData: PropertyData = {
  id: "default",
  address: "123 Main St",
  city: "Austin",
  state: "TX",
  zipCode: "78701",
  purchasePrice: 350000,
  monthlyRent: 2200,
  annualExpenses: {
    propertyTax: 4200,
    insurance: 1200,
    maintenance: 1750,
    propertyManagement: 2640,
    vacancy: 1320,
    other: 500
  },
  downPayment: 70000,
  interestRate: 5.5,
  loanTerm: 30
};

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
  
  const hasRealApiKeys = apiKeys.mashvisor && apiKeys.zillow;

  if (lowerMessage.includes("find property") || 
      lowerMessage.includes("search for property") || 
      lowerMessage.includes("find investment") ||
      lowerMessage.includes("show properties")) {
    
    const cityMatch = message.match(/in\s+([^,]+)(?:,|\s+[A-Z]{2})/i);
    const stateMatch = message.match(/([A-Z]{2})(?:\s+\d{5}|\s*$|,)/);
    const zipMatch = message.match(/(\d{5})/);
    
    const city = cityMatch ? cityMatch[1].trim() : "Austin";
    const state = stateMatch ? stateMatch[1].trim() : "TX";
    const zipCode = zipMatch ? zipMatch[1].trim() : undefined;
    
    response = `Searching for properties in ${city}, ${state}${zipCode ? ` ${zipCode}` : ''}...\n\n`;
    
    if (hasRealApiKeys) {
      try {
        const properties = await mashvisorService.searchProperties(city, state, zipCode);
        
        if (properties.length === 0) {
          response += "I couldn't find any properties matching your criteria. Try a different location or broader search terms.";
        } else {
          response += `Found ${properties.length} properties:\n\n`;
          
          properties.forEach((property, index) => {
            response += `**Property ${index + 1}**: ${property.address}, ${property.city}, ${property.state}\n`;
            response += `• Purchase Price: $${property.purchasePrice.toLocaleString()}\n`;
            response += `• Monthly Rent: $${property.monthlyRent.toLocaleString()}\n\n`;
          });
          
          response += "To analyze any of these properties, say 'analyze property [number]' or 'analyze property at [address]'.";
          
          setChatContext({
            ...chatContext,
            comparisonProperties: properties
          });
        }
      } catch (error) {
        console.error("Error searching properties:", error);
        response += "I encountered an error while searching for properties. Please check your API key or try again later.";
      }
    } else {
      const mockProperties = [
        { ...defaultPropertyData, id: "mock1", address: "123 Main St", city, state },
        { ...defaultPropertyData, id: "mock2", address: "456 Oak Ave", city, state, purchasePrice: 425000, monthlyRent: 2800 },
        { ...defaultPropertyData, id: "mock3", address: "789 Pine Blvd", city, state, purchasePrice: 275000, monthlyRent: 1900 }
      ];
      
      response += "Here are some sample properties (using mock data):\n\n";
      
      mockProperties.forEach((property, index) => {
        response += `**Property ${index + 1}**: ${property.address}, ${property.city}, ${property.state}\n`;
        response += `• Purchase Price: $${property.purchasePrice.toLocaleString()}\n`;
        response += `• Monthly Rent: $${property.monthlyRent.toLocaleString()}\n\n`;
      });
      
      response += "To analyze any of these properties, say 'analyze property [number]' or 'analyze property at [address]'.\n\n";
      response += "**Note**: These are sample properties. To get real data, please add your Mashvisor and Zillow API keys in the settings.";
      
      setChatContext({
        ...chatContext,
        comparisonProperties: mockProperties
      });
    }
    
    return response;
  }
  
  if (lowerMessage.match(/analyze\s+property\s+(\d+)/i)) {
    const propertyNumberMatch = lowerMessage.match(/analyze\s+property\s+(\d+)/i);
    const propertyNumber = parseInt(propertyNumberMatch?.[1] || "1") - 1;
    
    if (chatContext.comparisonProperties.length > 0 && propertyNumber >= 0 && propertyNumber < chatContext.comparisonProperties.length) {
      const selectedProperty = chatContext.comparisonProperties[propertyNumber];
      const analysis = hasRealApiKeys 
        ? await analyzeRealProperty(selectedProperty)
        : mockDataService.calculatePropertyAnalysis(selectedProperty);
      
      setChatContext({
        ...chatContext,
        property: selectedProperty,
        analysis
      });
      
      response = `Analyzing property at ${selectedProperty.address}, ${selectedProperty.city}, ${selectedProperty.state}:\n\n`;
      response += formatPropertyAnalysis(analysis);
    } else {
      response = "I couldn't find that property number in our search results. Please search for properties first or try a different number.";
    }
    
    return response;
  }
  
  if (lowerMessage.includes("analyze property") || 
      lowerMessage.includes("analyze this property") || 
      lowerMessage.includes("property analysis")) {
    
    if (!chatContext.property) {
      const property = defaultPropertyData;
      const analysis = mockDataService.calculatePropertyAnalysis(property);
      
      setChatContext({
        ...chatContext,
        property,
        analysis
      });
      
      response = `I'll analyze a sample property at ${property.address}, ${property.city}, ${property.state} ${property.zipCode}.\n\n`;
      response += formatPropertyAnalysis(analysis);
    } else {
      const analysis = mockDataService.calculatePropertyAnalysis(chatContext.property);
      
      setChatContext({
        ...chatContext,
        analysis
      });
      
      response = `Here's my analysis for ${chatContext.property.address}, ${chatContext.property.city}, ${chatContext.property.state}:\n\n`;
      response += formatPropertyAnalysis(analysis);
    }
  }
  
  else if (lowerMessage.includes("market trends") || 
           lowerMessage.includes("market data") || 
           lowerMessage.includes("price trends")) {
    
    const cityMatch = message.match(/in\s+([^,]+)(?:,|\s+[A-Z]{2})/i);
    const stateMatch = message.match(/([A-Z]{2})(?:\s+\d{5}|\s*$|,)/);
    
    const city = cityMatch ? cityMatch[1].trim() : (chatContext.property ? chatContext.property.city : "Austin");
    const state = stateMatch ? stateMatch[1].trim() : (chatContext.property ? chatContext.property.state : "TX");
    
    response = `Here are the current market trends for ${city}, ${state}:\n\n`;
    
    if (hasRealApiKeys) {
      try {
        const marketData = await mashvisorService.getMarketData(city, state);
        
        if (marketData) {
          response += `📈 **Median Home Price**: $${marketData.median_price.toLocaleString()} (${marketData.price_change_1year > 0 ? '+' : ''}${marketData.price_change_1year}% year-over-year)\n`;
          response += `🏠 **Median Rent**: $${marketData.median_rent.toLocaleString()} (${marketData.rent_change_1year > 0 ? '+' : ''}${marketData.rent_change_1year}% year-over-year)\n`;
          response += `⏱️ **Average Days on Market**: ${marketData.days_on_market} days\n`;
          response += `📊 **Inventory Change**: ${marketData.inventory_change > 0 ? '+' : ''}${marketData.inventory_change}% year-over-year\n\n`;
          
          if (marketData.price_change_1year > 8) {
            response += "This is a hot seller's market with rapidly appreciating home values. Competition among buyers is likely high.";
          } else if (marketData.price_change_1year > 3) {
            response += "This market is showing healthy appreciation, balancing opportunity for both buyers and sellers.";
          } else if (marketData.price_change_1year > 0) {
            response += "This market is stable with modest appreciation, which may present good value opportunities.";
          } else {
            response += "This market is experiencing some price corrections, which could present buying opportunities but also carries risk.";
          }
        } else {
          const mockTrend = mockDataService.getMarketTrends(city, state);
          response += getMarketTrendResponse(mockTrend);
          response += "\n\n**Note**: This is using mock data. There was an issue retrieving real data.";
        }
      } catch (error) {
        console.error("Error getting market trends:", error);
        const mockTrend = mockDataService.getMarketTrends(city, state);
        response += getMarketTrendResponse(mockTrend);
        response += "\n\n**Note**: This is using mock data. There was an issue retrieving real data.";
      }
    } else {
      const marketTrend = mockDataService.getMarketTrends(city, state);
      response += getMarketTrendResponse(marketTrend);
      response += "\n\n**Note**: This is sample data. To get real market trends, please add your API keys in the settings.";
    }
  }
  
  else if (lowerMessage.includes("neighborhood") || 
           lowerMessage.includes("schools") || 
           lowerMessage.includes("safety") || 
           lowerMessage.includes("walkability")) {
    
    const property = chatContext.property || defaultPropertyData;
    
    response = `Here are neighborhood insights for ${property.city}, ${property.state} ${property.zipCode}:\n\n`;
    
    if (hasRealApiKeys) {
      try {
        const neighborhoodData = await zillowService.getNeighborhoodData(
          property.zipCode,
          property.city,
          property.state
        );
        
        if (neighborhoodData) {
          response += formatNeighborhoodData(neighborhoodData);
        } else {
          const mockData = mockDataService.getNeighborhoodData(property.zipCode, property.city, property.state);
          response += formatNeighborhoodData(mockData);
          response += "\n\n**Note**: This is using mock data. There was an issue retrieving real data.";
        }
      } catch (error) {
        console.error("Error getting neighborhood data:", error);
        const mockData = mockDataService.getNeighborhoodData(property.zipCode, property.city, property.state);
        response += formatNeighborhoodData(mockData);
        response += "\n\n**Note**: This is using mock data. There was an issue retrieving real data.";
      }
    } else {
      const neighborhoodData = mockDataService.getNeighborhoodData(property.zipCode, property.city, property.state);
      response += formatNeighborhoodData(neighborhoodData);
      response += "\n\n**Note**: This is sample data. To get real neighborhood insights, please add your API keys in the settings.";
    }
  }
  
  else if (lowerMessage.includes("compare") || lowerMessage.includes("comparison")) {
    if (chatContext.comparisonProperties.length === 0 && !chatContext.property) {
      response = "I don't have any properties to compare yet. Would you like me to analyze a sample property first?";
    } else {
      const propertiesForComparison = [
        ...(chatContext.property ? [chatContext.property] : []),
        ...chatContext.comparisonProperties
      ];
      
      if (propertiesForComparison.length < 2) {
        response = "I need at least two properties to make a comparison. Would you like me to add another sample property?";
      } else {
        response = "Here's a comparison of your properties:\n\n";
        
        const propertyAnalyses = propertiesForComparison.map(prop => ({
          property: prop,
          analysis: mockDataService.calculatePropertyAnalysis(prop)
        }));
        
        response += "| Property | Purchase Price | Monthly Rent | Cash Flow | Cap Rate | ROI |\n";
        response += "|----------|---------------|--------------|-----------|----------|-----|\n";
        
        propertyAnalyses.forEach(({ property, analysis }) => {
          response += `| ${property.address.substring(0, 15)}... | $${property.purchasePrice.toLocaleString()} | $${property.monthlyRent.toLocaleString()} | $${analysis.cashFlow.monthly.toLocaleString()} | ${analysis.capRate}% | ${analysis.returnOnInvestment}% |\n`;
        });
        
        const bestCashFlow = propertyAnalyses.reduce((prev, current) => 
          prev.analysis.cashFlow.monthly > current.analysis.cashFlow.monthly ? prev : current
        );
        
        const bestROI = propertyAnalyses.reduce((prev, current) => 
          prev.analysis.returnOnInvestment > current.analysis.returnOnInvestment ? prev : current
        );
        
        response += "\n**Analysis Summary**:\n";
        response += `• Best Cash Flow: ${bestCashFlow.property.address} at $${bestCashFlow.analysis.cashFlow.monthly.toLocaleString()}/month\n`;
        response += `• Best ROI: ${bestROI.property.address} at ${bestROI.analysis.returnOnInvestment}%\n\n`;
        
        if (bestCashFlow.property.id === bestROI.property.id) {
          response += `Overall, ${bestCashFlow.property.address} appears to be the strongest investment opportunity based on both cash flow and ROI.`;
        } else {
          response += `You have a trade-off decision: ${bestCashFlow.property.address} offers better cash flow, while ${bestROI.property.address} offers better long-term ROI.`;
        }
      }
    }
  }
  
  else if (lowerMessage.includes("set property") || 
           lowerMessage.includes("add property") || 
           lowerMessage.includes("new property")) {
    
    const priceMatch = message.match(/price(?:[\s:]+)?\$?([\d,]+)/i);
    const rentMatch = message.match(/rent(?:[\s:]+)?\$?([\d,]+)/i);
    const addressMatch = message.match(/address(?:[\s:]+)?(.+?)(?:,|\sin|$)/i);
    const cityMatch = message.match(/(?:in|,)\s*([^,]+)(?:,|\s+[A-Z]{2})/i);
    const stateMatch = message.match(/([A-Z]{2})(?:\s+\d{5}|\s*$|,)/);
    const zipMatch = message.match(/(\d{5})/);
    
    const newProperty: PropertyData = {
      id: Date.now().toString(),
      address: addressMatch ? addressMatch[1].trim() : "123 Sample St",
      city: cityMatch ? cityMatch[1].trim() : "Austin",
      state: stateMatch ? stateMatch[1].trim() : "TX",
      zipCode: zipMatch ? zipMatch[1].trim() : "78701",
      purchasePrice: priceMatch ? parseInt(priceMatch[1].replace(/,/g, "")) : 350000,
      monthlyRent: rentMatch ? parseInt(rentMatch[1].replace(/,/g, "")) : 2200,
      annualExpenses: {
        propertyTax: Math.round(0.012 * (priceMatch ? parseInt(priceMatch[1].replace(/,/g, "")) : 350000)),
        insurance: Math.round(0.005 * (priceMatch ? parseInt(priceMatch[1].replace(/,/g, "")) : 350000)),
        maintenance: Math.round(0.005 * (priceMatch ? parseInt(priceMatch[1].replace(/,/g, "")) : 350000)),
        propertyManagement: Math.round(0.1 * 12 * (rentMatch ? parseInt(rentMatch[1].replace(/,/g, "")) : 2200)),
        vacancy: Math.round(0.05 * 12 * (rentMatch ? parseInt(rentMatch[1].replace(/,/g, "")) : 2200)),
        other: 500
      },
      downPayment: Math.round(0.2 * (priceMatch ? parseInt(priceMatch[1].replace(/,/g, "")) : 350000)),
      interestRate: 5.5,
      loanTerm: 30
    };
    
    const analysis = mockDataService.calculatePropertyAnalysis(newProperty);
    
    setChatContext({
      ...chatContext,
      property: newProperty,
      analysis
    });
    
    response = `Great! I've set up a property at ${newProperty.address}, ${newProperty.city}, ${newProperty.state} ${newProperty.zipCode} with:\n\n`;
    response += `• Purchase Price: $${newProperty.purchasePrice.toLocaleString()}\n`;
    response += `• Monthly Rent: $${newProperty.monthlyRent.toLocaleString()}\n`;
    response += `• Down Payment: $${newProperty.downPayment.toLocaleString()} (${Math.round((newProperty.downPayment / newProperty.purchasePrice) * 100)}%)\n`;
    response += `• Loan Terms: ${newProperty.loanTerm} years at ${newProperty.interestRate}% interest\n\n`;
    
    response += "Would you like me to analyze this property, show market trends, or provide neighborhood insights?";
  }
  
  else if (lowerMessage.includes("add comparison") || 
           lowerMessage.includes("add to comparison") || 
           lowerMessage.includes("compare with")) {
    
    const baseProperty = chatContext.property || defaultPropertyData;
    
    const compProperty: PropertyData = {
      ...baseProperty,
      id: Date.now().toString(),
      address: baseProperty.address.replace(/\d+/, (match) => String(Number(match) + 100)),
      purchasePrice: Math.round(baseProperty.purchasePrice * (1 + (Math.random() * 0.2 - 0.1))),
      monthlyRent: Math.round(baseProperty.monthlyRent * (1 + (Math.random() * 0.2 - 0.1))),
      downPayment: Math.round(baseProperty.downPayment * (1 + (Math.random() * 0.2 - 0.1)))
    };
    
    setChatContext({
      ...chatContext,
      comparisonProperties: [...chatContext.comparisonProperties, compProperty]
    });
    
    response = `I've added a comparison property at ${compProperty.address} with:\n\n`;
    response += `• Purchase Price: $${compProperty.purchasePrice.toLocaleString()}\n`;
    response += `• Monthly Rent: $${compProperty.monthlyRent.toLocaleString()}\n`;
    response += `• Down Payment: $${compProperty.downPayment.toLocaleString()}\n\n`;
    
    response += "You can now use the 'compare properties' command to see a side-by-side comparison.";
  }
  
  else if (lowerMessage.includes("property history") || 
           lowerMessage.includes("property details") || 
           lowerMessage.includes("property info") ||
           lowerMessage.includes("tax history")) {
    
    const addressMatch = message.match(/at\s+([^,]+)(?:,|\s+[A-Z]{2})/i);
    const cityMatch = message.match(/in\s+([^,]+)(?:,|\s+[A-Z]{2})/i);
    const stateMatch = message.match(/([A-Z]{2})(?:\s+\d{5}|\s*$|,)/);
    const zipMatch = message.match(/(\d{5})/);
    
    const address = addressMatch ? addressMatch[1].trim() : (chatContext.property ? chatContext.property.address : "123 Main St");
    const city = cityMatch ? cityMatch[1].trim() : (chatContext.property ? chatContext.property.city : "Austin");
    const state = stateMatch ? stateMatch[1].trim() : (chatContext.property ? chatContext.property.state : "TX");
    const zipCode = zipMatch ? zipMatch[1].trim() : (chatContext.property ? chatContext.property.zipCode : "78701");
    
    response = `Fetching property details for ${address}, ${city}, ${state} ${zipCode}...\n\n`;
    
    if (apiKeys.estated) {
      try {
        const propertyDetails = await estatedService.getPropertyDetails(address, city, state, zipCode, apiKeys.estated);
        
        if (propertyDetails) {
          if (chatContext.property) {
            setChatContext({
              ...chatContext,
              property: {
                ...chatContext.property,
                ...propertyDetails,
              }
            });
          } else {
            const newProperty: PropertyData = {
              id: uuidv4(),
              address: propertyDetails.address || address,
              city: propertyDetails.city || city,
              state: propertyDetails.state || state,
              zipCode: propertyDetails.zipCode || zipCode,
              purchasePrice: propertyDetails.purchasePrice || 350000,
              monthlyRent: 0,
              annualExpenses: {
                propertyTax: propertyDetails.additionalData?.taxValue || 0,
                insurance: 0,
                maintenance: 0,
                propertyManagement: 0,
                vacancy: 0,
                other: 0
              },
              downPayment: (propertyDetails.purchasePrice || 350000) * 0.2,
              interestRate: 5.5,
              loanTerm: 30,
              additionalData: propertyDetails.additionalData
            };
            
            setChatContext({
              ...chatContext,
              property: newProperty
            });
          }
          
          response = `**Property Details for ${address}, ${city}, ${state} ${zipCode}**\n\n`;
          
          if (propertyDetails.additionalData) {
            response += `🏠 **Property Characteristics**\n`;
            response += `• Year Built: ${propertyDetails.additionalData.yearBuilt || 'N/A'}\n`;
            response += `• Bedrooms: ${propertyDetails.additionalData.beds || 'N/A'}\n`;
            response += `• Bathrooms: ${propertyDetails.additionalData.baths || 'N/A'}\n`;
            response += `• Square Footage: ${propertyDetails.additionalData.sqft ? propertyDetails.additionalData.sqft.toLocaleString() : 'N/A'} sq ft\n\n`;
            
            response += `💰 **Valuation Information**\n`;
            response += `• Estimated Value: $${propertyDetails.purchasePrice ? propertyDetails.purchasePrice.toLocaleString() : 'N/A'}\n`;
            response += `• Tax Assessment: $${propertyDetails.additionalData.taxValue ? propertyDetails.additionalData.taxValue.toLocaleString() : 'N/A'}\n`;
            response += `• Land Value: $${propertyDetails.additionalData.landValue ? propertyDetails.additionalData.landValue.toLocaleString() : 'N/A'}\n\n`;
            
            if (propertyDetails.additionalData.ownerName) {
              response += `📋 **Ownership**\n`;
              response += `• Current Owner: ${propertyDetails.additionalData.ownerName}\n\n`;
            }
            
            if (propertyDetails.additionalData.assessmentHistory && propertyDetails.additionalData.assessmentHistory.length > 0) {
              response += `📊 **Assessment History**\n`;
              
              const sortedHistory = [...propertyDetails.additionalData.assessmentHistory]
                .sort((a, b) => b.year - a.year);
              
              for (let i = 0; i < Math.min(3, sortedHistory.length); i++) {
                const history = sortedHistory[i];
                response += `• ${history.year}: $${history.total_value.toLocaleString()} (Land: $${history.land_value.toLocaleString()}, Improvements: $${history.improvement_value.toLocaleString()})\n`;
              }
            }
          } else {
            response += "I couldn't find detailed property information. Would you like me to analyze this property using estimated values instead?";
          }
        } else {
          response = "I couldn't find property details for that address. Please check the address and try again, or let me analyze this property using estimated values.";
        }
      } catch (error) {
        console.error("Error getting property details:", error);
        response = "I encountered an error while retrieving property details. Let me analyze this property using estimated values instead.";
      }
    } else {
      response = "To get detailed property information, please add your Estated API key in the settings. For now, I'll use estimated values.";
      
      const mockProperty = {
        yearBuilt: 2005,
        beds: 3,
        baths: 2,
        sqft: 1800,
        value: 420000
      };
      
      response += `\n\n**Estimated Property Details**\n\n`;
      response += `🏠 **Property Characteristics** (estimated)\n`;
      response += `• Year Built: ${mockProperty.yearBuilt}\n`;
      response += `• Bedrooms: ${mockProperty.beds}\n`;
      response += `• Bathrooms: ${mockProperty.baths}\n`;
      response += `• Square Footage: ${mockProperty.sqft.toLocaleString()} sq ft\n\n`;
      
      response += `💰 **Estimated Valuation**\n`;
      response += `• Value: $${mockProperty.value.toLocaleString()}\n`;
      response += `• Price per Sq Ft: $${Math.round(mockProperty.value / mockProperty.sqft).toLocaleString()}\n`;
    }
    
    return response;
  }
  
  else if (lowerMessage.includes("walk score") || 
           lowerMessage.includes("walkability") || 
           lowerMessage.includes("transit score") || 
           lowerMessage.includes("bike score")) {
    
    const addressMatch = message.match(/for\s+([^,]+)(?:,|\s+[A-Z]{2})/i);
    const cityMatch = message.match(/in\s+([^,]+)(?:,|\s+[A-Z]{2})/i);
    const stateMatch = message.match(/([A-Z]{2})(?:\s+\d{5}|\s*$|,)/);
    const zipMatch = message.match(/(\d{5})/);
    
    const address = addressMatch ? addressMatch[1].trim() : (chatContext.property ? chatContext.property.address : "123 Main St");
    const city = cityMatch ? cityMatch[1].trim() : (chatContext.property ? chatContext.property.city : "Austin");
    const state = stateMatch ? stateMatch[1].trim() : (chatContext.property ? chatContext.property.state : "TX");
    const zipCode = zipMatch ? zipMatch[1].trim() : (chatContext.property ? chatContext.property.zipCode : "78701");
    
    response = `Checking walkability scores for ${address}, ${city}, ${state} ${zipCode}...\n\n`;
    
    let latitude = 30.2672;
    let longitude = -97.7431;
    
    if (chatContext.property?.latitude && chatContext.property?.longitude) {
      latitude = chatContext.property.latitude;
      longitude = chatContext.property.longitude;
    }
    
    if (apiKeys.walkScore) {
      try {
        const walkScoreData = await walkScoreService.getWalkScore(
          latitude, 
          longitude, 
          `${address}, ${city}, ${state} ${zipCode}`,
          apiKeys.walkScore
        );
        
        if (walkScoreData) {
          response = `**Walkability Report for ${address}, ${city}, ${state}**\n\n`;
          
          response += `👟 **Walk Score**: ${walkScoreData.walkScore}/100 - ${walkScoreData.walkScoreDescription}\n`;
          
          if (walkScoreData.transitScore) {
            response += `🚌 **Transit Score**: ${walkScoreData.transitScore}/100 - ${walkScoreData.transitScoreDescription}\n`;
          }
          
          if (walkScoreData.bikeScore) {
            response += `🚲 **Bike Score**: ${walkScoreData.bikeScore}/100 - ${walkScoreData.bikeScoreDescription}\n`;
          }
          
          response += `\n`;
          
          if (walkScoreData.walkScore >= 90) {
            response += "This is a walker's paradise where daily errands do not require a car. This feature can make the property more attractive to tenants who don't want to drive.";
          } else if (walkScoreData.walkScore >= 70) {
            response += "This is a very walkable location where most errands can be accomplished on foot. Properties in walkable areas often command higher rents and appreciation.";
          } else if (walkScoreData.walkScore >= 50) {
            response += "This location is somewhat walkable, and some errands can be accomplished on foot. Consider the target tenant demographic when evaluating this feature.";
          } else {
            response += "This location is car-dependent, and most errands require driving. This may reduce appeal to tenants looking for walkable neighborhoods.";
          }
        } else {
          response = "I couldn't retrieve Walk Score data for that location. Would you like me to try a different address?";
        }
      } catch (error) {
        console.error("Error getting Walk Score:", error);
        response = "I encountered an error while retrieving Walk Score data. Let me use estimated walkability information instead.";
      }
    } else {
      response = "To get accurate walkability scores, please add your Walk Score API key in the settings. For now, I'll use estimated values.\n\n";
      
      const mockWalkScore = {
        walkScore: Math.floor(Math.random() * 30) + 60,
        transitScore: Math.floor(Math.random() * 40) + 40,
        bikeScore: Math.floor(Math.random() * 30) + 50
      };
      
      response += `**Estimated Walkability Report for ${address}, ${city}, ${state}**\n\n`;
      response += `👟 **Walk Score**: ${mockWalkScore.walkScore}/100`;
      
      if (mockWalkScore.walkScore >= 90) {
        response += " - Walker's Paradise (Daily errands do not require a car)\n";
      } else if (mockWalkScore.walkScore >= 70) {
        response += " - Very Walkable (Most errands can be accomplished on foot)\n";
      } else if (mockWalkScore.walkScore >= 50) {
        response += " - Somewhat Walkable (Some errands can be accomplished on foot)\n";
      } else {
        response += " - Car-Dependent (Most errands require a car)\n";
      }
      
      response += `🚌 **Transit Score**: ${mockWalkScore.transitScore}/100`;
      
      if (mockWalkScore.transitScore >= 90) {
        response += " - Rider's Paradise (World-class public transportation)\n";
      } else if (mockWalkScore.transitScore >= 70) {
        response += " - Excellent Transit (Transit is convenient for most trips)\n";
      } else if (mockWalkScore.transitScore >= 50) {
        response += " - Good Transit (Many public transportation options)\n";
      } else {
        response += " - Some Transit (A few public transportation options)\n";
      }
      
      response += `🚲 **Bike Score**: ${mockWalkScore.bikeScore}/100`;
      
      if (mockWalkScore.bikeScore >= 90) {
        response += " - Biker's Paradise (Flat as a pancake, excellent bike lanes)\n";
      } else if (mockWalkScore.bikeScore >= 70) {
        response += " - Very Bikeable (Biking is convenient for most trips)\n";
      } else if (mockWalkScore.bikeScore >= 50) {
        response += " - Bikeable (Some bike infrastructure)\n";
      } else {
        response += " - Somewhat Bikeable (Minimal bike infrastructure)\n";
      }
    }
    
    return response;
  }
  
  else if (lowerMessage.includes("nearby") || 
           lowerMessage.includes("amenities") || 
           lowerMessage.includes("places") ||
           lowerMessage.includes("schools") ||
           lowerMessage.includes("restaurants")) {
    
    const addressMatch = message.match(/near\s+([^,]+)(?:,|\s+[A-Z]{2})/i);
    const cityMatch = message.match(/in\s+([^,]+)(?:,|\s+[A-Z]{2})/i);
    const stateMatch = message.match(/([A-Z]{2})(?:\s+\d{5}|\s*$|,)/);
    const zipMatch = message.match(/(\d{5})/);
    
    const address = addressMatch ? addressMatch[1].trim() : (chatContext.property ? chatContext.property.address : "123 Main St");
    const city = cityMatch ? cityMatch[1].trim() : (chatContext.property ? chatContext.property.city : "Austin");
    const state = stateMatch ? stateMatch[1].trim() : (chatContext.property ? chatContext.property.state : "TX");
    const zipCode = zipMatch ? zipMatch[1].trim() : (chatContext.property ? chatContext.property.zipCode : "78701");
    
    response = `Searching for amenities near ${address}, ${city}, ${state} ${zipCode}...\n\n`;
    
    let latitude = 30.2672;
    let longitude = -97.7431;
    
    if (chatContext.property?.latitude && chatContext.property?.longitude) {
      latitude = chatContext.property.latitude;
      longitude = chatContext.property.longitude;
    }
    
    if (apiKeys.googleMaps) {
      try {
        const nearbyPlaces = await googlePlacesService.getNearbyPlaces(
          latitude, 
          longitude,
          apiKeys.googleMaps,
          1000,
          ["school", "restaurant", "store", "hospital", "park", "transit_station"]
        );
        
        if (nearbyPlaces) {
          response = `**Nearby Places Around ${address}, ${city}, ${state}**\n\n`;
          
          if (nearbyPlaces.schools.length > 0) {
            response += `🏫 **Schools**\n`;
            for (const school of nearbyPlaces.schools.slice(0, 3)) {
              response += `• ${school.name} (${school.vicinity})${school.rating ? ` - Rating: ${school.rating}/5` : ''}\n`;
            }
            response += '\n';
          }
          
          if (nearbyPlaces.restaurants.length > 0) {
            response += `🍽️ **Restaurants & Cafes**\n`;
            for (const restaurant of nearbyPlaces.restaurants.slice(0, 3)) {
              response += `• ${restaurant.name} (${restaurant.vicinity})${restaurant.rating ? ` - Rating: ${restaurant.rating}/5` : ''}\n`;
            }
            response += '\n';
          }
          
          if (nearbyPlaces.shopping.length > 0) {
            response += `🛒 **Shopping**\n`;
            for (const shop of nearbyPlaces.shopping.slice(0, 3)) {
              response += `• ${shop.name} (${shop.vicinity})\n`;
            }
            response += '\n';
          }
          
          if (nearbyPlaces.healthcare.length > 0) {
            response += `🏥 **Healthcare**\n`;
            for (const healthcare of nearbyPlaces.healthcare.slice(0, 2)) {
              response += `• ${healthcare.name} (${healthcare.vicinity})\n`;
            }
            response += '\n';
          }
          
          if (nearbyPlaces.parks.length > 0) {
            response += `🌳 **Parks & Recreation**\n`;
            for (const park of nearbyPlaces.parks.slice(0, 2)) {
              response += `• ${park.name} (${park.vicinity})\n`;
            }
            response += '\n';
          }
          
          if (nearbyPlaces.transportation.length > 0) {
            response += `🚆 **Transportation**\n`;
            for (const transport of nearbyPlaces.transportation.slice(0, 2)) {
              response += `• ${transport.name} (${transport.vicinity})\n`;
            }
            response += '\n';
          }
          
          response += `This neighborhood offers a good mix of amenities that can impact property value and rental desirability. Proximity to schools, shopping, and parks are particularly valuable features for family renters.`;
        } else {
          response = "I couldn't find any nearby places information for that location. Would you like to try a different address?";
        }
      } catch (error) {
        console.error("Error getting nearby places:", error);
        response = "I encountered an error while retrieving nearby places data. Let me use some general neighborhood information instead.";
      }
    } else {
      response = "To get accurate nearby places information, please add your Google Places API key in the settings. For now, I'll provide some general neighborhood information.\n\n";
      
      response += `**Estimated Nearby Places Around ${address}, ${city}, ${state}**\n\n`;
      
      response += `🏫 **Schools**\n`;
      response += `• ${city} Elementary School (0.5 miles away)\n`;
      response += `• ${city} Middle School (1.2 miles away)\n`;
      response += `• ${city} High School (1.8 miles away)\n\n`;
      
      response += `🍽️ **Restaurants & Cafes**\n`;
      response += `• Local Coffee Shop (0.3 miles away)\n`;
      response += `• Family Restaurant (0.7 miles away)\n`;
      response += `• Fast Casual Dining (0.9 miles away)\n\n`;
      
      response += `🛒 **Shopping**\n`;
      response += `• Neighborhood Grocery (0.4 miles away)\n`;
      response += `• Retail Center (1.1 miles away)\n`;
      response += `• Shopping Mall (3.2 miles away)\n\n`;
      
      response += `Note: This is estimated information. For actual nearby places data, please add your Google Places API key.`;
    }
    
    return response;
  }
  
  else if (lowerMessage.includes("compare")) {
    if (chatContext.comparisonProperties.length < 2 && !chatContext.property) {
      response = "I need at least two properties to compare. Would you like me to create some sample properties for comparison?";
    } else {
      const propertiesForComparison = [
        ...(chatContext.property ? [chatContext.property] : []),
        ...chatContext.comparisonProperties
      ];
      
      if (propertiesForComparison.length < 2) {
        response = "I need at least two properties to make a comparison. Would you like me to add another sample property?";
      } else {
        response = "Here's a comparison of your properties:\n\n";
        
        const propertyAnalyses = propertiesForComparison.map(prop => ({
          property: prop,
          analysis: mockDataService.calculatePropertyAnalysis(prop)
        }));
        
        response += "| Property | Purchase Price | Monthly Rent | Cash Flow | Cap Rate | ROI |\n";
        response += "|----------|---------------|--------------|-----------|----------|-----|\n";
        
        propertyAnalyses.forEach(({ property, analysis }) => {
          response += `| ${property.address.substring(0, 15)}... | $${property.purchasePrice.toLocaleString()} | $${property.monthlyRent.toLocaleString()} | $${analysis.cashFlow.monthly.toLocaleString()} | ${analysis.capRate}% | ${analysis.returnOnInvestment}% |\n`;
        });
        
        const bestCashFlow = propertyAnalyses.reduce((prev, current) => 
          prev.analysis.cashFlow.monthly > current.analysis.cashFlow.monthly ? prev : current
        );
        
        const bestROI = propertyAnalyses.reduce((prev, current) => 
          prev.analysis.returnOnInvestment > current.analysis.returnOnInvestment ? prev : current
        );
        
        response += "\n**Analysis Summary**:\n";
        response += `• Best Cash Flow: ${bestCashFlow.property.address} at $${bestCashFlow.analysis.cashFlow.monthly.toLocaleString()}/month\n`;
        response += `• Best ROI: ${bestROI.property.address} at ${bestROI.analysis.returnOnInvestment}%\n\n`;
        
        if (bestCashFlow.property.id === bestROI.property.id) {
          response += `Overall, ${bestCashFlow.property.address} appears to be the strongest investment opportunity based on both cash flow and ROI.`;
        } else {
          response += `You have a trade-off decision: ${bestCashFlow.property.address} offers better cash flow, while ${bestROI.property.address} offers better long-term ROI.`;
        }
      }
      
      if (apiKeys.walkScore) {
        response += "\n\n**Walkability Comparison**\n\n";
        response += "I can also compare walkability scores for these properties. Would you like me to do that?";
      }
    }
    
    return response;
  }
  
  else if (lowerMessage.includes("set property") || 
           lowerMessage.includes("add property") || 
           lowerMessage.includes("new property")) {
    const priceMatch = message.match(/price(?:[\s:]+)?\$?([\d,]+)/i);
    const rentMatch = message.match(/rent(?:[\s:]+)?\$?([\d,]+)/i);
    const addressMatch = message.match(/address(?:[\s:]+)?(.+?)(?:,|\sin|$)/i);
    const cityMatch = message.match(/(?:in|,)\s*([^,]+)(?:,|\s+[A-Z]{2})/i);
    const stateMatch = message.match(/([A-Z]{2})(?:\s+\d{5}|\s*$|,)/);
    const zipMatch = message.match(/(\d{5})/);
    
    const newProperty: PropertyData = {
      id: Date.now().toString(),
      address: addressMatch ? addressMatch[1].trim() : "123 Sample St",
      city: cityMatch ? cityMatch[1].trim() : "Austin",
      state: stateMatch ? stateMatch[1].trim() : "TX",
      zipCode: zipMatch ? zipMatch[1].trim() : "78701",
      purchasePrice: priceMatch ? parseInt(priceMatch[1].replace(/,/g, "")) : 350000,
      monthlyRent: rentMatch ? parseInt(rentMatch[1].replace(/,/g, "")) : 2200,
      annualExpenses: {
        propertyTax: Math.round(0.012 * (priceMatch ? parseInt(priceMatch[1].replace(/,/g, "")) : 350000)),
        insurance: Math.round(0.005 * (priceMatch ? parseInt(priceMatch[1].replace(/,/g, "")) : 350000)),
        maintenance: Math.round(0.005 * (priceMatch ? parseInt(priceMatch[1].replace(/,/g, "")) : 350000)),
        propertyManagement: Math.round(0.1 * 12 * (rentMatch ? parseInt(rentMatch[1].replace(/,/g, "")) : 2200)),
        vacancy: Math.round(0.05 * 12 * (rentMatch ? parseInt(rentMatch[1].replace(/,/g, "")) : 2200)),
        other: 500
      },
      downPayment: Math.round(0.2 * (priceMatch ? parseInt(priceMatch[1].replace(/,/g, "")) : 350000)),
      interestRate: 5.5,
      loanTerm: 30
    };
    
    const analysis = mockDataService.calculatePropertyAnalysis(newProperty);
    
    setChatContext({
      ...chatContext,
      property: newProperty,
      analysis
    });
    
    response = `Great! I've set up a property at ${newProperty.address}, ${newProperty.city}, ${newProperty.state} ${newProperty.zipCode} with:\n\n`;
    response += `• Purchase Price: $${newProperty.purchasePrice.toLocaleString()}\n`;
    response += `• Monthly Rent: $${newProperty.monthlyRent.toLocaleString()}\n`;
    response += `• Down Payment: $${newProperty.downPayment.toLocaleString()} (${Math.round((newProperty.downPayment / newProperty.purchasePrice) * 100)}%)\n`;
    response += `• Loan Terms: ${newProperty.loanTerm} years at ${newProperty.interestRate}% interest\n\n`;
    
    response += "Would you like me to analyze this property, show market trends, or provide neighborhood insights?";
  }
  
  else if (lowerMessage.includes("add comparison") || 
           lowerMessage.includes("add to comparison") || 
           lowerMessage.includes("compare with")) {
    const baseProperty = chatContext.property || defaultPropertyData;
    
    const compProperty: PropertyData = {
      ...baseProperty,
      id: Date.now().toString(),
      address: baseProperty.address.replace(/\d+/, (match) => String(Number(match) + 100)),
      purchasePrice: Math.round(baseProperty.purchasePrice * (1 + (Math.random() * 0.2 - 0.1))),
      monthlyRent: Math.round(baseProperty.monthlyRent * (1 + (Math.random() * 0.2 - 0.1))),
      downPayment: Math.round(baseProperty.downPayment * (1 + (Math.random() * 0.2 - 0.1)))
    };
    
    setChatContext({
      ...chatContext,
      comparisonProperties: [...chatContext.comparisonProperties, compProperty]
    });
    
    response = `I've added a comparison property at ${compProperty.address} with:\n\n`;
    response += `• Purchase Price: $${compProperty.purchasePrice.toLocaleString()}\n`;
    response += `• Monthly Rent: $${compProperty.monthlyRent.toLocaleString()}\n`;
    response += `• Down Payment: $${compProperty.downPayment.toLocaleString()}\n\n`;
    
    response += "You can now use the 'compare properties' command to see a side-by-side comparison.";
  }
  
  else if (lowerMessage.includes("hello") || 
           lowerMessage.includes("hi") || 
           lowerMessage.includes("hey") || 
           lowerMessage.startsWith("help") || 
           lowerMessage.includes("what can you do")) {
    
    response = "👋 Hello! I'm RealtyWhisper, your real estate investment analysis assistant. Here's what I can help you with:\n\n";
    response += "• **Analyze a property** - I'll calculate key investment metrics like cap rate, cash flow, and ROI\n";
    response += "• **Show market trends** - I'll provide data on price trends, rent growth, and market conditions\n";
    response += "• **Neighborhood insights** - I'll share information about schools, safety, walkability, and demographics\n";
    response += "• **Compare properties** - I can help you compare multiple investment opportunities\n";
    response += "• **Property history** - I can look up property details and ownership history\n";
    response += "• **Walkability scores** - I can check walkability, transit, and bike scores\n";
    response += "• **Nearby amenities** - I can find schools, restaurants, and other points of interest\n\n";
    
    response += "To get started, try saying something like 'analyze property' or 'show me walkability scores for 123 Main St, Austin, TX'.";
  }
  
  else {
    response = "I'm sorry, I didn't quite understand that request. You can ask me to:\n\n";
    response += "• Analyze a property\n";
    response += "• Show market trends\n";
    response += "• Provide neighborhood insights\n";
    response += "• Check walkability scores\n";
    response += "• Find nearby amenities\n";
    response += "• Look up property history\n";
    response += "• Compare properties\n";
    response += "• Set up a new property\n\n";
    
    response += "For example, try saying 'analyze property' or 'show walkability score for 123 Main St, Austin TX'.";
  }
  
  return response;
};

const analyzeRealProperty = async (property: PropertyData): Promise<PropertyAnalysis> => {
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

const getMarketTrendResponse = (marketTrend: any) => {
  let response = '';
  response += `📈 **Median Home Price**: $${marketTrend.medianHomePrice.toLocaleString()} (${marketTrend.priceChange1Year > 0 ? '+' : ''}${marketTrend.priceChange1Year}% year-over-year)\n`;
  response += `🏠 **Median Rent**: $${marketTrend.medianRent.toLocaleString()} (${marketTrend.rentChange1Year > 0 ? '+' : ''}${marketTrend.rentChange1Year}% year-over-year)\n`;
  response += `⏱️ **Average Days on Market**: ${marketTrend.daysOnMarket} days\n`;
  response += `📊 **Inventory Change**: ${marketTrend.inventoryChange > 0 ? '+' : ''}${marketTrend.inventoryChange}% year-over-year\n\n`;
  
  if (marketTrend.priceChange1Year > 8) {
    response += "This is a hot seller's market with rapidly appreciating home values. Competition among buyers is likely high.";
  } else if (marketTrend.priceChange1Year > 3) {
    response += "This market is showing healthy appreciation, balancing opportunity for both buyers and sellers.";
  } else if (marketTrend.priceChange1Year > 0) {
    response += "This market is stable with modest appreciation, which may present good value opportunities.";
  } else {
    response += "This market is experiencing some price corrections, which could present buying opportunities but also carries risk.";
  }
  
  return response;
};

const formatNeighborhoodData = (neighborhoodData: NeighborhoodData) => {
  let response = '';
  response += `🏫 **School Rating**: ${neighborhoodData.schoolRating}/10\n`;
  response += `🔒 **Crime Rate**: ${neighborhoodData.crimeRate}\n`;
  response += `👟 **Walkability Score**: ${neighborhoodData.walkabilityScore}/100\n`;
  response += `🚌 **Transit Score**: ${neighborhoodData.transitScore}/100\n`;
  response += `👥 **Population**: ${neighborhoodData.population.toLocaleString()}\n`;
  response += `💰 **Median Income**: $${neighborhoodData.medianIncome.toLocaleString()}\n`;
  response += `💼 **Employment Rate**: ${neighborhoodData.employmentRate}%\n\n`;
  
  const insights = [];
  
  if (neighborhoodData.schoolRating >= 8) {
    insights.push("The high school ratings make this area attractive for families with children.");
  } else if (neighborhoodData.schoolRating < 5) {
    insights.push("Lower school ratings may affect demand from family renters and future resale value.");
  }
  
  if (neighborhoodData.walkabilityScore >= 80) {
    insights.push("The excellent walkability is a strong selling point, especially for urban renters.");
  } else if (neighborhoodData.walkabilityScore < 30) {
    insights.push("The car-dependent nature of this area may limit appeal to certain tenant groups.");
  }
  
  if (neighborhoodData.crimeRate === "Low") {
    insights.push("Low crime rates are a positive factor for property values and tenant attraction.");
  } else if (neighborhoodData.crimeRate === "High") {
    insights.push("Higher crime rates may impact tenant quality and property appreciation.");
  }
  
  if (insights.length > 0) {
    response += "**Key Insights**:\n";
    insights.forEach(insight => {
      response += `• ${insight}\n`;
    });
  }
  
  return response;
};

const formatPropertyAnalysis = (analysis: PropertyAnalysis): string => {
  let result = "**Financial Analysis**:\n\n";
  
  result += `📊 **Cap Rate**: ${analysis.capRate}%\n`;
  result += `💰 **Cash Flow**: $${analysis.cashFlow.monthly.toLocaleString()}/month ($${analysis.cashFlow.annual.toLocaleString()}/year)\n`;
  result += `💸 **Cash-on-Cash Return**: ${analysis.cashOnCashReturn}%\n`;
  result += `🏠 **Rent-to-Price Ratio**: ${analysis.rentToPrice}%\n`;
  result += `📈 **Return on Investment**: ${analysis.returnOnInvestment}%\n`;
  result += `⏱️ **Break-even Point**: ${Math.round(analysis.breakEvenPoint)} months\n\n`;
  
  const insights = [];
  
  if (analysis.capRate >= 8) {
    insights.push("The cap rate is excellent, indicating a strong income-generating property relative to its value.");
  } else if (analysis.capRate >= 5) {
    insights.push("The cap rate is solid, in line with what many investors target for rental properties.");
  } else {
    insights.push("The cap rate is on the lower side, which is common in appreciating markets but may indicate lower cash flow.");
  }
  
  if (analysis.cashFlow.monthly >= 500) {
    insights.push("This property has strong positive cash flow, providing good monthly income.");
  } else if (analysis.cashFlow.monthly >= 100) {
    insights.push("This property has modest positive cash flow, which helps buffer against vacancies and unexpected expenses.");
  } else if (analysis.cashFlow.monthly >= 0) {
    insights.push("This property approximately breaks even on cash flow, which is typical in some high-appreciation markets.");
  } else {
    insights.push("This property has negative cash flow, which can be sustainable only if you expect significant appreciation or can cover the shortfall comfortably.");
  }
  
  if (analysis.returnOnInvestment >= 15) {
    insights.push("The ROI is excellent, suggesting this could be a very profitable investment over time.");
  } else if (analysis.returnOnInvestment >= 10) {
    insights.push("The ROI is good, exceeding what many alternative investments might offer.");
  } else {
    insights.push("The ROI is moderate, which may still be attractive depending on your investment goals and risk tolerance.");
  }
  
  if (insights.length > 0) {
    result += "**Key Insights**:\n";
    insights.forEach(insight => {
      result += `• ${insight}\n`;
    });
  }
  
  return result;
};

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

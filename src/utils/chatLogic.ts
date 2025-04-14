
import { ChatMessage, NeighborhoodData, PropertyData, PropertyAnalysis } from "@/types";
import { mockDataService } from "@/services/mockDataService";

export type ChatContextType = {
  property: PropertyData | null;
  setProperty: (property: PropertyData | null) => void;
  analysis: PropertyAnalysis | null;
  comparisonProperties: PropertyData[];
  addComparisonProperty: (property: PropertyData) => void;
  removeComparisonProperty: (id: string) => void;
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

// Process user message and generate a response
export const processMessage = async (
  message: string,
  chatContext: ChatContextType,
  setChatContext: (context: ChatContextType) => void
): Promise<string> => {
  const lowerMessage = message.toLowerCase();
  let response = "";

  // Check for property info request
  if (lowerMessage.includes("analyze property") || 
      lowerMessage.includes("analyze this property") || 
      lowerMessage.includes("property analysis")) {
    
    if (!chatContext.property) {
      // Use default property if none is set
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
  
  // Check for market trends request
  else if (lowerMessage.includes("market trends") || 
           lowerMessage.includes("market data") || 
           lowerMessage.includes("price trends")) {
    
    const property = chatContext.property || defaultPropertyData;
    const marketTrend = mockDataService.getMarketTrends(property.city, property.state);
    
    response = `Here are the current market trends for ${property.city}, ${property.state}:\n\n`;
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
  }
  
  // Check for neighborhood insights request
  else if (lowerMessage.includes("neighborhood") || 
           lowerMessage.includes("schools") || 
           lowerMessage.includes("safety") || 
           lowerMessage.includes("walkability")) {
    
    const property = chatContext.property || defaultPropertyData;
    const neighborhoodData = mockDataService.getNeighborhoodData(property.zipCode, property.city, property.state);
    
    response = `Here are neighborhood insights for ${property.city}, ${property.state} ${property.zipCode}:\n\n`;
    response += `🏫 **School Rating**: ${neighborhoodData.schoolRating}/10\n`;
    response += `🔒 **Crime Rate**: ${neighborhoodData.crimeRate}\n`;
    response += `👟 **Walkability Score**: ${neighborhoodData.walkabilityScore}/100\n`;
    response += `🚌 **Transit Score**: ${neighborhoodData.transitScore}/100\n`;
    response += `👥 **Population**: ${neighborhoodData.population.toLocaleString()}\n`;
    response += `💰 **Median Income**: $${neighborhoodData.medianIncome.toLocaleString()}\n`;
    response += `💼 **Employment Rate**: ${neighborhoodData.employmentRate}%\n\n`;
    
    // Add some qualitative analysis
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
  }
  
  // Check for comparison request
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
        
        // Find the best property by cash flow
        const bestCashFlow = propertyAnalyses.reduce((prev, current) => 
          prev.analysis.cashFlow.monthly > current.analysis.cashFlow.monthly ? prev : current
        );
        
        // Find the best property by ROI
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
  
  // Check for property setup request
  else if (lowerMessage.includes("set property") || 
           lowerMessage.includes("add property") || 
           lowerMessage.includes("new property")) {
    
    // Parse basic property information from the message
    // This is a simplistic approach; a real bot would use more sophisticated parsing
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
        propertyTax: Math.round(0.012 * (priceMatch ? parseInt(priceMatch[1].replace(/,/g, "")) : 350000)), // Approximately 1.2% of purchase price
        insurance: Math.round(0.005 * (priceMatch ? parseInt(priceMatch[1].replace(/,/g, "")) : 350000)), // Approximately 0.5% of purchase price
        maintenance: Math.round(0.005 * (priceMatch ? parseInt(priceMatch[1].replace(/,/g, "")) : 350000)), // Approximately 0.5% of purchase price
        propertyManagement: Math.round(0.1 * 12 * (rentMatch ? parseInt(rentMatch[1].replace(/,/g, "")) : 2200)), // Approximately 10% of annual rent
        vacancy: Math.round(0.05 * 12 * (rentMatch ? parseInt(rentMatch[1].replace(/,/g, "")) : 2200)), // Approximately 5% of annual rent
        other: 500
      },
      downPayment: Math.round(0.2 * (priceMatch ? parseInt(priceMatch[1].replace(/,/g, "")) : 350000)), // Assuming 20% down payment
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
  
  // Check for add comparison property request
  else if (lowerMessage.includes("add comparison") || 
           lowerMessage.includes("add to comparison") || 
           lowerMessage.includes("compare with")) {
    
    // Create a variant property for comparison
    const baseProperty = chatContext.property || defaultPropertyData;
    
    // Create a slightly different property
    const compProperty: PropertyData = {
      ...baseProperty,
      id: Date.now().toString(),
      address: baseProperty.address.replace(/\d+/, (match) => String(Number(match) + 100)),
      purchasePrice: Math.round(baseProperty.purchasePrice * (1 + (Math.random() * 0.2 - 0.1))), // +/- 10%
      monthlyRent: Math.round(baseProperty.monthlyRent * (1 + (Math.random() * 0.2 - 0.1))), // +/- 10%
      downPayment: Math.round(baseProperty.downPayment * (1 + (Math.random() * 0.2 - 0.1))), // +/- 10%
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
  
  // General greeting or help request
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
    response += "• **Generate a report** - I can create a downloadable PDF report of the analysis\n\n";
    
    response += "To get started, try saying something like 'analyze a property' or 'set property at 123 Main St, Austin, TX with price $350,000 and rent $2,200'.";
  }
  
  // Default response if no specific intent is matched
  else {
    response = "I'm sorry, I didn't quite understand that request. You can ask me to:\n\n";
    response += "• Analyze a property\n";
    response += "• Show market trends\n";
    response += "• Provide neighborhood insights\n";
    response += "• Compare properties\n";
    response += "• Set up a new property\n\n";
    
    response += "For example, try saying 'analyze property' or 'show market trends'.";
  }
  
  return response;
};

// Format property analysis results into a readable message
const formatPropertyAnalysis = (analysis: PropertyAnalysis): string => {
  let result = "**Financial Analysis**:\n\n";
  
  result += `📊 **Cap Rate**: ${analysis.capRate}%\n`;
  result += `💰 **Cash Flow**: $${analysis.cashFlow.monthly.toLocaleString()}/month ($${analysis.cashFlow.annual.toLocaleString()}/year)\n`;
  result += `💸 **Cash-on-Cash Return**: ${analysis.cashOnCashReturn}%\n`;
  result += `🏠 **Rent-to-Price Ratio**: ${analysis.rentToPrice}%\n`;
  result += `📈 **Return on Investment**: ${analysis.returnOnInvestment}%\n`;
  result += `⏱️ **Break-even Point**: ${Math.round(analysis.breakEvenPoint)} months\n\n`;
  
  // Add some qualitative analysis
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

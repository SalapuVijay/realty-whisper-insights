
import { PropertyAnalysis, NeighborhoodData, PropertyData } from "@/types";

export const formatPropertyAnalysis = (analysis: PropertyAnalysis): string => {
  let result = "**Financial Analysis**:\n\n";
  
  result += `📊 **Cap Rate**: ${analysis.capRate}%\n`;
  result += `💰 **Cash Flow**: $${analysis.cashFlow.monthly.toLocaleString()}/month ($${analysis.cashFlow.annual.toLocaleString()}/year)\n`;
  result += `💸 **Cash-on-Cash Return**: ${analysis.cashOnCashReturn}%\n`;
  result += `🏠 **Rent-to-Price Ratio**: ${analysis.rentToPrice}%\n`;
  result += `📈 **Return on Investment**: ${analysis.returnOnInvestment}%\n`;
  result += `⏱️ **Break-even Point**: ${Math.round(analysis.breakEvenPoint)} months\n\n`;
  
  const insights = getPropertyAnalysisInsights(analysis);
  
  if (insights.length > 0) {
    result += "**Key Insights**:\n";
    insights.forEach(insight => {
      result += `• ${insight}\n`;
    });
  }
  
  return result;
};

export const formatNeighborhoodData = (neighborhoodData: NeighborhoodData): string => {
  let response = '';
  response += `🏫 **School Rating**: ${neighborhoodData.schoolRating}/10\n`;
  response += `🔒 **Crime Rate**: ${neighborhoodData.crimeRate}\n`;
  response += `👟 **Walkability Score**: ${neighborhoodData.walkabilityScore}/100\n`;
  response += `🚌 **Transit Score**: ${neighborhoodData.transitScore}/100\n`;
  response += `👥 **Population**: ${neighborhoodData.population.toLocaleString()}\n`;
  response += `💰 **Median Income**: $${neighborhoodData.medianIncome.toLocaleString()}\n`;
  response += `💼 **Employment Rate**: ${neighborhoodData.employmentRate}%\n\n`;
  
  const insights = getNeighborhoodInsights(neighborhoodData);
  
  if (insights.length > 0) {
    response += "**Key Insights**:\n";
    insights.forEach(insight => {
      response += `• ${insight}\n`;
    });
  }
  
  return response;
};

const getPropertyAnalysisInsights = (analysis: PropertyAnalysis): string[] => {
  const insights: string[] = [];
  
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
  
  return insights;
};

const getNeighborhoodInsights = (neighborhoodData: NeighborhoodData): string[] => {
  const insights: string[] = [];
  
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
  
  return insights;
};

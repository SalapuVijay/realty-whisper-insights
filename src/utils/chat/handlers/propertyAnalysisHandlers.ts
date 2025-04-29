
import { ChatContextType } from "../types";
import { PropertyData } from "@/types";
import { mockDataService } from "@/services/mockDataService";
import { formatPropertyAnalysis } from "../formatters";

export async function handlePropertyAnalysis(
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

export function formatNewPropertyResponse(property: PropertyData): string {
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

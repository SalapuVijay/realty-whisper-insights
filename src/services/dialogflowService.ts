
/**
 * Service to interact with Dialogflow for natural language processing
 */

interface DialogflowResponse {
  fulfillmentText: string;
  intent: {
    displayName: string;
    confidence: number;
  };
  parameters: Record<string, any>;
}

export const processWithDialogflow = async (
  message: string
): Promise<DialogflowResponse> => {
  const apiKey = localStorage.getItem("dialogflow_api_key");

  if (!apiKey) {
    throw new Error("Dialogflow API key is required");
  }

  try {
    // This would be a real API call in production
    console.log(`Processing message with Dialogflow: ${message}`);

    // Mock response for demonstration
    return mockDialogflowProcess(message);
  } catch (error) {
    console.error("Error processing message with Dialogflow:", error);
    throw error;
  }
};

// Mock Dialogflow processing
const mockDialogflowProcess = (message: string): DialogflowResponse => {
  let intent = "Default";
  let confidence = 0.8;
  let parameters: Record<string, any> = {};
  let fulfillmentText = "I'm not sure how to respond to that.";

  // Simple intent matching based on keywords
  if (message.toLowerCase().includes("property") && message.toLowerCase().includes("find")) {
    intent = "FindProperty";
    confidence = 0.92;
    
    // Extract location if present
    const locationMatch = message.match(/in\s+([a-zA-Z\s,]+)/i);
    const location = locationMatch ? locationMatch[1].trim() : "";
    
    parameters = { location };
    fulfillmentText = location 
      ? `I'll help you find properties in ${location}.` 
      : "I can help you find properties. Could you specify a location?";
  } 
  else if (message.toLowerCase().includes("cap rate") || message.toLowerCase().includes("calculate")) {
    intent = "CalculateMetrics";
    confidence = 0.88;
    parameters = { metric: "cap_rate" };
    fulfillmentText = "To calculate cap rate, divide the net operating income (NOI) by the property value. For example, if a property's NOI is $20,000 and it's valued at $250,000, the cap rate is 8%.";
  }
  else if (message.toLowerCase().includes("walk") && message.toLowerCase().includes("score")) {
    intent = "GetWalkScore";
    confidence = 0.95;
    
    const locationMatch = message.match(/for\s+([a-zA-Z\s,]+)/i);
    const location = locationMatch ? locationMatch[1].trim() : "";
    
    parameters = { location };
    fulfillmentText = location 
      ? `The Walk Score measures the walkability of a location based on its distance to amenities. I'll check the Walk Score for ${location}.` 
      : "Walk Score measures the walkability of a location. Which area would you like me to analyze?";
  }

  return {
    fulfillmentText,
    intent: {
      displayName: intent,
      confidence
    },
    parameters
  };
};

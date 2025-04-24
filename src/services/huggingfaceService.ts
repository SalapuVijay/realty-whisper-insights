import { ChatMessage } from "@/types";

// Define the response type from HuggingFace API
interface HuggingFaceResponse {
  generated_text: string;
}

// Define real estate related keywords to check if query is in scope
const REAL_ESTATE_KEYWORDS = [
  'property', 'house', 'home', 'apartment', 'condo', 'real estate', 'mortgage',
  'investment', 'rent', 'buy', 'sell', 'market', 'value', 'price', 'loan', 
  'interest rate', 'down payment', 'agent', 'broker', 'closing', 'escrow',
  'listing', 'appraisal', 'equity', 'foreclosure', 'walkability', 'neighborhood',
  'location', 'school', 'tax', 'insurance', 'HOA', 'multifamily', 'commercial',
  'residential', 'duplex', 'townhouse', 'land', 'zoning', 'ROI', 'cap rate',
  'cash flow', 'appreciation', 'depreciation', 'tenant', 'landlord', 'lease',
  'rental', 'amenities', 'kitchen', 'bathroom', 'bedroom', 'square feet', 'sqft'
];

/**
 * Determines if a query is related to real estate topics
 * @param query The user's query text
 * @returns Boolean indicating if the query is in scope
 */
const isQueryInScope = (query: string): boolean => {
  const lowercaseQuery = query.toLowerCase();
  // Check if query contains any real estate related keywords
  return REAL_ESTATE_KEYWORDS.some(keyword => 
    lowercaseQuery.includes(keyword.toLowerCase())
  );
};

export const generateChatResponse = async (
  messages: ChatMessage[],
  apiKey: string | null
): Promise<string> => {
  if (!apiKey) {
    console.warn("HuggingFace API key not provided, using fallback response");
    return "I need a valid API key to provide natural language responses. Please add your HuggingFace API key in the settings.";
  }

  try {
    // Get the last user message
    const lastUserMessage = messages.filter(msg => msg.role === 'user').pop()?.content || "";
    
    // Check if the query is in scope
    if (!isQueryInScope(lastUserMessage)) {
      return "I'm sorry, but your question appears to be outside the scope of real estate market analysis. I'm specifically trained to help with property investments, market trends, valuations, neighborhood analysis, and other real estate topics. Could you please ask something related to real estate?";
    }
    
    // Format the messages into a context that DialoGPT can understand
    const recentMessages = messages.slice(-5); // Take last 5 messages for context
    const context = recentMessages
      .map(msg => `${msg.role === 'user' ? 'Human' : 'AI'}: ${msg.content}`)
      .join('\n');
    
    // Add system instruction to keep responses real estate focused
    const systemInstruction = "You are RealtyWhisper, an AI specialized in real estate market analysis. Only answer questions related to real estate, property investment, market trends, and neighborhood analysis. Be helpful, accurate, and concise.";
    
    // Call the HuggingFace API (DialoGPT-medium model)
    const response = await fetch(
      "https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: {
            text: systemInstruction + "\n\n" + context + "\nHuman: " + lastUserMessage + "\nAI:",
          },
          parameters: {
            max_length: 1000,
            temperature: 0.7,
            top_p: 0.9,
            top_k: 50,
            repetition_penalty: 1.2
          }
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("HuggingFace API error:", error);
      throw new Error(`HuggingFace API error: ${response.status}`);
    }

    const data = await response.json() as HuggingFaceResponse;
    
    // Clean up and format the response
    let generatedText = data.generated_text.trim();
    
    // Sometimes the model might include the "AI:" prefix in the response, remove it
    if (generatedText.startsWith("AI:")) {
      generatedText = generatedText.substring(3).trim();
    }
    
    return generatedText;
  } catch (error) {
    console.error("Error calling HuggingFace API:", error);
    return "I'm having trouble connecting to my language model right now. Let me use my built-in responses instead. How can I help you with real estate market analysis today?";
  }
};

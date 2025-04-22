
import { ChatMessage } from "@/types";

// Define the response type from HuggingFace API
interface HuggingFaceResponse {
  generated_text: string;
}

export const generateChatResponse = async (
  messages: ChatMessage[],
  apiKey: string | null
): Promise<string> => {
  if (!apiKey) {
    console.warn("HuggingFace API key not provided, using fallback response");
    return "I need a valid API key to provide natural language responses. Please add your HuggingFace API key in the settings.";
  }

  try {
    // Format the messages into a context that DialoGPT can understand
    const recentMessages = messages.slice(-5); // Take last 5 messages for context
    const context = recentMessages
      .map(msg => `${msg.role === 'user' ? 'Human' : 'AI'}: ${msg.content}`)
      .join('\n');
    
    const lastUserMessage = messages.filter(msg => msg.role === 'user').pop()?.content || "";
    
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
            text: context + "\nHuman: " + lastUserMessage + "\nAI:",
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
    return data.generated_text.trim();
  } catch (error) {
    console.error("Error calling HuggingFace API:", error);
    return "I'm having trouble connecting to my language model. Let me use my built-in responses instead.";
  }
};

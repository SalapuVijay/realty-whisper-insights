/**
 * Utility functions to manage API keys and services
 */

export const checkRequiredApiKeys = (): { 
  hasAllKeys: boolean; 
  missingKeys: string[];
} => {
  const mashvisorApiKey = localStorage.getItem("mashvisor_api_key");
  const zillowApiKey = localStorage.getItem("zillow_api_key");
  const realtorApiKey = localStorage.getItem("realtor_api_key");
  const googleMapsApiKey = localStorage.getItem("google_maps_api_key");
  const walkScoreApiKey = localStorage.getItem("walkscore_api_key");
  const dialogflowApiKey = localStorage.getItem("dialogflow_api_key");
  const huggingfaceApiKey = localStorage.getItem("huggingface_api_key");
  const estatedApiKey = localStorage.getItem("estated_api_key");
  
  const missingKeys = [];
  if (!mashvisorApiKey) missingKeys.push("Mashvisor");
  if (!zillowApiKey) missingKeys.push("Zillow");
  if (!realtorApiKey) missingKeys.push("Realtor.com");
  if (!googleMapsApiKey) missingKeys.push("Google Maps");
  if (!walkScoreApiKey) missingKeys.push("Walk Score");
  if (!dialogflowApiKey) missingKeys.push("Dialogflow");
  if (!huggingfaceApiKey) missingKeys.push("HuggingFace");
  if (!estatedApiKey) missingKeys.push("Estated");
  
  return {
    hasAllKeys: missingKeys.length === 0,
    missingKeys
  };
};

export const getApiKeyStatus = (): Record<string, boolean> => {
  return {
    mashvisor: !!localStorage.getItem("mashvisor_api_key"),
    zillow: !!localStorage.getItem("zillow_api_key"),
    realtor: !!localStorage.getItem("realtor_api_key"),
    googleMaps: !!localStorage.getItem("google_maps_api_key"),
    walkScore: !!localStorage.getItem("walkscore_api_key"),
    dialogflow: !!localStorage.getItem("dialogflow_api_key"),
    huggingface: !!localStorage.getItem("huggingface_api_key"),
    estated: !!localStorage.getItem("estated_api_key")
  };
};

// Helper to securely get API keys
export const getApiKey = (service: string): string | null => {
  const keyMap: Record<string, string> = {
    "mashvisor": "mashvisor_api_key",
    "zillow": "zillow_api_key",
    "realtor": "realtor_api_key",
    "googleMaps": "google_maps_api_key",
    "walkScore": "walkscore_api_key",
    "dialogflow": "dialogflow_api_key",
    "huggingface": "huggingface_api_key",
    "estated": "estated_api_key"
  };
  
  const storageKey = keyMap[service];
  if (!storageKey) return null;
  
  return localStorage.getItem(storageKey);
};

// Get all API keys at once
export const getAllApiKeys = () => {
  return {
    mashvisor: localStorage.getItem("mashvisor_api_key"),
    zillow: localStorage.getItem("zillow_api_key"),
    realtor: localStorage.getItem("realtor_api_key"),
    googleMaps: localStorage.getItem("google_maps_api_key"),
    walkScore: localStorage.getItem("walkscore_api_key"),
    dialogflow: localStorage.getItem("dialogflow_api_key"),
    huggingface: localStorage.getItem("huggingface_api_key"),
    estated: localStorage.getItem("estated_api_key")
  };
};

export const saveGoogleMapsApiKey = (apiKey: string) => {
  // Basic validation to ensure it looks like a Google Maps API key
  const googleMapsApiKeyRegex = /^AIza[A-Za-z0-9_-]{35}$/;
  
  if (googleMapsApiKeyRegex.test(apiKey)) {
    localStorage.setItem("google_maps_api_key", apiKey);
    return true;
  } else {
    console.error("Invalid Google Maps API key format");
    return false;
  }
};


export function getDefaultResponse(): string {
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

export function extractLocationData(message: string): {
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
} {
  const addressMatch = message.match(/address(?:[\s:]+)?(.+?)(?:,|\sin|$)/i);
  const cityMatch = message.match(/(?:in|,)\s*([^,]+)(?:,|\s+[A-Z]{2})/i);
  const stateMatch = message.match(/([A-Z]{2})(?:\s+\d{5}|\s*$|,)/);
  const zipMatch = message.match(/(\d{5})/);

  return {
    address: addressMatch?.[1].trim(),
    city: cityMatch?.[1].trim(),
    state: stateMatch?.[1].trim(),
    zip: zipMatch?.[1]
  };
}

export function extractPriceAndRent(message: string): {
  price: number | null;
  rent: number | null;
} {
  const priceMatch = message.match(/price(?:[\s:]+)?\$?([\d,]+)/i);
  const rentMatch = message.match(/rent(?:[\s:]+)?\$?([\d,]+)/i);

  return {
    price: priceMatch ? parseInt(priceMatch[1].replace(/,/g, "")) : null,
    rent: rentMatch ? parseInt(rentMatch[1].replace(/,/g, "")) : null
  };
}


interface WalkScoreResponse {
  status: number;
  walkscore: number;
  description: string;
  updated: string;
  transit?: {
    score: number;
    description: string;
    summary: string;
  };
  bike?: {
    score: number;
    description: string;
  };
  logo_url: string;
  more_info_link: string;
}

export interface WalkScoreData {
  walkScore: number;
  walkScoreDescription: string;
  transitScore?: number;
  transitScoreDescription?: string;
  transitSummary?: string;
  bikeScore?: number;
  bikeScoreDescription?: string;
  moreInfoLink?: string;
}

export const getWalkScore = async (
  latitude: number,
  longitude: number,
  address: string,
  apiKey: string | null
): Promise<WalkScoreData | null> => {
  if (!apiKey) {
    console.warn("Walk Score API key not provided");
    return null;
  }

  try {
    const formattedAddress = encodeURIComponent(address);
    
    const response = await fetch(
      `https://api.walkscore.com/score?format=json&address=${formattedAddress}&lat=${latitude}&lon=${longitude}&transit=1&bike=1&wsapikey=${apiKey}`,
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      throw new Error(`Walk Score API error: ${response.status}`);
    }

    const data = await response.json() as WalkScoreResponse;
    
    if (data.status !== 1) {
      throw new Error(`Walk Score API returned status: ${data.status}`);
    }
    
    return {
      walkScore: data.walkscore,
      walkScoreDescription: data.description,
      transitScore: data.transit?.score,
      transitScoreDescription: data.transit?.description,
      transitSummary: data.transit?.summary,
      bikeScore: data.bike?.score,
      bikeScoreDescription: data.bike?.description,
      moreInfoLink: data.more_info_link
    };
  } catch (error) {
    console.error("Error calling Walk Score API:", error);
    return null;
  }
};

/**
 * Converts numeric walk score to a descriptive rating
 * @param score The numeric walk score (0-100)
 * @returns A string rating like "Excellent", "Good", etc.
 */
export const getWalkScoreRating = (score: number | undefined): string => {
  if (score === undefined) return "Not Available";
  
  if (score >= 90) return "Walker's Paradise";
  if (score >= 70) return "Very Walkable";
  if (score >= 50) return "Somewhat Walkable";
  if (score >= 25) return "Car-Dependent";
  return "Car-Dependent (Almost All Errands Require a Car)";
};

/**
 * Formats walk score data into a markdown string for chat display
 */
export const formatWalkScoreForChat = (walkScoreData: WalkScoreData | null): string => {
  if (!walkScoreData) {
    return "Walk Score data is not available for this location.";
  }
  
  let result = `## Walkability Analysis\n\n`;
  result += `### Walk Score: ${walkScoreData.walkScore}/100 - ${walkScoreData.walkScoreDescription}\n\n`;
  
  if (walkScoreData.transitScore) {
    result += `### Transit Score: ${walkScoreData.transitScore}/100 - ${walkScoreData.transitScoreDescription || ''}\n`;
    if (walkScoreData.transitSummary) {
      result += `${walkScoreData.transitSummary}\n\n`;
    }
  }
  
  if (walkScoreData.bikeScore) {
    result += `### Bike Score: ${walkScoreData.bikeScore}/100 - ${walkScoreData.bikeScoreDescription || ''}\n\n`;
  }
  
  if (walkScoreData.moreInfoLink) {
    result += `[More detailed information](${walkScoreData.moreInfoLink})\n\n`;
  }
  
  return result;
};


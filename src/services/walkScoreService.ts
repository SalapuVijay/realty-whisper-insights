
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
  bikeScore?: number;
  bikeScoreDescription?: string;
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
      bikeScore: data.bike?.score,
      bikeScoreDescription: data.bike?.description
    };
  } catch (error) {
    console.error("Error calling Walk Score API:", error);
    return null;
  }
};

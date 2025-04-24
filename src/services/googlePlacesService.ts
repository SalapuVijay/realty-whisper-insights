
interface NearbyPlace {
  name: string;
  type: string;
  rating?: number;
  vicinity: string;
  distance?: number;
}

export const getNearbyPlaces = async (
  latitude: number,
  longitude: number,
  type: string,
  radius: number = 1000,
  apiKey: string | null
): Promise<NearbyPlace[]> => {
  if (!apiKey) {
    console.warn("Google Places API key not provided");
    return [];
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=${type}&key=${apiKey}`,
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      throw new Error(`Google Places API returned status: ${data.status}`);
    }

    return (data.results || []).map((place: any) => ({
      name: place.name,
      type: place.types[0],
      rating: place.rating,
      vicinity: place.vicinity,
      distance: calculateDistance(
        latitude,
        longitude,
        place.geometry.location.lat,
        place.geometry.location.lng
      ),
    }));
  } catch (error) {
    console.error("Error calling Google Places API:", error);
    return [];
  }
};

/**
 * Formats nearby places data into a markdown string for chat display
 */
export const formatNearbyPlacesForChat = (places: NearbyPlace[]): string => {
  if (places.length === 0) {
    return "No nearby places found.";
  }

  let result = `## Nearby Places\n\n`;
  
  const groupedPlaces = places.reduce((acc: { [key: string]: NearbyPlace[] }, place) => {
    if (!acc[place.type]) {
      acc[place.type] = [];
    }
    acc[place.type].push(place);
    return acc;
  }, {});

  Object.entries(groupedPlaces).forEach(([type, places]) => {
    result += `### ${capitalizeFirstLetter(type.replace('_', ' '))}\n`;
    places.forEach(place => {
      result += `- ${place.name} (${place.distance?.toFixed(1)} km)`;
      if (place.rating) {
        result += ` - Rating: ${place.rating}/5`;
      }
      result += `\n  ${place.vicinity}\n`;
    });
    result += '\n';
  });

  return result;
};

// Helper functions
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (value: number): number => {
  return (value * Math.PI) / 180;
};

const capitalizeFirstLetter = (string: string): string => {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};

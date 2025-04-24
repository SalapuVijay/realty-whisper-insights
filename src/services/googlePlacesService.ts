
interface NearbyPlace {
  name: string;
  type: string;
  rating?: number;
  vicinity: string;
  distance?: number;
}

interface CategorizedPlaces {
  schools: NearbyPlace[];
  restaurants: NearbyPlace[];
  shopping: NearbyPlace[];
  healthcare: NearbyPlace[];
  parks: NearbyPlace[];
  transportation: NearbyPlace[];
  other: NearbyPlace[];
}

export const getNearbyPlaces = async (
  latitude: number,
  longitude: number,
  apiKey: string | null,
  radius: number = 1000,
  types: string[] = ["school", "restaurant", "store", "hospital", "park", "transit_station"]
): Promise<CategorizedPlaces> => {
  if (!apiKey) {
    console.warn("Google Places API key not provided");
    return {
      schools: [],
      restaurants: [],
      shopping: [],
      healthcare: [],
      parks: [],
      transportation: [],
      other: []
    };
  }

  const result: CategorizedPlaces = {
    schools: [],
    restaurants: [],
    shopping: [],
    healthcare: [],
    parks: [],
    transportation: [],
    other: []
  };

  try {
    // Get results for each place type
    for (const type of types) {
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

      const places = (data.results || []).map((place: any) => ({
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

      // Categorize the places based on their type
      places.forEach((place: NearbyPlace) => {
        if (place.type === "school" || place.type === "university") {
          result.schools.push(place);
        } else if (place.type === "restaurant" || place.type === "cafe" || place.type === "bar") {
          result.restaurants.push(place);
        } else if (place.type === "store" || place.type === "shopping_mall" || place.type === "supermarket") {
          result.shopping.push(place);
        } else if (place.type === "hospital" || place.type === "doctor" || place.type === "pharmacy") {
          result.healthcare.push(place);
        } else if (place.type === "park" || place.type === "campground" || place.type === "natural_feature") {
          result.parks.push(place);
        } else if (place.type === "transit_station" || place.type === "bus_station" || place.type === "train_station" || place.type === "subway_station") {
          result.transportation.push(place);
        } else {
          result.other.push(place);
        }
      });
    }

    return result;
  } catch (error) {
    console.error("Error calling Google Places API:", error);
    return {
      schools: [],
      restaurants: [],
      shopping: [],
      healthcare: [],
      parks: [],
      transportation: [],
      other: []
    };
  }
};

/**
 * Formats nearby places data into a markdown string for chat display
 */
export const formatNearbyPlacesForChat = (places: CategorizedPlaces): string => {
  if (Object.values(places).every(group => group.length === 0)) {
    return "No nearby places found.";
  }

  let result = `## Nearby Places\n\n`;
  
  if (places.schools.length > 0) {
    result += `### Schools\n`;
    places.schools.forEach(place => {
      result += `- ${place.name} (${place.distance?.toFixed(1)} km)`;
      if (place.rating) {
        result += ` - Rating: ${place.rating}/5`;
      }
      result += `\n  ${place.vicinity}\n`;
    });
    result += '\n';
  }
  
  if (places.restaurants.length > 0) {
    result += `### Restaurants & Cafes\n`;
    places.restaurants.forEach(place => {
      result += `- ${place.name} (${place.distance?.toFixed(1)} km)`;
      if (place.rating) {
        result += ` - Rating: ${place.rating}/5`;
      }
      result += `\n  ${place.vicinity}\n`;
    });
    result += '\n';
  }
  
  if (places.shopping.length > 0) {
    result += `### Shopping\n`;
    places.shopping.forEach(place => {
      result += `- ${place.name} (${place.distance?.toFixed(1)} km)`;
      if (place.rating) {
        result += ` - Rating: ${place.rating}/5`;
      }
      result += `\n  ${place.vicinity}\n`;
    });
    result += '\n';
  }
  
  if (places.healthcare.length > 0) {
    result += `### Healthcare\n`;
    places.healthcare.forEach(place => {
      result += `- ${place.name} (${place.distance?.toFixed(1)} km)`;
      if (place.rating) {
        result += ` - Rating: ${place.rating}/5`;
      }
      result += `\n  ${place.vicinity}\n`;
    });
    result += '\n';
  }
  
  if (places.parks.length > 0) {
    result += `### Parks & Recreation\n`;
    places.parks.forEach(place => {
      result += `- ${place.name} (${place.distance?.toFixed(1)} km)`;
      if (place.rating) {
        result += ` - Rating: ${place.rating}/5`;
      }
      result += `\n  ${place.vicinity}\n`;
    });
    result += '\n';
  }
  
  if (places.transportation.length > 0) {
    result += `### Transportation\n`;
    places.transportation.forEach(place => {
      result += `- ${place.name} (${place.distance?.toFixed(1)} km)`;
      if (place.rating) {
        result += ` - Rating: ${place.rating}/5`;
      }
      result += `\n  ${place.vicinity}\n`;
    });
    result += '\n';
  }

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


export interface NearbyPlace {
  name: string;
  type: string;
  vicinity: string;
  rating?: number;
  user_ratings_total?: number;
  distance?: number;
}

export interface NearbyPlaces {
  schools: NearbyPlace[];
  restaurants: NearbyPlace[];
  shopping: NearbyPlace[];
  healthcare: NearbyPlace[];
  parks: NearbyPlace[];
  transportation: NearbyPlace[];
}

export const getNearbyPlaces = async (
  latitude: number,
  longitude: number,
  apiKey: string | null
): Promise<NearbyPlaces | null> => {
  if (!apiKey) {
    console.warn("Google Places API key not provided");
    return null;
  }

  const placeTypes = {
    schools: ["school", "university"],
    restaurants: ["restaurant", "cafe", "bar"],
    shopping: ["shopping_mall", "store", "supermarket"],
    healthcare: ["hospital", "doctor", "pharmacy"],
    parks: ["park", "playground"],
    transportation: ["bus_station", "subway_station", "train_station"]
  };

  const results: NearbyPlaces = {
    schools: [],
    restaurants: [],
    shopping: [],
    healthcare: [],
    parks: [],
    transportation: []
  };

  try {
    // Make parallel requests for each place type
    const promises = Object.entries(placeTypes).map(async ([category, types]) => {
      const placesForCategory = [];
      
      // We might need to make multiple requests for different types in each category
      for (const type of types) {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=1500&type=${type}&key=${apiKey}`,
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
        
        // Process the results
        const places = data.results || [];
        for (const place of places) {
          placesForCategory.push({
            name: place.name,
            type: type,
            vicinity: place.vicinity,
            rating: place.rating,
            user_ratings_total: place.user_ratings_total
          });
        }
      }
      
      // Sort by rating (if available)
      placesForCategory.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      
      // Take top 5 results
      results[category as keyof NearbyPlaces] = placesForCategory.slice(0, 5);
    });

    await Promise.all(promises);
    return results;
  } catch (error) {
    console.error("Error calling Google Places API:", error);
    return null;
  }
};

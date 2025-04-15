
import React, { useEffect, useRef } from 'react';
import { PropertyData } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Map } from 'lucide-react';

interface GoogleMapViewProps {
  property: PropertyData | null;
}

const GoogleMapView = ({ property }: GoogleMapViewProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapsApiKey = localStorage.getItem("google_maps_api_key");

  useEffect(() => {
    if (!property || !googleMapsApiKey || !mapRef.current) return;

    // This is a mock implementation since we can't actually load Google Maps in this context
    const loadGoogleMapsScript = () => {
      try {
        // This would normally load the Google Maps API
        console.log("Loading Google Maps with API key", googleMapsApiKey);
        
        // Mock map initialization
        if (mapRef.current) {
          mapRef.current.innerHTML = `
            <div class="w-full h-full bg-gray-200/50 flex items-center justify-center rounded-lg">
              <div class="text-center p-4">
                <div class="w-16 h-16 mx-auto mb-2 rounded-full bg-blue-50 flex items-center justify-center">
                  <Map className="h-8 w-8 text-blue-500" />
                </div>
                <p class="text-sm text-gray-600">Map would display here with property at:</p>
                <p class="font-medium text-realty-700">${property.address}</p>
              </div>
            </div>
          `;
        }
      } catch (error) {
        console.error("Error loading Google Maps:", error);
      }
    };

    loadGoogleMapsScript();
  }, [property, googleMapsApiKey]);

  if (!property) {
    return null;
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="py-3">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Map className="h-4 w-4 text-blue-500" />
          Property Location
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {!googleMapsApiKey ? (
          <Alert variant="destructive" className="mx-4 mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Google Maps API key is required to display the map. Please add your API key in settings.
            </AlertDescription>
          </Alert>
        ) : (
          <div ref={mapRef} className="w-full h-[200px] rounded-b-lg" />
        )}
      </CardContent>
    </Card>
  );
};

export default GoogleMapView;


import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PropertyData } from "@/types";
import { mockDataService } from "@/services/mockDataService";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface NeighborhoodPanelProps {
  property: PropertyData | null;
}

const NeighborhoodPanel = ({ property }: NeighborhoodPanelProps) => {
  const [neighborhoodData, setNeighborhoodData] = useState<any | null>(null);
  
  useEffect(() => {
    if (property) {
      const data = mockDataService.getNeighborhoodData(property.zipCode, property.city, property.state);
      setNeighborhoodData(data);
    } else {
      setNeighborhoodData(null);
    }
  }, [property]);

  if (!property || !neighborhoodData) {
    return (
      <Card className="col-span-1 min-h-[300px]">
        <CardHeader>
          <CardTitle>Neighborhood Insights</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <p className="text-muted-foreground text-center">
            No property has been selected yet. <br />
            Set a property to see neighborhood insights.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Neighborhood Insights</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-secondary/50 p-3 rounded-lg">
            <p className="text-muted-foreground text-xs">Population</p>
            <p className="text-base font-semibold">{neighborhoodData.population.toLocaleString()}</p>
          </div>
          
          <div className="bg-secondary/50 p-3 rounded-lg">
            <p className="text-muted-foreground text-xs">Median Income</p>
            <p className="text-base font-semibold">${neighborhoodData.medianIncome.toLocaleString()}</p>
          </div>
        </div>
        
        {/* School Rating */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs text-muted-foreground">School Rating</p>
            <p className={cn(
              "text-xs font-medium",
              neighborhoodData.schoolRating >= 7 ? "text-green-600" : 
              neighborhoodData.schoolRating >= 5 ? "text-amber-600" : "text-red-600"
            )}>
              {neighborhoodData.schoolRating}/10
            </p>
          </div>
          <Progress 
            value={neighborhoodData.schoolRating * 10} 
            className="h-2"
            indicatorClassName={cn(
              neighborhoodData.schoolRating >= 7 ? "bg-green-600" : 
              neighborhoodData.schoolRating >= 5 ? "bg-amber-600" : "bg-red-600"
            )}
          />
          <p className="text-xs mt-1 text-muted-foreground">
            {neighborhoodData.schoolRating >= 7 
              ? "Excellent school district" 
              : neighborhoodData.schoolRating >= 5 
                ? "Average school quality" 
                : "Below average schools"}
          </p>
        </div>
        
        {/* Walkability Score */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs text-muted-foreground">Walkability</p>
            <p className={cn(
              "text-xs font-medium",
              neighborhoodData.walkabilityScore >= 70 ? "text-green-600" : 
              neighborhoodData.walkabilityScore >= 40 ? "text-amber-600" : "text-red-600"
            )}>
              {neighborhoodData.walkabilityScore}/100
            </p>
          </div>
          <Progress 
            value={neighborhoodData.walkabilityScore} 
            className="h-2"
            indicatorClassName={cn(
              neighborhoodData.walkabilityScore >= 70 ? "bg-green-600" : 
              neighborhoodData.walkabilityScore >= 40 ? "bg-amber-600" : "bg-red-600"
            )}
          />
          <p className="text-xs mt-1 text-muted-foreground">
            {neighborhoodData.walkabilityScore >= 70 
              ? "Very walkable area" 
              : neighborhoodData.walkabilityScore >= 40 
                ? "Somewhat walkable" 
                : "Car-dependent area"}
          </p>
        </div>
        
        {/* Transit Score */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs text-muted-foreground">Transit</p>
            <p className={cn(
              "text-xs font-medium",
              neighborhoodData.transitScore >= 70 ? "text-green-600" : 
              neighborhoodData.transitScore >= 40 ? "text-amber-600" : "text-red-600"
            )}>
              {neighborhoodData.transitScore}/100
            </p>
          </div>
          <Progress 
            value={neighborhoodData.transitScore} 
            className="h-2"
            indicatorClassName={cn(
              neighborhoodData.transitScore >= 70 ? "bg-green-600" : 
              neighborhoodData.transitScore >= 40 ? "bg-amber-600" : "bg-red-600"
            )}
          />
          <p className="text-xs mt-1 text-muted-foreground">
            {neighborhoodData.transitScore >= 70 
              ? "Excellent public transit" 
              : neighborhoodData.transitScore >= 40 
                ? "Some public transit options" 
                : "Limited public transportation"}
          </p>
        </div>
        
        {/* Crime Rate */}
        <div className="border-t pt-3">
          <p className="text-xs text-muted-foreground mb-1">Crime Rate:</p>
          <p className={cn(
            "text-sm font-medium",
            neighborhoodData.crimeRate === "Low" ? "text-green-600" : 
            neighborhoodData.crimeRate === "Moderate" ? "text-amber-600" : "text-red-600"
          )}>
            {neighborhoodData.crimeRate}
          </p>
          <p className="text-xs mt-1 text-muted-foreground">
            {neighborhoodData.crimeRate === "Low" 
              ? "Lower than average crime rate for the region" 
              : neighborhoodData.crimeRate === "Moderate" 
                ? "Average crime rate for the region" 
                : "Higher than average crime rate for the region"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default NeighborhoodPanel;


import React, { useEffect, useState } from 'react';
import { PropertyData } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Home, Walking, Bike, Bus } from 'lucide-react';

interface WalkScoreWidgetProps {
  property: PropertyData | null;
}

interface ScoreData {
  walkScore: number;
  transitScore: number;
  bikeScore: number;
}

const WalkScoreWidget = ({ property }: WalkScoreWidgetProps) => {
  const [scores, setScores] = useState<ScoreData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const walkScoreApiKey = localStorage.getItem("walkscore_api_key");

  useEffect(() => {
    if (!property || !walkScoreApiKey) return;

    const fetchWalkScore = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // This would be a real API call in production
        console.log("Fetching Walk Score data for", property.address);
        
        // Mock data for demonstration
        setTimeout(() => {
          setScores({
            walkScore: 85,
            transitScore: 72,
            bikeScore: 90
          });
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Error fetching Walk Score:", error);
        setError("Failed to load Walk Score data");
        setLoading(false);
      }
    };

    fetchWalkScore();
  }, [property, walkScoreApiKey]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    if (score >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "Walker's Paradise";
    if (score >= 70) return "Very Walkable";
    if (score >= 50) return "Somewhat Walkable";
    if (score >= 25) return "Car-Dependent";
    return "Car-Dependent (Almost All Errands)";
  };

  if (!property) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="py-3">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Walking className="h-4 w-4 text-green-500" />
          Walkability & Transit Scores
        </CardTitle>
      </CardHeader>
      <CardContent className="py-2">
        {!walkScoreApiKey ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Walk Score API key is required. Please add your API key in settings.
            </AlertDescription>
          </Alert>
        ) : loading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-6 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-6 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="h-6 bg-gray-200 rounded"></div>
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : scores ? (
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <div className="flex items-center gap-1">
                  <Walking className="h-3.5 w-3.5 text-green-500" />
                  <span className="text-sm font-medium">Walk Score</span>
                </div>
                <span className="text-sm font-bold">{scores.walkScore}/100</span>
              </div>
              <Progress 
                value={scores.walkScore} 
                className="h-2.5" 
                indicatorClassName={getScoreColor(scores.walkScore)} 
              />
              <p className="text-xs text-muted-foreground mt-1">{getScoreLabel(scores.walkScore)}</p>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <div className="flex items-center gap-1">
                  <Bus className="h-3.5 w-3.5 text-blue-500" />
                  <span className="text-sm font-medium">Transit Score</span>
                </div>
                <span className="text-sm font-bold">{scores.transitScore}/100</span>
              </div>
              <Progress 
                value={scores.transitScore} 
                className="h-2.5" 
                indicatorClassName={getScoreColor(scores.transitScore)} 
              />
              <p className="text-xs text-muted-foreground mt-1">
                {scores.transitScore >= 70 ? "Excellent Transit" : 
                 scores.transitScore >= 50 ? "Good Transit" : 
                 scores.transitScore >= 25 ? "Some Transit" : 
                 "Minimal Transit"}
              </p>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <div className="flex items-center gap-1">
                  <Bike className="h-3.5 w-3.5 text-cyan-500" />
                  <span className="text-sm font-medium">Bike Score</span>
                </div>
                <span className="text-sm font-bold">{scores.bikeScore}/100</span>
              </div>
              <Progress 
                value={scores.bikeScore} 
                className="h-2.5" 
                indicatorClassName={getScoreColor(scores.bikeScore)} 
              />
              <p className="text-xs text-muted-foreground mt-1">
                {scores.bikeScore >= 90 ? "Biker's Paradise" : 
                 scores.bikeScore >= 70 ? "Very Bikeable" : 
                 scores.bikeScore >= 50 ? "Bikeable" : 
                 "Somewhat Bikeable"}
              </p>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default WalkScoreWidget;


import { useState } from "react";
import Header from "@/components/Header";
import ChatContainer from "@/components/ChatContainer";
import PropertyAnalysisPanel from "@/components/PropertyAnalysisPanel";
import MarketTrendsPanel from "@/components/MarketTrendsPanel";
import NeighborhoodPanel from "@/components/NeighborhoodPanel";
import { PropertyData, PropertyAnalysis } from "@/types";

const Index = () => {
  const [property, setProperty] = useState<PropertyData | null>(null);
  const [analysis, setAnalysis] = useState<PropertyAnalysis | null>(null);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Chat column */}
        <div className="w-full md:w-2/5 lg:w-2/5 border-r">
          <ChatContainer />
        </div>
        
        {/* Dashboard column */}
        <div className="w-full md:w-3/5 lg:w-3/5 overflow-auto p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PropertyAnalysisPanel property={property} analysis={analysis} />
            <MarketTrendsPanel property={property} />
            <NeighborhoodPanel property={property} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;

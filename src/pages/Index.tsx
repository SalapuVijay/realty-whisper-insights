
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
        <div className="w-full md:w-2/5 lg:w-2/5 border-r relative bg-[linear-gradient(to_bottom,rgba(242,249,249,0.8),rgba(242,255,253,0.5))]">
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none"></div>
          <ChatContainer />
        </div>
        
        {/* Dashboard column */}
        <div className="w-full md:w-3/5 lg:w-3/5 overflow-auto p-4 bg-[linear-gradient(to_bottom,rgba(248,250,252,0.8),rgba(241,253,253,0.5))]">
          <h2 className="text-2xl font-bold text-realty-800 mb-4 animate-fade-in">Property Dashboard</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-1 md:col-span-2 hover-card-effect">
              <PropertyAnalysisPanel property={property} analysis={analysis} />
            </div>
            <div className="hover-card-effect">
              <MarketTrendsPanel property={property} />
            </div>
            <div className="hover-card-effect">
              <NeighborhoodPanel property={property} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;

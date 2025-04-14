
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import ChatContainer from "@/components/ChatContainer";
import PropertyAnalysisPanel from "@/components/PropertyAnalysisPanel";
import MarketTrendsPanel from "@/components/MarketTrendsPanel";
import NeighborhoodPanel from "@/components/NeighborhoodPanel";
import { PropertyData, PropertyAnalysis } from "@/types";
import { Clock, TrendingUp, MapPin } from "lucide-react";
import { toast } from "@/components/ui/sonner";

const Index = () => {
  const [property, setProperty] = useState<PropertyData | null>(null);
  const [analysis, setAnalysis] = useState<PropertyAnalysis | null>(null);

  // Check for API keys on component mount
  useEffect(() => {
    const mashvisorApiKey = localStorage.getItem("mashvisor_api_key");
    const zillowApiKey = localStorage.getItem("zillow_api_key");
    
    if (!mashvisorApiKey || !zillowApiKey) {
      setTimeout(() => {
        toast("API Keys Not Set", {
          description: "Click the key icon in the chat input to add your Mashvisor and Zillow API keys for real property data.",
          duration: 5000,
        });
      }, 2000);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Chat column */}
        <div className="w-full md:w-2/5 lg:w-2/5 border-r relative">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute inset-0 bg-grid-pattern"></div>
            <div className="absolute top-10 left-10 w-32 h-32 bg-realty-200/30 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-40 h-40 bg-realty-100/20 rounded-full blur-3xl"></div>
          </div>
          <ChatContainer />
        </div>
        
        {/* Dashboard column */}
        <div className="w-full md:w-3/5 lg:w-3/5 overflow-auto p-6 relative">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute inset-0 bg-grid-pattern"></div>
            <div className="absolute top-40 right-20 w-48 h-48 bg-realty-100/30 rounded-full blur-3xl"></div>
            <div className="absolute bottom-40 left-20 w-36 h-36 bg-realty-200/20 rounded-full blur-3xl"></div>
          </div>
          
          <h2 className="text-2xl font-bold text-realty-800 mb-6 animate-fade-in flex items-center">
            <span className="text-gradient">Property Dashboard</span>
            <div className="h-px flex-grow bg-gradient-to-r from-realty-200 to-transparent ml-4"></div>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-1 md:col-span-2 hover-card-effect glass-card shine-effect">
              <PropertyAnalysisPanel property={property} analysis={analysis} />
            </div>
            
            <div className="hover-card-effect glass-card glow-effect">
              <div className="absolute -top-3 -right-3 bg-realty-500 text-white p-2 rounded-full shadow-lg">
                <TrendingUp size={16} />
              </div>
              <MarketTrendsPanel property={property} />
            </div>
            
            <div className="hover-card-effect glass-card glow-effect">
              <div className="absolute -top-3 -right-3 bg-realty-600 text-white p-2 rounded-full shadow-lg">
                <MapPin size={16} />
              </div>
              <NeighborhoodPanel property={property} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;

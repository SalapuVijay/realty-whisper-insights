
import { PropertyData, PropertyAnalysis, NeighborhoodData } from "@/types";

export type ChatContextType = {
  property: PropertyData | null;
  setProperty: (property: PropertyData | null) => void;
  analysis: PropertyAnalysis | null;
  comparisonProperties: PropertyData[];
  addComparisonProperty: (property: PropertyData) => void;
  removeComparisonProperty: (id: string) => void;
  apiKeys?: {
    mashvisor: string | null;
    zillow: string | null;
    realtor: string | null;
    googleMaps: string | null;
    walkScore: string | null;
    dialogflow: string | null;
    huggingface: string | null;
    estated: string | null;
  }
};

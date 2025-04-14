
import { PropertyAnalysis, PropertyData } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { generatePDF } from "@/utils/pdfGenerator";
import { mockDataService } from "@/services/mockDataService";
import { cn } from "@/lib/utils";

interface PropertyAnalysisPanelProps {
  property: PropertyData | null;
  analysis: PropertyAnalysis | null;
}

const PropertyAnalysisPanel = ({ property, analysis }: PropertyAnalysisPanelProps) => {
  if (!property || !analysis) {
    return (
      <Card className="col-span-1 min-h-[300px]">
        <CardHeader>
          <CardTitle>Property Analysis</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <p className="text-muted-foreground text-center">
            No property has been analyzed yet. <br />
            Ask me to analyze a property to see the results here.
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleDownloadReport = () => {
    if (!property || !analysis) return;
    
    const marketTrend = mockDataService.getMarketTrends(property.city, property.state);
    const neighborhood = mockDataService.getNeighborhoodData(property.zipCode, property.city, property.state);
    
    const doc = generatePDF(property, analysis, marketTrend, neighborhood);
    doc.save(`RealtyWhisper_Analysis_${property.address.replace(/\s/g, "_")}.pdf`);
  };

  const metrics = [
    { 
      name: "Cash Flow", 
      value: `$${analysis.cashFlow.monthly}`, 
      period: "monthly",
      status: analysis.cashFlow.monthly > 200 ? "positive" : analysis.cashFlow.monthly > 0 ? "neutral" : "negative" 
    },
    { 
      name: "Cap Rate", 
      value: `${analysis.capRate}%`, 
      period: "annual",
      status: analysis.capRate > 7 ? "positive" : analysis.capRate > 5 ? "neutral" : "negative" 
    },
    { 
      name: "Cash-on-Cash", 
      value: `${analysis.cashOnCashReturn}%`, 
      period: "annual",
      status: analysis.cashOnCashReturn > 10 ? "positive" : analysis.cashOnCashReturn > 7 ? "neutral" : "negative" 
    },
    { 
      name: "Rent-to-Price", 
      value: `${analysis.rentToPrice}%`, 
      period: "annual",
      status: analysis.rentToPrice > 10 ? "positive" : analysis.rentToPrice > 7 ? "neutral" : "negative" 
    },
    { 
      name: "ROI", 
      value: `${analysis.returnOnInvestment}%`, 
      period: "annual",
      status: analysis.returnOnInvestment > 15 ? "positive" : analysis.returnOnInvestment > 10 ? "neutral" : "negative" 
    },
    { 
      name: "Break-even", 
      value: `${Math.round(analysis.breakEvenPoint)}`, 
      period: "months",
      status: analysis.breakEvenPoint < 60 ? "positive" : analysis.breakEvenPoint < 100 ? "neutral" : "negative" 
    }
  ];

  return (
    <Card className="col-span-1">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Property Analysis</CardTitle>
        <Button 
          size="sm" 
          variant="outline" 
          className="text-xs flex items-center gap-1"
          onClick={handleDownloadReport}
        >
          <Download className="h-3 w-3" />
          PDF Report
        </Button>
      </CardHeader>
      <CardContent>
        <div className="text-sm mb-4">
          <p className="font-medium">{property.address}</p>
          <p className="text-muted-foreground">{property.city}, {property.state} {property.zipCode}</p>
        </div>
        
        <div className="text-sm grid grid-cols-2 sm:grid-cols-3 gap-3">
          {metrics.map((metric) => (
            <div 
              key={metric.name}
              className="bg-secondary/50 p-3 rounded-lg"
            >
              <p className="text-muted-foreground text-xs">{metric.name}</p>
              <p className={cn(
                "text-base font-semibold",
                metric.status === "positive" && "text-green-600",
                metric.status === "negative" && "text-red-600"
              )}>
                {metric.value}
              </p>
              <p className="text-xs text-muted-foreground">{metric.period}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-4 text-sm">
          <p className="text-muted-foreground">Purchase: ${property.purchasePrice.toLocaleString()}</p>
          <p className="text-muted-foreground">Monthly Rent: ${property.monthlyRent.toLocaleString()}</p>
          <p className="text-muted-foreground">Down Payment: ${property.downPayment.toLocaleString()}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyAnalysisPanel;

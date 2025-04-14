
import { PropertyAnalysis, PropertyData, MarketTrend, NeighborhoodData } from "@/types";
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import { format } from "date-fns";

interface ExtendedJsPDF extends jsPDF {
  autoTable: (options: any) => void;
}

export const generatePDF = (
  property: PropertyData,
  analysis: PropertyAnalysis,
  marketTrend: MarketTrend,
  neighborhood: NeighborhoodData
) => {
  const doc = new jsPDF() as ExtendedJsPDF;
  const date = format(new Date(), "MMMM dd, yyyy");

  // Add header
  doc.setFillColor(20, 184, 166);
  doc.rect(0, 0, 210, 20, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.text("RealtyWhisper Investment Analysis", 105, 14, { align: "center" });
  
  // Add property details
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.text("Property Analysis Report", 105, 30, { align: "center" });
  doc.setFontSize(10);
  doc.text(`Generated on: ${date}`, 105, 36, { align: "center" });
  
  doc.setFontSize(12);
  doc.text("Property Details", 14, 50);
  doc.setFontSize(10);
  doc.text(`Address: ${property.address}`, 14, 58);
  doc.text(`${property.city}, ${property.state} ${property.zipCode}`, 14, 65);
  doc.text(`Purchase Price: $${property.purchasePrice.toLocaleString()}`, 14, 72);
  doc.text(`Monthly Rent: $${property.monthlyRent.toLocaleString()}`, 14, 79);
  
  // Add financial analysis
  doc.setFontSize(12);
  doc.text("Financial Analysis", 14, 95);
  
  doc.autoTable({
    startY: 100,
    head: [["Metric", "Value"]],
    body: [
      ["Cap Rate", `${analysis.capRate}%`],
      ["Cash-on-Cash Return", `${analysis.cashOnCashReturn}%`],
      ["Monthly Cash Flow", `$${analysis.cashFlow.monthly.toLocaleString()}`],
      ["Annual Cash Flow", `$${analysis.cashFlow.annual.toLocaleString()}`],
      ["Rent-to-Price Ratio", `${analysis.rentToPrice}%`],
      ["Net Operating Income", `$${analysis.netOperatingIncome.toLocaleString()}`],
      ["Return on Investment", `${analysis.returnOnInvestment}%`],
      ["Break-even Point", `${Math.round(analysis.breakEvenPoint)} months`]
    ],
    theme: 'grid',
    headStyles: { fillColor: [20, 184, 166] }
  });
  
  // Add market trends
  doc.setFontSize(12);
  doc.text("Market Trends", 14, doc.autoTable.previous.finalY + 15);
  
  doc.autoTable({
    startY: doc.autoTable.previous.finalY + 20,
    head: [["Metric", "Value"]],
    body: [
      ["Median Home Price", `$${marketTrend.medianHomePrice.toLocaleString()}`],
      ["Price Change (1 Year)", `${marketTrend.priceChange1Year}%`],
      ["Median Rent", `$${marketTrend.medianRent.toLocaleString()}`],
      ["Rent Change (1 Year)", `${marketTrend.rentChange1Year}%`],
      ["Days on Market", `${marketTrend.daysOnMarket} days`],
      ["Inventory Change", `${marketTrend.inventoryChange}%`]
    ],
    theme: 'grid',
    headStyles: { fillColor: [20, 184, 166] }
  });
  
  // Add neighborhood data
  doc.setFontSize(12);
  doc.text("Neighborhood Insights", 14, doc.autoTable.previous.finalY + 15);
  
  doc.autoTable({
    startY: doc.autoTable.previous.finalY + 20,
    head: [["Metric", "Value"]],
    body: [
      ["School Rating", `${neighborhood.schoolRating}/10`],
      ["Crime Rate", neighborhood.crimeRate],
      ["Walkability Score", `${neighborhood.walkabilityScore}/100`],
      ["Transit Score", `${neighborhood.transitScore}/100`],
      ["Population", neighborhood.population.toLocaleString()],
      ["Median Income", `$${neighborhood.medianIncome.toLocaleString()}`],
      ["Employment Rate", `${neighborhood.employmentRate}%`]
    ],
    theme: 'grid',
    headStyles: { fillColor: [20, 184, 166] }
  });
  
  // Add footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(
      "Powered by RealtyWhisper - This report is for informational purposes only and should not be considered financial advice.",
      105,
      285,
      { align: "center" }
    );
    doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: "center" });
  }
  
  return doc;
};

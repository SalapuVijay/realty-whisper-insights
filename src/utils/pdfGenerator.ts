
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import { PropertyData, PropertyAnalysis, MarketTrend, NeighborhoodData } from "@/types";

// Create a function to generate a PDF for a property analysis report
export const generatePropertyReport = (
  property: PropertyData,
  analysis: PropertyAnalysis,
  marketTrend?: MarketTrend,
  neighborhood?: NeighborhoodData
) => {
  try {
    const doc = new jsPDF();
    let yPos = 20;
    
    // Add a title
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text("Property Analysis Report", 105, yPos, { align: "center" });
    yPos += 10;
    
    // Add a subtitle with the property address
    doc.setFontSize(12);
    doc.text(`${property.address}, ${property.city}, ${property.state} ${property.zipCode}`, 105, yPos, { align: "center" });
    yPos += 15;
    
    // Add property details section
    doc.setFontSize(16);
    doc.setTextColor(62, 116, 170);
    doc.text("Property Details", 20, yPos);
    yPos += 10;
    
    doc.setFontSize(10);
    doc.setTextColor(40, 40, 40);
    
    const propertyDetails = [
      ["Purchase Price:", `$${property.purchasePrice.toLocaleString()}`],
      ["Monthly Rent:", `$${property.monthlyRent.toLocaleString()}`],
      ["Down Payment:", `$${property.downPayment.toLocaleString()} (${Math.round((property.downPayment / property.purchasePrice) * 100)}%)`],
      ["Interest Rate:", `${property.interestRate}%`],
      ["Loan Term:", `${property.loanTerm} years`],
    ];
    
    // Add property details as a table
    const propertyDetailsBody = propertyDetails.map(row => [row[0], row[1]]);
    
    autoTable(doc, {
      startY: yPos,
      head: [["Detail", "Value"]],
      body: propertyDetailsBody,
      theme: "grid",
      headStyles: { fillColor: [62, 116, 170], textColor: [255, 255, 255] },
      margin: { left: 20 },
      styles: { cellPadding: 5 }
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 15;
    
    // Add financial analysis section
    doc.setFontSize(16);
    doc.setTextColor(62, 116, 170);
    doc.text("Financial Analysis", 20, yPos);
    yPos += 10;
    
    const financialAnalysis = [
      ["Cap Rate:", `${analysis.capRate}%`],
      ["Cash Flow:", `$${analysis.cashFlow.monthly.toLocaleString()}/month ($${analysis.cashFlow.annual.toLocaleString()}/year)`],
      ["Cash-on-Cash Return:", `${analysis.cashOnCashReturn}%`],
      ["Rent-to-Price Ratio:", `${analysis.rentToPrice}%`],
      ["Return on Investment:", `${analysis.returnOnInvestment}%`],
      ["Break-even Point:", `${Math.round(analysis.breakEvenPoint)} months`],
    ];
    
    // Add financial analysis as a table
    const financialAnalysisBody = financialAnalysis.map(row => [row[0], row[1]]);
    
    autoTable(doc, {
      startY: yPos,
      head: [["Metric", "Value"]],
      body: financialAnalysisBody,
      theme: "grid",
      headStyles: { fillColor: [62, 116, 170], textColor: [255, 255, 255] },
      margin: { left: 20 },
      styles: { cellPadding: 5 }
    });
    
    if (marketTrend) {
      yPos = (doc as any).lastAutoTable.finalY + 15;
      
      // Add market trends section
      doc.setFontSize(16);
      doc.setTextColor(62, 116, 170);
      doc.text("Market Trends", 20, yPos);
      yPos += 10;
      
      doc.setFontSize(10);
      doc.setTextColor(40, 40, 40);
      
      const marketTrends = [
        ["Median Home Price:", `$${marketTrend.medianHomePrice.toLocaleString()}`],
        ["Price Change (1 Year):", `${marketTrend.priceChange1Year}%`],
        ["Median Rent:", `$${marketTrend.medianRent.toLocaleString()}`],
        ["Rent Change (1 Year):", `${marketTrend.rentChange1Year}%`],
        ["Days on Market:", `${marketTrend.daysOnMarket} days`],
        ["Inventory Change:", `${marketTrend.inventoryChange}%`],
      ];
      
      // Add market trends as a table
      const marketTrendsBody = marketTrends.map(row => [row[0], row[1]]);
      
      autoTable(doc, {
        startY: yPos,
        head: [["Trend", "Value"]],
        body: marketTrendsBody,
        theme: "grid",
        headStyles: { fillColor: [62, 116, 170], textColor: [255, 255, 255] },
        margin: { left: 20 },
        styles: { cellPadding: 5 }
      });
    }
    
    if (neighborhood) {
      yPos = (doc as any).lastAutoTable.finalY + 15;
      
      // Add neighborhood insights section
      doc.setFontSize(16);
      doc.setTextColor(62, 116, 170);
      doc.text("Neighborhood Insights", 20, yPos);
      yPos += 10;
      
      doc.setFontSize(10);
      doc.setTextColor(40, 40, 40);
      
      const neighborhoodInsights = [
        ["School Rating:", `${neighborhood.schoolRating}/10`],
        ["Crime Rate:", neighborhood.crimeRate],
        ["Walkability Score:", `${neighborhood.walkabilityScore}/100`],
        ["Transit Score:", `${neighborhood.transitScore}/100`],
        ["Population:", neighborhood.population.toLocaleString()],
        ["Median Income:", `$${neighborhood.medianIncome.toLocaleString()}`],
        ["Employment Rate:", `${neighborhood.employmentRate}%`],
      ];
      
      // Add neighborhood insights as a table
      const neighborhoodInsightsBody = neighborhoodInsights.map(row => [row[0], row[1]]);
      
      autoTable(doc, {
        startY: yPos,
        head: [["Insight", "Value"]],
        body: neighborhoodInsightsBody,
        theme: "grid",
        headStyles: { fillColor: [62, 116, 170], textColor: [255, 255, 255] },
        margin: { left: 20 },
        styles: { cellPadding: 5 }
      });
    }

    // Return the PDF document
    return doc;
  } catch (error) {
    console.error("Error generating PDF report:", error);
    throw error;
  }
};

// Add the export that PropertyAnalysisPanel is looking for
export const generatePDF = generatePropertyReport;

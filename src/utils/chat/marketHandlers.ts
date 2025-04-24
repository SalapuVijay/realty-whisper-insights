
import { MarketTrend } from "@/types";

export const getMarketTrendResponse = (marketTrend: MarketTrend): string => {
  let response = '';
  response += `📈 **Median Home Price**: $${marketTrend.medianHomePrice.toLocaleString()} (${marketTrend.priceChange1Year > 0 ? '+' : ''}${marketTrend.priceChange1Year}% year-over-year)\n`;
  response += `🏠 **Median Rent**: $${marketTrend.medianRent.toLocaleString()} (${marketTrend.rentChange1Year > 0 ? '+' : ''}${marketTrend.rentChange1Year}% year-over-year)\n`;
  response += `⏱️ **Average Days on Market**: ${marketTrend.daysOnMarket} days\n`;
  response += `📊 **Inventory Change**: ${marketTrend.inventoryChange > 0 ? '+' : ''}${marketTrend.inventoryChange}% year-over-year\n\n`;
  
  if (marketTrend.priceChange1Year > 8) {
    response += "This is a hot seller's market with rapidly appreciating home values. Competition among buyers is likely high.";
  } else if (marketTrend.priceChange1Year > 3) {
    response += "This market is showing healthy appreciation, balancing opportunity for both buyers and sellers.";
  } else if (marketTrend.priceChange1Year > 0) {
    response += "This market is stable with modest appreciation, which may present good value opportunities.";
  } else {
    response += "This market is experiencing some price corrections, which could present buying opportunities but also carries risk.";
  }
  
  return response;
};

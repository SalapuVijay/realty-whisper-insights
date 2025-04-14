
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PropertyData } from "@/types";
import { mockDataService } from "@/services/mockDataService";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { cn } from "@/lib/utils";

interface MarketTrendsPanelProps {
  property: PropertyData | null;
}

const MarketTrendsPanel = ({ property }: MarketTrendsPanelProps) => {
  const [priceData, setPriceData] = useState<any[]>([]);
  const [rentData, setRentData] = useState<any[]>([]);
  
  useEffect(() => {
    if (property) {
      // Generate mock historical data
      const generateHistoricalData = (currentValue: number, volatility: number) => {
        const data = [];
        let value = currentValue;
        
        // Generate 12 months of data in reverse (most recent last)
        for (let i = 11; i >= 0; i--) {
          // Random percent change between -volatility and +volatility
          const change = (Math.random() * volatility * 2) - volatility;
          value = value / (1 + (change / 100));
          
          data.unshift({
            month: getMonthName(i),
            value: Math.round(value)
          });
        }
        
        return data;
      };
      
      const getMonthName = (monthsAgo: number) => {
        const d = new Date();
        d.setMonth(d.getMonth() - monthsAgo);
        return d.toLocaleString('default', { month: 'short' });
      };
      
      // Get current values from mock data service
      const marketTrend = mockDataService.getMarketTrends(property.city, property.state);
      
      // Generate historical price and rent data
      setPriceData(generateHistoricalData(marketTrend.medianHomePrice, 1.5));
      setRentData(generateHistoricalData(marketTrend.medianRent, 1.0));
    }
  }, [property]);

  if (!property) {
    return (
      <Card className="col-span-1 min-h-[300px]">
        <CardHeader>
          <CardTitle>Market Trends</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <p className="text-muted-foreground text-center">
            No property has been selected yet. <br />
            Set a property to see market trends for the area.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Get market trend data for this property
  const marketTrend = mockDataService.getMarketTrends(property.city, property.state);

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Market Trends - {property.city}, {property.state}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-secondary/50 p-3 rounded-lg">
            <p className="text-muted-foreground text-xs">Median Home Price</p>
            <p className="text-base font-semibold">${marketTrend.medianHomePrice.toLocaleString()}</p>
            <p className={cn(
              "text-xs flex items-center",
              marketTrend.priceChange1Year > 0 ? "text-green-600" : "text-red-600"
            )}>
              {marketTrend.priceChange1Year > 0 ? "↑" : "↓"} {Math.abs(marketTrend.priceChange1Year)}% year-over-year
            </p>
          </div>
          
          <div className="bg-secondary/50 p-3 rounded-lg">
            <p className="text-muted-foreground text-xs">Median Rent</p>
            <p className="text-base font-semibold">${marketTrend.medianRent.toLocaleString()}</p>
            <p className={cn(
              "text-xs flex items-center",
              marketTrend.rentChange1Year > 0 ? "text-green-600" : "text-red-600"
            )}>
              {marketTrend.rentChange1Year > 0 ? "↑" : "↓"} {Math.abs(marketTrend.rentChange1Year)}% year-over-year
            </p>
          </div>
        </div>
        
        {/* Price Trend Chart */}
        <div>
          <p className="text-xs text-muted-foreground mb-2">Home Prices (12 Months)</p>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={priceData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 10 }} 
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis 
                domain={['auto', 'auto']}
                tick={{ fontSize: 10 }}
                tickFormatter={(value) => `$${(value/1000)}k`}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Price']}
                labelFormatter={(value) => `${value}`}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#14b8a6" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Rent Trend Chart */}
        <div>
          <p className="text-xs text-muted-foreground mb-2">Rental Rates (12 Months)</p>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={rentData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 10 }} 
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis 
                domain={['auto', 'auto']}
                tick={{ fontSize: 10 }}
                tickFormatter={(value) => `$${value}`}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Rent']}
                labelFormatter={(value) => `${value}`}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#0d9488" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Market Context */}
        <div className="border-t pt-3 text-xs text-muted-foreground">
          <p className="mb-1">
            Average days on market: <span className="font-medium">{marketTrend.daysOnMarket} days</span>
          </p>
          <p>
            Inventory change: <span className={cn(
              "font-medium",
              marketTrend.inventoryChange > 0 ? "text-green-600" : "text-red-600"
            )}>
              {marketTrend.inventoryChange > 0 ? "+" : ""}{marketTrend.inventoryChange}%
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketTrendsPanel;

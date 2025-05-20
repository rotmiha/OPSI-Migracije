import React, { useState } from 'react';
import { 
  PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, ResponsiveContainer 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BarChart2, PieChart as PieChartIcon, List } from "lucide-react";

interface DataVisualizationProps {
  data: Array<{
    municipality: string;
    value: number | null;
  }>;
  parameterName: string;
  year: number | null;
  stats: {
    min: number | null;
    max: number | null;
    avg: number | null;
    median: number | null;
  } | undefined;
}

export default function DataVisualization({ 
  data, 
  parameterName, 
  year, 
  stats 
}: DataVisualizationProps) {
  const [displayCount, setDisplayCount] = useState(10);
  const [visualizationType, setVisualizationType] = useState<'top' | 'bottom' | 'around-median'>('top');

  // Filter out null values
  const validData = data.filter(item => item.value !== null)
    .sort((a, b) => (b.value as number) - (a.value as number));

  // Get data for visualization
  const getVisualData = () => {
    if (visualizationType === 'top') {
      // Top N municipalities
      return validData.slice(0, displayCount);
    } else if (visualizationType === 'bottom') {
      // Bottom N municipalities
      return [...validData].reverse().slice(0, displayCount);
    } else {
      // Around median
      if (!stats?.median) return [];
      const medianIndex = validData.findIndex(item => (item.value as number) <= (stats.median as number));
      const halfCount = Math.floor(displayCount / 2);
      const startIndex = Math.max(0, medianIndex - halfCount);
      return validData.slice(startIndex, startIndex + displayCount);
    }
  };

  const visualData = getVisualData();
  
  // Format data for recharts
  const chartData = visualData.map(item => ({
    name: item.municipality,
    value: item.value
  }));

  // Pie chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28BFF', '#FF667D', '#41D9A1', '#FFA940'];

  return (
    <div className="bg-white p-4 border-t border-neutral-light">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">{parameterName} {year && `(${year})`}</h2>
        <div className="flex gap-2">
          <Button 
            variant={visualizationType === 'top' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setVisualizationType('top')}
          >
            Najvišji
          </Button>
          <Button 
            variant={visualizationType === 'bottom' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setVisualizationType('bottom')}
          >
            Najnižji
          </Button>
          <Button 
            variant={visualizationType === 'around-median' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setVisualizationType('around-median')}
          >
            Okoli mediane
          </Button>
        </div>
      </div>

      <Tabs defaultValue="bar">
        <TabsList className="mb-4">
          <TabsTrigger value="bar">
            <BarChart2 className="h-4 w-4 mr-2" />
            Stolpični
          </TabsTrigger>
          <TabsTrigger value="pie">
            <PieChartIcon className="h-4 w-4 mr-2" />
            Tortni
          </TabsTrigger>
          <TabsTrigger value="table">
            <List className="h-4 w-4 mr-2" />
            Tabela
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="bar" className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 120 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip formatter={(value: number) => value.toLocaleString('sl-SI')} />
              <Legend />
              <Bar dataKey="value" fill="#0078d4" name={parameterName} />
            </BarChart>
          </ResponsiveContainer>
        </TabsContent>
        
        <TabsContent value="pie" className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => value.toLocaleString('sl-SI')} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </TabsContent>
        
        <TabsContent value="table">
          <div className="max-h-80 overflow-y-auto">
            <table className="w-full border-collapse">
              <thead className="bg-neutral-lighter sticky top-0">
                <tr>
                  <th className="text-left p-2 border-b">Občina</th>
                  <th className="text-right p-2 border-b">Vrednost</th>
                </tr>
              </thead>
              <tbody>
                {chartData.map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-neutral-lighter'}>
                    <td className="p-2 border-b">{item.name}</td>
                    <td className="text-right p-2 border-b">{item.value?.toLocaleString('sl-SI')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="mt-4 flex justify-between items-center">
        <div className="text-sm text-neutral-dark">
          Prikazanih {displayCount} od {validData.length} občin
        </div>
        <div className="space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setDisplayCount(Math.max(5, displayCount - 5))}
            disabled={displayCount <= 5}
          >
            Manj
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setDisplayCount(Math.min(50, displayCount + 5))}
            disabled={displayCount >= 50}
          >
            Več
          </Button>
        </div>
      </div>
    </div>
  );
}
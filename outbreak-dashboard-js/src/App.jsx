// src/App.jsx
import { useEffect, useState } from 'react';
import { fetchGlobalForecast } from './services/api';
import { 
  PieChart, Pie, Cell, Tooltip, Legend, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer 
} from 'recharts';

// Define colors for each risk level for consistent styling
const COLORS = { High: '#EF4444', Medium: '#F97316', Low: '#22C55E' };

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // This effect runs once when the component mounts
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const forecastData = await fetchGlobalForecast();
      setData(forecastData);
      setLoading(false);
    };
    loadData();
  }, []); // The empty dependency array [] ensures this runs only once

  // Display a more polished loading message
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <h1 className="text-2xl font-semibold text-gray-700">Loading Disease Outbreak Data...</h1>
      </div>
    );
  }

  // --- Data Processing for Charts ---
  const riskCounts = data.reduce((acc, item) => {
    acc[item.Risk_Level] = (acc[item.Risk_Level] || 0) + 1;
    return acc;
  }, {});
  const pieData = Object.entries(riskCounts).map(([name, value]) => ({ name, value }));
  const highRiskCountries = data
    .filter(d => d.Risk_Level === 'High')
    .sort((a, b) => b.Forecasted_Cases - a.Forecasted_Cases)
    .slice(0, 15);

  return (
    // Main container with a light gray background and padding
    <div className="bg-gray-50 min-h-screen p-4 sm:p-8 font-sans">
      
      {/* Header section */}
      <header className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">
          Regional Measles Outbreak Predictor
        </h1>
        <p className="text-gray-600 mt-2">
          Global forecast based on historical WHO data.
        </p>
      </header>

      {/* Main content area using a responsive grid */}
      <main className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
        
        {/* Card 1: Outbreak Radar (Pie Chart) */}
        <div className="bg-white p-6 rounded-xl shadow-lg transition-shadow hover:shadow-2xl">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4 border-b pb-2">
            Global Outbreak Radar
          </h2>
          {/* Responsive container makes the chart fit its parent */}
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={150}>
                {pieData.map((entry) => (
                  <Cell key={`cell-${entry.name}`} fill={COLORS[entry.name]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value} countries`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Card 2: High Risk Regions (Bar Chart) */}
        <div className="bg-white p-6 rounded-xl shadow-lg transition-shadow hover:shadow-2xl">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4 border-b pb-2">
            Top High-Risk Countries
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={highRiskCountries} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
               <CartesianGrid strokeDasharray="3 3" />
               <XAxis type="number" />
               <YAxis type="category" dataKey="CountryCode" width={60} interval={0} fontSize={12} />
               <Tooltip formatter={(value) => Math.round(value).toLocaleString()} />
               <Legend />
               <Bar dataKey="Forecasted_Cases" name="Forecasted Cases" fill="#EF4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
      </main>
    </div>
  );
}

export default App;
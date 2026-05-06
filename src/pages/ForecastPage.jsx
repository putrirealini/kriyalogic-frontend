import React, { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Calendar,
  DollarSign,
  Target,
  AlertCircle,
  Loader2,
  Sparkles
} from 'lucide-react';

// Mock data for parent products - in real app, fetch from API
const PARENT_PRODUCTS = [
  { value: 'Patung Buddha', label: 'Patung Buddha' },
  { value: 'Patung Ganesha', label: 'Patung Ganesha' },
  { value: 'Patung Naga', label: 'Patung Naga' },
  { value: 'Patung Garuda Wisnu', label: 'Patung Garuda Wisnu' },
  { value: 'Patung Abstrak Modern', label: 'Patung Abstrak Modern' },
  { value: 'Patung Barong', label: 'Patung Barong' },
  { value: 'Patung Harimau', label: 'Patung Harimau' }
];

// Helper function to generate AI Insight text
const generateAIInsight = (productName, trend) => {
  switch (trend) {
    case 'up':
      return `Stock for ${productName} should be increased as recent demand is showing a significant upward trend.`;
    case 'down':
      return `Consider reducing the inventory for ${productName} as the forecasted demand is declining.`;
    default:
      return `Demand for ${productName} is projected to remain stable.`;
  }
};

const ForecastPage = () => {
  const [selectedProduct, setSelectedProduct] = useState('Patung Garuda Wisnu');
  const [forecastData, setForecastData] = useState([]);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const filteredForecastData = forecastData.filter((item) => {
    const itemDate = new Date(item.fullDate);
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;

    if (from && itemDate < from) return false;
    if (to && itemDate > to) return false;
    return true;
  });

  // Fetch forecast data
  useEffect(() => {
    const fetchForecastData = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log(`📊 Fetching forecast for: ${selectedProduct}`);
        const response = await fetch(`${API_URL}/forecast/${encodeURIComponent(selectedProduct)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        console.log(`Response Status: ${response.status}`);

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          const errorMessage = errorData?.message || `Server error: ${response.status}`;
          throw new Error(errorMessage);
        }

        const result = await response.json();
        console.log(`✓ Received ${result.count || result.data?.length || 0} forecast records`);

        if (result.success && result.data) {
          // Transform data for chart
          const transformedData = result.data.map(item => ({
            date: new Date(item.forecast_date).toLocaleDateString('id-ID'),
            predicted: item.predicted_demand,
            lower: item.lower_bound_estimate,
            upper: item.upper_bound_estimate,
            fullDate: item.forecast_date
          }));

          setForecastData(transformedData);
        } else {
          throw new Error(result.message || 'No data available - ensure forecast data has been seeded');
        }
      } catch (err) {
        console.error('❌ Forecast fetch error:', err.message);
        
        // Provide helpful error messages
        let userMessage = err.message;
        if (err.message.includes('Failed to fetch')) {
          userMessage = 'Cannot connect to API server. Please ensure the backend is running on port 5000.';
        } else if (err.message.includes('No forecast data found')) {
          userMessage = `No forecast data found for "${selectedProduct}". Please run the seed script: npm run seed:forecast`;
        }
        
        setError(userMessage);
        setForecastData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchForecastData();
  }, [selectedProduct]);

  // Calculate KPIs
  const totalPredicted = filteredForecastData.reduce((sum, item) => sum + item.predicted, 0);
  const avgConfidence = filteredForecastData.length > 0
    ? filteredForecastData.reduce((sum, item) => sum + (item.upper - item.lower), 0) / filteredForecastData.length
    : 0;
  const trend = filteredForecastData.length > 1
    ? (filteredForecastData[filteredForecastData.length - 1].predicted > filteredForecastData[0].predicted ? 'up' : 'down')
    : 'neutral';

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{`Date: ${label}`}</p>
          <p className="text-blue-600">{`Predicted: Rp ${data.predicted.toLocaleString()}`}</p>
          <p className="text-green-600">{`Lower: Rp ${data.lower.toLocaleString()}`}</p>
          <p className="text-red-600">{`Upper: Rp ${data.upper.toLocaleString()}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-[#4E3629] mr-3" />
              <h1 className="text-2xl font-bold text-[#4E3629]">Sales Forecasting Dashboard</h1>
            </div>
            <div className="text-sm text-[#4E3629]">
              KriyaLogic ERP System
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Product Selector */}
        <div className="mb-8 grid gap-4 lg:grid-cols-[1fr_1fr] items-end">
          <div>
            <label htmlFor="product-select" className="block text-sm font-medium text-[#4E3629] mb-2">
              Select Parent Product
            </label>
            <select
              id="product-select"
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="block w-full max-w-xs px-3 py-2 border border-[#A97A47] rounded-md bg-[#FFFFFF] shadow-sm focus:outline-none focus:ring-[#FF6900] focus:border-[#FF6900] text-[#3D312B]"
            >
              {PARENT_PRODUCTS.map(product => (
                <option key={product.value} value={product.value}>
                  {product.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4 max-w-md">
            <div>
              <label htmlFor="from-date" className="block text-sm font-medium text-[#4E3629] mb-2">
                From
              </label>
              <input
                id="from-date"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="block w-full px-3 py-2 border border-[#A97A47] rounded-md bg-[#FFFFFF] outline-none focus:ring-[#FF6900] focus:border-[#FF6900] text-[#3D312B]"
              />
            </div>
            <div>
              <label htmlFor="to-date" className="block text-sm font-medium text-[#4E3629] mb-2">
                To
              </label>
              <input
                id="to-date"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="block w-full px-3 py-2 border border-[#A97A47] rounded-md bg-[#FFFFFF] outline-none focus:ring-[#FF6900] focus:border-[#FF6900] text-[#3D312B]"
              />
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#FFFFFF] p-6 rounded-lg shadow-sm border border-[#A97A47]">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-[#FF6900] mr-3" />
              <div>
                <p className="text-sm font-medium text-[#4E3629]">Total Predicted Demand</p>
                <p className="text-2xl font-bold text-[#3D312B]">
                  Rp {totalPredicted.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">Next 30 days</p>
              </div>
            </div>
          </div>

          <div className="bg-[#FFFFFF] p-6 rounded-lg shadow-sm border border-[#A97A47]">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-[#FF6900] mr-3" />
              <div>
                <p className="text-sm font-medium text-[#4E3629]">Average Confidence Range</p>
                <p className="text-2xl font-bold text-[#3D312B]">
                  Rp {avgConfidence.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">Prediction margin</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              {trend === 'up' ? (
                <TrendingUp className="h-8 w-8 text-green-600 mr-3" />
              ) : trend === 'down' ? (
                <TrendingDown className="h-8 w-8 text-red-600 mr-3" />
              ) : (
                <BarChart3 className="h-8 w-8 text-gray-600 mr-3" />
              )}
              <div>
                <p className="text-sm font-medium text-[#4E3629]">Trend Analysis</p>
                <p className={`text-2xl font-bold ${
                  trend === 'up' ? 'text-green-600' :
                  trend === 'down' ? 'text-red-600' : 'text-gray-900'
                }`}>
                  {trend === 'up' ? 'Growing' : trend === 'down' ? 'Declining' : 'Stable'}
                </p>
                <p className="text-xs text-gray-500">30-day forecast</p>
              </div>
            </div>
          </div>
        </div>

        {/* AI Insight */}
        {!loading && !error && filteredForecastData.length > 0 && (
          <div className="bg-[#FFFFFF] border border-[#A97A47] rounded-lg p-6 mb-8">
            <div className="flex items-start">
              <Sparkles className="h-6 w-6 text-[#FF6900] mr-3 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold text-[#4E3629] mb-2">AI Insight & Recommendation</h3>
                <p className="text-[#4E3629] leading-relaxed">
                  {generateAIInsight(selectedProduct, trend)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#FF6900] mr-3" />
            <span className="text-[#4E3629]">Loading forecast data...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Error loading data</h3>
                <p className="text-sm text-red-600 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Chart */}
        {!loading && !error && filteredForecastData.length > 0 && (
          <div className="bg-[#FFFFFF] p-6 rounded-lg shadow-sm border border-[#A97A47] mb-8">
            <h2 className="text-lg font-semibold text-[#4E3629] mb-4">
              Sales Forecast for {selectedProduct}
            </h2>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={filteredForecastData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={(value) => `Rp ${value.toLocaleString()}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />

                  {/* Uncertainty Area */}
                  <Area
                    type="monotone"
                    dataKey="upper"
                    stackId="1"
                    stroke="none"
                    fill="#FFFFFF"
                    fillOpacity={0.3}
                  />
                  <Area
                    type="monotone"
                    dataKey="lower"
                    stackId="1"
                    stroke="none"
                    fill="#4E3629"
                    fillOpacity={1}
                  />

                  {/* Forecast Line */}
                  <Line
                    type="monotone"
                    dataKey="predicted"
                    stroke="#FF6900"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Predicted Demand"
                    dot={{ fill: '#FF6900', strokeWidth: 2, r: 4 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <div className="w-4 h-0.5 bg-[#FF6900] mr-2" style={{borderStyle: 'dashed'}}></div>
                  <span>Predicted Demand</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-2 bg-[#FFD9B3] mr-2"></div>
                  <span>Confidence Interval</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Data Table */}
        {!loading && !error && filteredForecastData.length > 0 && (
          <div className="bg-[#FFFFFF] rounded-lg shadow-sm border border-[#A97A47] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#A97A47]">
              <h3 className="text-lg font-medium text-[#4E3629]">Forecast Details</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#A97A47]">
                <thead className="bg-[#F9FAFB]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#4E3629] uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#4E3629] uppercase tracking-wider">
                      Predicted Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#4E3629] uppercase tracking-wider">
                      Lower Bound
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#4E3629] uppercase tracking-wider">
                      Upper Bound
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#4E3629] uppercase tracking-wider">
                      Range
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredForecastData.map((item, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-[#F9FAFB]'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#3D312B]">
                        {item.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#3D312B]">
                        Rp {item.predicted.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#3D312B]">
                        Rp {item.lower.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#3D312B]">
                        Rp {item.upper.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#3D312B]">
                        Rp {(item.upper - item.lower).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForecastPage;
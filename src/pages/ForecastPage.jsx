import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  BarChart3,
  Calendar,
  Loader2,
  Package,
  TrendingDown,
  TrendingUp
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const months = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' }
];

const currentDate = new Date();
const currentMonth = currentDate.getMonth() + 1;
const currentYear = currentDate.getFullYear();

const formatNumber = (value) => Number(value || 0).toLocaleString('id-ID');

const ForecastPage = () => {
  const [forecastData, setForecastData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const yearOptions = useMemo(
    () => Array.from({ length: 6 }, (_, index) => currentYear - index),
    []
  );

  useEffect(() => {
    if (selectedYear === currentYear && selectedMonth > currentMonth) {
      setSelectedMonth(currentMonth);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchForecastData = async () => {
      setLoading(true);
      setError(null);

      try {
        const queryParams = new URLSearchParams();
        if (selectedMonth) queryParams.append('month', selectedMonth);
        if (selectedYear) queryParams.append('year', selectedYear);
        const userMenuRef = useRef(null);

        const queryString = queryParams.toString();
        const response = await fetch(`${API_URL}/forecasts?${queryString ? `${queryString}` : ''}`, {
          method: 'GET',
          signal: controller.signal
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.message || `Server error: ${response.status}`);
        }

        const result = await response.json();
        console.log('Raw API response:', result);

        console.log('Forecast API response:', result);

        if (result.success && Array.isArray(result.data)) {
          setForecastData(result.data);
        } else {
          throw new Error(result.message || 'Invalid forecast response');
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          let userMessage = err.message;

          if (err.message.includes('Failed to fetch')) {
            userMessage = 'Cannot connect to API server. Please ensure the backend is running on port 5000.';
          }

          setError(userMessage);
          setForecastData([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchForecastData();
    return () => controller.abort();
  }, [selectedMonth, selectedYear]);

  const selectedMonthLabel = months.find((month) => month.value === Number(selectedMonth))?.label;
  const totalProducts = forecastData.length;
  const totalActualStock = forecastData.reduce((sum, item) => sum + Number(item.actual_stock || 0), 0);
  const totalPredictedStock = forecastData.reduce((sum, item) => sum + Number(item.predicted_stock || 0), 0);
  const totalRemainingStock = forecastData.reduce((sum, item) => sum + Number(item.remaining_stock || 0), 0);
  const productsNeedRestock = forecastData.filter((item) => Number(item.remaining_stock || 0) > 0).length;

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#3D312B]">
      <header className="border-b border-[#E7D8C7] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#FFF0E6] text-[#4E3629]">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#4E3629]">Forecast Dashboard</h1>
              <p className="text-sm text-[#6B5142]">Global product stock forecast</p>
            </div>
          </div>
          <div className="text-sm font-medium text-[#4E3629]">KriyaLogic ERP System</div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#4E3629]">Forecast Period</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#4E3629]">
              {selectedMonthLabel} {selectedYear}
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-[#6B5142]">
              Forecast data is loaded globally from all products. Future months are disabled because sales data is not available yet.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="forecast-month" className="block text-sm font-medium text-[#4E3629]">
                Month
              </label>
              <select
                id="forecast-month"
                value={selectedMonth}
                onChange={(event) => setSelectedMonth(Number(event.target.value))}
                className="h-12 w-full min-w-44 rounded-lg border border-[#A97A47] bg-white px-4 text-[#3D312B] outline-none focus:border-[#4E3629] focus:ring-2 focus:ring-[#FFD9B3]"
              >
                {months.map((month) => (
                  <option
                    key={month.value}
                    value={month.value}
                    disabled={selectedYear === currentYear && month.value > currentMonth}
                  >
                    {month.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="forecast-year" className="block text-sm font-medium text-[#4E3629]">
                Year
              </label>
              <select
                id="forecast-year"
                value={selectedYear}
                onChange={(event) => setSelectedYear(Number(event.target.value))}
                className="h-12 w-full min-w-32 rounded-lg border border-[#A97A47] bg-white px-4 text-[#3D312B] outline-none focus:border-[#4E3629] focus:ring-2 focus:ring-[#FFD9B3]"
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-lg border border-[#A97A47] bg-[#FFF0E6] p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[#4E3629]">Total Products</p>
                <p className="mt-3 text-3xl font-bold text-[#3D312B]">{formatNumber(totalProducts)}</p>
              </div>
              <Package className="h-8 w-8 text-[#4E3629]" />
            </div>
          </div>

          <div className="rounded-lg border border-[#A97A47] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[#4E3629]">Actual Stock</p>
                <p className="mt-3 text-3xl font-bold text-[#3D312B]">{formatNumber(totalActualStock)}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-[#4E3629]" />
            </div>
          </div>

          <div className="rounded-lg border border-[#A97A47] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[#4E3629]">Predicted Stock</p>
                <p className="mt-3 text-3xl font-bold text-[#3D312B]">{formatNumber(totalPredictedStock)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-[#4E3629]" />
            </div>
          </div>

          <div className="rounded-lg border border-[#A97A47] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[#4E3629]">Need Restock</p>
                <p className="mt-3 text-3xl font-bold text-[#3D312B]">{formatNumber(productsNeedRestock)}</p>
              </div>
              <Calendar className="h-8 w-8 text-[#4E3629]" />
            </div>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center rounded-lg border border-[#A97A47] bg-white py-12 shadow-sm">
            <Loader2 className="mr-3 h-8 w-8 animate-spin text-[#4E3629]" />
            <span className="text-[#4E3629]">Loading forecast data...</span>
          </div>
        )}

        {error && (
          <div className="mb-8 rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-center">
              <AlertCircle className="mr-3 h-5 w-5 text-red-600" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Error loading data</h3>
                <p className="mt-1 text-sm text-red-600">{error}</p>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && (
          <div className="overflow-hidden rounded-lg border border-[#A97A47] bg-white shadow-sm">
            <div className="flex flex-col gap-2 border-b border-[#E7D8C7] px-6 py-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-[#4E3629]">Forecast Details</h3>
                <p className="text-sm text-[#6B5142]">
                  {formatNumber(totalProducts)} products for {selectedMonthLabel} {selectedYear}
                </p>
              </div>
              <div className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${
                totalRemainingStock < 0
                  ? 'bg-red-50 text-red-700'
                  : 'bg-green-50 text-green-700'
              }`}>
                {totalRemainingStock < 0 ? (
                  <TrendingDown className="h-4 w-4" />
                ) : (
                  <TrendingUp className="h-4 w-4" />
                )}
                Remaining stock: {formatNumber(totalRemainingStock)}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#E7D8C7]">
                <thead className="bg-[#F9FAFB]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#4E3629]">
                      Product Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#4E3629]">
                      Product Code
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-[#4E3629]">
                      Actual Stock
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-[#4E3629]">
                      Predicted Stock
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-[#4E3629]">
                      Remaining Stock
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {forecastData.length > 0 ? (
                    forecastData.map((item, index) => {
                      const remainingStock = Number(item.remaining_stock || 0);

                      return (
                        <tr key={`${item.product_code}-${index}`} className={index % 2 === 0 ? 'bg-white' : 'bg-[#F9FAFB]'}>
                          <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-[#3D312B]">
                            {item.product_name || '-'}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-[#3D312B]">
                            {item.product_code || '-'}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-[#3D312B]">
                            {formatNumber(item.actual_stock)}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-[#3D312B]">
                            {formatNumber(item.predicted_stock)}
                          </td>
                          <td className={`whitespace-nowrap px-6 py-4 text-right text-sm font-semibold ${
                            remainingStock < 0 ? 'text-red-600' : 'text-green-700'
                          }`}>
                            {formatNumber(remainingStock)}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-sm text-[#6B5142]">
                        No forecast data available for this period.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ForecastPage;

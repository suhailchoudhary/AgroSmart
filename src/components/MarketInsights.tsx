import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Search, 
  MapPin, 
  Calendar,
  ChevronRight,
  BarChart3,
  PieChart as PieChartIcon,
  ArrowUpRight,
  ArrowDownRight,
  LineChart as LineChartIcon,
  History,
  Navigation
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { getMarketInsights } from '../services/gemini';
import { MarketPrice } from '../types';
import { cn } from '../utils/cn';
import { useLanguage } from '../contexts/LanguageContext';

const MOCK_MARKET_DATA: MarketPrice[] = [
  { crop: 'Wheat', currentPrice: 2450, predictedPrice: 2600, trend: 'up', volume: 4500 },
  { crop: 'Rice', currentPrice: 3100, predictedPrice: 3050, trend: 'down', volume: 3200 },
  { crop: 'Maize', currentPrice: 1950, predictedPrice: 2100, trend: 'up', volume: 2800 },
  { crop: 'Soybean', currentPrice: 4800, predictedPrice: 4850, trend: 'stable', volume: 1500 },
  { crop: 'Mustard', currentPrice: 5400, predictedPrice: 5800, trend: 'up', volume: 1200 },
];

const generateCropData = (basePrice: number) => {
  const history = Array.from({ length: 7 }, (_, i) => ({
    day: `-${7 - i}d`,
    price: basePrice * (0.95 + Math.random() * 0.1),
    type: 'history'
  }));
  const current = { day: 'Today', price: basePrice, type: 'current' };
  const prediction = Array.from({ length: 7 }, (_, i) => ({
    day: `+${i + 1}d`,
    price: basePrice * (1 + (i + 1) * 0.01 * (Math.random() > 0.3 ? 1 : -0.5)),
    type: 'prediction'
  }));
  return [...history, current, ...prediction];
};

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function MarketInsights() {
  const { t, language } = useLanguage();
  const [location, setLocation] = useState(t('common.detectingLocation'));
  const [loading, setLoading] = useState(false);
  const [prices, setPrices] = useState<MarketPrice[]>(MOCK_MARKET_DATA);
  const [selectedCrop, setSelectedCrop] = useState(MOCK_MARKET_DATA[0]);
  const [chartData, setChartData] = useState(generateCropData(MOCK_MARKET_DATA[0].currentPrice));
  const [marketAlerts, setMarketAlerts] = useState<{ type: string; message: string }[]>([
    { type: 'info', message: t('common.wheatPriceAlert') }
  ]);

  useEffect(() => {
    setChartData(generateCropData(selectedCrop.currentPrice));
  }, [selectedCrop]);

  const fetchInsights = async (loc?: string) => {
    const targetLoc = loc || location;
    setLoading(true);
    try {
      const data = await getMarketInsights(targetLoc, language);
      if (data && data.prices && data.prices.length > 0) {
        setPrices(data.prices);
        setSelectedCrop(data.prices[0]);
        if (data.locationName) {
          setLocation(data.locationName);
        }
        if (data.alerts) {
          setMarketAlerts(data.alerts);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const detectLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const locStr = `${pos.coords.latitude}, ${pos.coords.longitude}`;
        setLoading(true);
        try {
          const data = await getMarketInsights(locStr, language);
          if (data && data.prices && data.prices.length > 0) {
            setPrices(data.prices);
            setSelectedCrop(data.prices[0]);
            if (data.locationName) {
              setLocation(data.locationName);
            }
            if (data.alerts) {
              setMarketAlerts(data.alerts);
            }
          }
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      });
    }
  };

  useEffect(() => {
    detectLocation();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Search & Location */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-zinc-100 shadow-sm">
        <div className="flex items-center gap-3 flex-1 w-full">
          <div className="p-2 bg-emerald-50 rounded-xl">
            <MapPin className="w-5 h-5 text-emerald-600" />
          </div>
          <input 
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="bg-transparent border-none focus:ring-0 text-lg font-semibold text-zinc-900 w-full"
            placeholder={t('common.enterRegion')}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button 
            onClick={detectLocation}
            className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-all"
            title={t('common.detectLocation')}
          >
            <Navigation className="w-5 h-5" />
          </button>
          <button 
            onClick={() => fetchInsights()}
            disabled={loading}
            className="px-6 py-2.5 bg-zinc-900 text-white rounded-xl font-semibold hover:bg-zinc-800 transition-all flex items-center gap-2 disabled:opacity-50 flex-1 md:flex-none"
          >
            {loading ? <Loader /> : <Search className="w-4 h-4" />}
            {t('common.updateInsights')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Price Table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-zinc-50 flex items-center justify-between">
              <h3 className="font-bold text-zinc-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                {t('common.liveMarketPrices')}
              </h3>
              <span className="text-xs text-zinc-400 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> {t('common.updated2hAgo')}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-zinc-50/50 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                    <th className="px-6 py-4">{t('common.crop')}</th>
                    <th className="px-6 py-4">{t('common.currentPrice')}</th>
                    <th className="px-6 py-4">{t('common.predictedPrice')} (7d)</th>
                    <th className="px-6 py-4">{t('common.trend')}</th>
                    <th className="px-6 py-4">{t('common.action')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {prices.map((item, i) => (
                    <tr 
                      key={i} 
                      onClick={() => setSelectedCrop(item)}
                      className={cn(
                        "hover:bg-zinc-50/30 transition-colors group cursor-pointer",
                        selectedCrop.crop === item.crop ? "bg-emerald-50/50" : ""
                      )}
                    >
                      <td className="px-6 py-4 font-semibold text-zinc-900">{item.crop}</td>
                      <td className="px-6 py-4 text-sm text-zinc-600">₹{item.currentPrice.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm font-medium text-emerald-600">₹{item.predictedPrice.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <TrendBadge trend={item.trend} t={t} />
                      </td>
                      <td className="px-6 py-4">
                        <button className="p-2 rounded-lg hover:bg-zinc-100 text-zinc-400 group-hover:text-zinc-900 transition-all">
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Prediction Graph */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
                  <LineChartIcon className="w-6 h-6 text-emerald-600" />
                  {t('common.sevenDayPrediction')}
                </h3>
                <p className="text-sm text-zinc-500 mt-1">{t('common.forecastingFor')} {selectedCrop.crop}</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{t('common.expectedRoi')}</span>
                <p className="text-xl font-black text-emerald-600">+{Math.round(((selectedCrop.predictedPrice - selectedCrop.currentPrice) / selectedCrop.currentPrice) * 100)}%</p>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#71717a'}} />
                  <YAxis hide domain={['dataMin - 100', 'dataMax + 100']} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => [`₹${Math.round(value)}`, t('common.price')]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#10b981" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorPrice)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Market Sentiment */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
            <h3 className="font-bold text-zinc-900 mb-6 flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-amber-600" />
              {t('common.marketShare')}
            </h3>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={prices}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey={prices[0]?.marketShare ? "marketShare" : "volume"}
                  >
                    {prices.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {prices.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-zinc-600 font-medium">{item.crop}</span>
                  </div>
                  <span className="text-zinc-400">
                    {item.marketShare ? `${item.marketShare}%` : `${Math.round((item.volume / prices.reduce((acc, p) => acc + p.volume, 0)) * 100)}%`}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
            <h3 className="font-bold text-zinc-900 mb-6 flex items-center gap-2">
              <History className="w-5 h-5 text-blue-600" />
              {t('common.historicalVolume')}
            </h3>
            <div className="h-[150px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={prices}>
                  <Bar dataKey={prices[0]?.historicalVolume ? "historicalVolume" : "volume"} radius={[4, 4, 0, 0]}>
                    {prices.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} opacity={0.6} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-zinc-900 p-8 rounded-[2.5rem] text-white shadow-xl shadow-zinc-900/20">
            <h4 className="font-bold text-lg mb-2">{t('common.marketAlerts')}</h4>
            <div className="space-y-4">
              {marketAlerts.map((alert, i) => (
                <div key={i} className={cn(
                  "p-3 rounded-xl text-sm",
                  alert.type === 'warning' ? "bg-amber-500/10 text-amber-200" : 
                  alert.type === 'success' ? "bg-emerald-500/10 text-emerald-200" :
                  "bg-white/10 text-zinc-300"
                )}>
                  {alert.message}
                </div>
              ))}
            </div>
            <button className="mt-6 w-full py-3 bg-white text-zinc-900 rounded-xl font-bold text-sm hover:bg-zinc-100 transition-all flex items-center justify-center gap-2">
              {t('common.viewFullReport')}
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TrendBadge({ trend, t }: { trend: string, t: any }) {
  const config: any = {
    up: { icon: <ArrowUpRight className="w-3 h-3" />, color: 'bg-emerald-100 text-emerald-700', label: t('common.rising') },
    down: { icon: <ArrowDownRight className="w-3 h-3" />, color: 'bg-rose-100 text-rose-700', label: t('common.falling') },
    stable: { icon: <Minus className="w-3 h-3" />, color: 'bg-zinc-100 text-zinc-700', label: t('common.stable') },
  };

  const { icon, color, label } = config[trend] || config.stable;

  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider", color)}>
      {icon}
      {label}
    </span>
  );
}

function Loader() {
  return <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />;
}


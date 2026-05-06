import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Sprout, 
  Bug, 
  TrendingUp, 
  CloudSun, 
  MessageSquare,
  Droplets,
  Thermometer,
  Wind,
  MapPin,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Cell
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { cn } from '../utils/cn';
import { getWeatherData } from '../services/weather';
import { useLanguage } from '../contexts/LanguageContext';

const MOCK_YIELD_DATA = [
  { month: 'Jan', yield: 400, price: 2400 },
  { month: 'Feb', yield: 300, price: 1398 },
  { month: 'Mar', yield: 200, price: 9800 },
  { month: 'Apr', yield: 278, price: 3908 },
  { month: 'May', yield: 189, price: 4800 },
  { month: 'Jun', yield: 239, price: 3800 },
  { month: 'Jul', yield: 349, price: 4300 },
];

const MOCK_SOIL_HISTORY = [
  { date: '2024-01', N: 80, P: 45, K: 30, pH: 6.5 },
  { date: '2024-02', N: 75, P: 48, K: 35, pH: 6.4 },
  { date: '2024-03', N: 85, P: 42, K: 40, pH: 6.6 },
];

const FARM_MAP_DATA = [
  { id: 1, x: 0, y: 0, crop: 'Wheat', health: 95, moisture: 65 },
  { id: 2, x: 1, y: 0, crop: 'Barley', health: 88, moisture: 58 },
  { id: 3, x: 2, y: 0, crop: 'Mustard', health: 82, moisture: 72 },
  { id: 4, x: 0, y: 1, crop: 'Wheat', health: 92, moisture: 60 },
  { id: 5, x: 1, y: 1, crop: 'Empty', health: 0, moisture: 45 },
  { id: 6, x: 2, y: 1, crop: 'Barley', health: 85, moisture: 55 },
];

export default function Dashboard() {
  const { t } = useLanguage();
  const [soilRecords, setSoilRecords] = useState<any[]>([]);
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSoilRecords = async () => {
      if (!auth.currentUser) return;
      try {
        const q = query(
          collection(db, 'soil_records'),
          where('uid', '==', auth.currentUser.uid),
          orderBy('timestamp', 'desc'),
          limit(5)
        );
        const snapshot = await getDocs(q);
        setSoilRecords(snapshot.docs.map(doc => doc.data()));
      } catch (error) {
        console.error("Error fetching soil records:", error);
      }
    };

    const fetchWeather = async () => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(async (pos) => {
          try {
            const data = await getWeatherData(`${pos.coords.latitude}, ${pos.coords.longitude}`);
            setWeather(data);
          } catch (e) {
            console.error(e);
          }
        });
      }
    };

    const init = async () => {
      setLoading(true);
      await Promise.all([fetchSoilRecords(), fetchWeather()]);
      setLoading(false);
    };

    init();
  }, []);

  const latestSoil = soilRecords[0] || { N: 80, P: 45, K: 30, ph: 6.5, recommendations: [] };
  const radarData = [
    { subject: t('common.nitrogen'), A: latestSoil.nitrogen || latestSoil.N || 0, fullMark: 150 },
    { subject: t('common.phosphorus'), A: latestSoil.phosphorus || latestSoil.P || 0, fullMark: 150 },
    { subject: t('common.potassium'), A: latestSoil.potassium || latestSoil.K || 0, fullMark: 150 },
    { subject: t('common.ph'), A: (latestSoil.ph || 6.5) * 10, fullMark: 140 },
  ];

  const yieldData = [
    { month: t('common.jan'), yield: 400, price: 2400 },
    { month: t('common.feb'), yield: 300, price: 1398 },
    { month: t('common.mar'), yield: 200, price: 9800 },
    { month: t('common.apr'), yield: 278, price: 3908 },
    { month: t('common.may'), yield: 189, price: 4800 },
    { month: t('common.jun'), yield: 239, price: 3800 },
    { month: t('common.jul'), yield: 349, price: 4300 },
  ];

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title={t('common.soilHealth')} 
          value={latestSoil.ph ? `${t('common.good')}` : t('common.loading')} 
          subtitle={`pH ${latestSoil.ph || 6.5} | ${t('common.npkOptimal')}`}
          icon={<Droplets className="w-5 h-5 text-emerald-500" />}
          trend={`+5% ${t('common.fromLastMonth')}`}
          color="emerald"
        />
        <StatCard 
          title={t('common.weatherForecast')} 
          value={weather?.current?.temp ? `${weather.current.temp}°C` : "28°C"} 
          subtitle={weather?.current ? `${weather.current.condition} | ${weather.current.humidity}% ${t('common.humidity')}` : `Sunny | 65% ${t('common.humidity')}`}
          icon={<CloudSun className="w-5 h-5 text-amber-500" />}
          trend={weather?.alerts?.[0] || t('common.noRainExpected')}
          color="amber"
        />
        <StatCard 
          title={t('common.marketTrend')} 
          value={t('common.wheat')} 
          subtitle={`₹2,450 / ${t('common.quintal')}`}
          icon={<TrendingUp className="w-5 h-5 text-blue-500" />}
          trend={`↑ 12% ${t('common.thisWeek')}`}
          color="blue"
        />
        <StatCard 
          title={t('common.activeAlerts')} 
          value="2" 
          subtitle={t('common.pestRisk')}
          icon={<AlertTriangle className="w-5 h-5 text-rose-500" />}
          trend={t('common.checkDiseaseDetector')}
          color="rose"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Yield Trends */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-zinc-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-zinc-400" />
              {t('common.yieldPriceTrends')}
            </h3>
            <div className="flex gap-2">
              <span className="flex items-center gap-1 text-xs text-zinc-500">
                <div className="w-2 h-2 rounded-full bg-emerald-500" /> {t('common.yield')}
              </span>
              <span className="flex items-center gap-1 text-xs text-zinc-500">
                <div className="w-2 h-2 rounded-full bg-blue-500" /> {t('common.currentPrice')}
              </span>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={yieldData}>
                <defs>
                  <linearGradient id="colorYield" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#71717a'}} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="yield" stroke="#10b981" fillOpacity={1} fill="url(#colorYield)" strokeWidth={2} />
                <Area type="monotone" dataKey="price" stroke="#3b82f6" fill="transparent" strokeWidth={2} strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Soil Analytics Radar */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
          <h3 className="font-semibold text-zinc-900 mb-6 flex items-center gap-2">
            <Droplets className="w-4 h-4 text-zinc-400" />
            {t('common.soilComposition')}
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#f4f4f5" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#71717a' }} />
                <PolarRadiusAxis angle={30} domain={[0, 150]} hide />
                <Radar
                  name="Soil"
                  dataKey="A"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.6}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100">
              <div className="text-[10px] text-zinc-400 uppercase font-bold">{t('common.nitrogen')}</div>
              <div className="text-lg font-bold text-zinc-900">{latestSoil.nitrogen || latestSoil.N || 0}</div>
            </div>
            <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100">
              <div className="text-[10px] text-zinc-400 uppercase font-bold">{t('common.ph')}</div>
              <div className="text-lg font-bold text-zinc-900">{latestSoil.ph || 6.5}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Farm Map Visualization */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-zinc-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-zinc-400" />
              {t('common.farmMapHealth')}
            </h3>
            <div className="flex gap-2">
              <div className="flex items-center gap-1 text-[10px] text-zinc-400 uppercase font-bold">
                <div className="w-2 h-2 rounded-full bg-emerald-500" /> {t('common.highHealth')}
              </div>
              <div className="flex items-center gap-1 text-[10px] text-zinc-400 uppercase font-bold">
                <div className="w-2 h-2 rounded-full bg-amber-500" /> {t('common.moderate')}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            {FARM_MAP_DATA.map((field) => (
              <motion.div 
                key={field.id}
                whileHover={{ scale: 1.02 }}
                className={cn(
                  "aspect-square rounded-2xl p-4 flex flex-col justify-between border-2 transition-all cursor-pointer",
                  field.crop === 'Empty' 
                    ? "bg-zinc-50 border-zinc-100 border-dashed" 
                    : field.health > 90 
                      ? "bg-emerald-50 border-emerald-100" 
                      : "bg-amber-50 border-amber-100"
                )}
              >
                <div className="flex justify-between items-start">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center",
                    field.crop === 'Empty' ? "bg-zinc-200" : "bg-white shadow-sm"
                  )}>
                    {field.crop === 'Empty' ? <AlertTriangle className="w-4 h-4 text-zinc-400" /> : <Sprout className="w-4 h-4 text-emerald-600" />}
                  </div>
                  <span className="text-[10px] font-bold text-zinc-400">#{field.id}</span>
                </div>
                <div>
                  <h4 className="font-bold text-zinc-900 text-sm">{field.crop}</h4>
                  {field.crop !== 'Empty' && (
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1 bg-zinc-200 rounded-full overflow-hidden">
                        <div 
                          className={cn("h-full", field.health > 90 ? "bg-emerald-500" : "bg-amber-500")} 
                          style={{ width: `${field.health}%` }} 
                        />
                      </div>
                      <span className="text-[10px] font-bold text-zinc-500">{field.health}%</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent Recommendations */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-zinc-900 flex items-center gap-2">
              <Sprout className="w-4 h-4 text-zinc-400" />
              {t('common.topRecommendedCrops')}
            </h3>
            <button className="text-sm text-emerald-600 font-medium hover:underline flex items-center gap-1">
              {t('common.viewAll')} <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-4">
            {latestSoil.recommendations && latestSoil.recommendations.length > 0 ? (
              latestSoil.recommendations.slice(0, 3).map((res: any) => (
                <CropCard 
                  key={res.crop}
                  crop={res.crop} 
                  score={res.suitabilityScore} 
                  yield={res.yieldPrediction} 
                  profit={res.profitabilityEstimate} 
                  t={t} 
                />
              ))
            ) : (
              <>
                <CropCard crop="Wheat" score={94} yield="2.8t/ac" profit={t('common.high')} t={t} />
                <CropCard crop="Barley" score={88} yield="2.2t/ac" profit={t('common.medium')} t={t} />
                <CropCard crop="Mustard" score={82} yield="1.5t/ac" profit={t('common.high')} t={t} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle, icon, trend, color }: any) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className={cn("p-2 rounded-xl", `bg-${color}-50`)}>
          {icon}
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
          {title}
        </span>
      </div>
      <div className="space-y-1">
        <h4 className="text-2xl font-bold text-zinc-900">{value}</h4>
        <p className="text-xs text-zinc-500">{subtitle}</p>
      </div>
      <div className="mt-4 pt-4 border-t border-zinc-50">
        <span className="text-[11px] text-zinc-400 italic">{trend}</span>
      </div>
    </div>
  );
}

function CropCard({ crop, score, yield: y, profit, t }: any) {
  return (
    <div className="p-4 rounded-xl border border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-zinc-100 shadow-sm">
          <Sprout className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h5 className="font-semibold text-zinc-900">{crop}</h5>
          <p className="text-[10px] text-zinc-500 uppercase tracking-tighter">
            {t('common.yield')}: {y} | {t('common.profit')}: {profit}
          </p>
        </div>
      </div>
      <div className="text-right">
        <div className="text-lg font-bold text-emerald-600">{score}%</div>
        <div className="text-[10px] text-zinc-400 font-medium uppercase">{t('common.match')}</div>
      </div>
    </div>
  );
}


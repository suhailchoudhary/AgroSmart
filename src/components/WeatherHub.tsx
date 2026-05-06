import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  CloudRain, 
  CloudSun, 
  Sun, 
  Wind, 
  Droplets, 
  Thermometer, 
  AlertTriangle,
  MapPin,
  Search,
  Calendar,
  ArrowUp,
  ArrowDown,
  Navigation
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getWeatherData } from '../services/weather';
import { cn } from '../utils/cn';
import { useLanguage } from '../contexts/LanguageContext';

interface WeatherData {
  locationName?: string;
  current: {
    temp: number;
    humidity: number;
    condition: string;
    windSpeed: number;
    predictedRainfall: string;
  };
  forecast: Array<{
    day: string;
    temp: number;
    condition: string;
    rainChance: number;
  }>;
  alerts: string[];
}

export default function WeatherHub() {
  const { t, language } = useLanguage();
  const [location, setLocation] = useState(t('common.detectingLocation'));
  const [loading, setLoading] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);

  const fetchWeather = async () => {
    setLoading(true);
    try {
      const data = await getWeatherData(location, language);
      setWeather(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const detectLocation = () => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            // Use coordinates to fetch weather
            setLoading(true);
            try {
              const data = await getWeatherData(`${latitude}, ${longitude}`, language);
              setWeather(data);
              // Update location string if the data includes a location name
              if (data.locationName) {
                setLocation(data.locationName);
              } else {
                setLocation(`${latitude.toFixed(2)}, ${longitude.toFixed(2)}`);
              }
            } catch (error) {
              console.error("Error fetching weather for coordinates:", error);
              fetchWeather(); // Fallback to default
            } finally {
              setLoading(false);
            }
          },
          (error) => {
            console.error("Geolocation error:", error);
            fetchWeather(); // Fallback to default
          }
        );
      } else {
        fetchWeather();
      }
    };

    detectLocation();
  }, []);

  const getWeatherIcon = (condition: string) => {
    const c = condition.toLowerCase();
    if (c.includes('sun') || c.includes('clear')) return <Sun className="w-8 h-8 text-amber-500" />;
    if (c.includes('rain')) return <CloudRain className="w-8 h-8 text-blue-500" />;
    if (c.includes('cloud')) return <CloudSun className="w-8 h-8 text-zinc-400" />;
    return <Cloud className="w-8 h-8 text-zinc-400" />;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Search Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-zinc-100 shadow-sm">
        <div className="flex items-center gap-3 flex-1 w-full">
          <div className="p-2 bg-blue-50 rounded-2xl">
            <MapPin className="w-5 h-5 text-blue-600" />
          </div>
          <input 
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="bg-transparent border-none focus:ring-0 text-lg font-bold text-zinc-900 w-full"
            placeholder={t('common.searchLocation')}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button 
            onClick={() => {
              if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(
                  async (position) => {
                    const { latitude, longitude } = position.coords;
                    setLoading(true);
                    try {
                      const data = await getWeatherData(`${latitude}, ${longitude}`, language);
                      setWeather(data);
                      if (data.locationName) setLocation(data.locationName);
                    } catch (e) {
                      console.error(e);
                    } finally {
                      setLoading(false);
                    }
                  }
                );
              }
            }}
            className="p-3 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-100 transition-all"
            title={t('common.detectLocation')}
          >
            <Navigation className="w-5 h-5" />
          </button>
          <button 
            onClick={fetchWeather}
            disabled={loading}
            className="px-6 py-3 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-zinc-800 transition-all flex items-center gap-2 disabled:opacity-50 flex-1 md:flex-none"
          >
            {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Search className="w-4 h-4" />}
            {t('common.checkWeather')}
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {weather && !loading ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Current Weather Card */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-blue-600/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="space-y-4 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-widest">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      {t('common.liveNow')}
                    </div>
                    <h3 className="text-7xl font-black tracking-tighter">{weather?.current?.temp ?? '--'}°</h3>
                    <div className="space-y-1">
                      <p className="text-2xl font-bold">{weather?.current?.condition || t('common.loading')}</p>
                      <p className="text-blue-100">{location}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <WeatherStat icon={<Droplets className="w-5 h-5" />} label={t('common.humidity')} value={`${weather?.current?.humidity ?? '--'}%`} />
                    <WeatherStat icon={<Wind className="w-5 h-5" />} label={t('common.wind')} value={`${weather?.current?.windSpeed ?? '--'} km/h`} />
                    <WeatherStat icon={<CloudRain className="w-5 h-5" />} label={t('common.rainfall')} value={weather?.current?.predictedRainfall || '--'} />
                    <WeatherStat icon={<Thermometer className="w-5 h-5" />} label={t('common.feelsLike')} value={`${(weather?.current?.temp ?? 27) - 2}°`} />
                  </div>
                </div>
              </div>

              {/* 7-Day Forecast */}
              <div className="bg-white rounded-[2.5rem] p-8 border border-zinc-100 shadow-sm">
                <h4 className="text-xl font-bold text-zinc-900 mb-8 flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-blue-600" />
                  {t('common.sevenDayForecast')}
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
                  {weather.forecast.map((day, i) => (
                    <div key={i} className="flex flex-col items-center p-4 rounded-3xl bg-zinc-50 border border-zinc-100 hover:border-blue-200 transition-all group">
                      <span className="text-xs font-bold text-zinc-400 uppercase mb-3">{day.day}</span>
                      {getWeatherIcon(day.condition)}
                      <span className="text-lg font-bold text-zinc-900 mt-3">{day.temp}°</span>
                      <div className="flex items-center gap-1 text-[10px] text-blue-500 font-bold mt-1">
                        <CloudRain className="w-3 h-3" />
                        {day.rainChance}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar: Alerts & Insights */}
            <div className="space-y-6">
              {/* Climate Alerts */}
              <div className="bg-rose-50 rounded-[2.5rem] p-8 border border-rose-100">
                <h4 className="text-lg font-bold text-rose-900 mb-6 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  {t('common.climateRiskAlerts')}
                </h4>
                <div className="space-y-4">
                  {weather.alerts.map((alert, i) => (
                    <div key={i} className="flex gap-3 p-4 bg-white rounded-2xl border border-rose-200 shadow-sm">
                      <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-5 h-5 text-rose-600" />
                      </div>
                      <p className="text-sm text-rose-900 font-medium leading-relaxed">{alert}</p>
                    </div>
                  ))}
                  {weather.alerts.length === 0 && (
                    <div className="text-center py-8">
                      <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                      <p className="text-sm text-zinc-500 font-medium">{t('common.noClimateRisks')}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Farming Advice */}
              <div className="bg-zinc-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-zinc-900/20">
                <h4 className="text-lg font-bold mb-4">{t('common.smartAdvice')}</h4>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  {t('common.weatherAdvice')}
                </p>
                <div className="mt-8 p-4 bg-white/10 rounded-2xl border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">{t('common.soilMoisture')}</span>
                    <span className="text-xs font-bold text-emerald-400">{t('common.optimal')}</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[65%]" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="h-[60vh] flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function WeatherStat({ icon, label, value }: any) {
  return (
    <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex flex-col gap-1">
      <div className="flex items-center gap-2 text-blue-200">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
      </div>
      <span className="text-xl font-bold">{value}</span>
    </div>
  );
}

function CheckCircle2({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

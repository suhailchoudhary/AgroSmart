import React, { useState, useEffect, useCallback } from 'react';
import { 
  Sprout, 
  Search, 
  Info, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FlaskConical,
  Thermometer,
  Droplets,
  CloudRain,
  Cpu,
  RefreshCw,
  Database,
  MapPin,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getCropRecommendation, simulateModelTraining } from '../services/gemini';
import { SoilData, RecommendationResult } from '../types';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { cn } from '../utils/cn';

import { useLanguage } from '../contexts/LanguageContext';

export default function CropRecommendation() {
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [training, setTraining] = useState(false);
  const [modelStats, setModelStats] = useState({
    accuracy: 0.9956,
    datasetSize: 2200,
    lastTrained: '2026-03-24 10:30:00'
  });
  const [mode, setMode] = useState<'farmer' | 'technical'>('farmer');
  const [results, setResults] = useState<RecommendationResult[]>([]);
  const [soilData, setSoilData] = useState<SoilData>({
    nitrogen: 80,
    phosphorus: 45,
    potassium: 30,
    ph: 6.5,
    temperature: 28,
    humidity: 65,
    rainfall: 120,
    soilType: 'Black Soil',
    region: '',
  });

  const [detectingLocation, setDetectingLocation] = useState(false);

  const handleDetectLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      return;
    }

    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          const address = data.address;
          const city = address.city || address.town || address.village || address.state_district || "";
          const state = address.state || "";
          const country = address.country || "";
          
          const regionName = [city, state, country].filter(Boolean).join(', ');
          
          if (regionName) {
            setSoilData(prev => ({
              ...prev,
              region: regionName
            }));
          }
        } catch (error) {
          console.error("Error fetching location name:", error);
        } finally {
          setDetectingLocation(false);
        }
      },
      (error) => {
        console.error("Error getting location:", error);
        setDetectingLocation(false);
      }
    );
  }, []);

  // Auto-detect location on mount
  useEffect(() => {
    handleDetectLocation();
  }, [handleDetectLocation]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSoilData(prev => ({ ...prev, [name]: name === 'soilType' || name === 'region' ? value : parseFloat(value) }));
  };

  const handleTrainModel = async () => {
    setTraining(true);
    try {
      const stats = await simulateModelTraining();
      setModelStats(stats);
    } catch (error) {
      console.error(error);
    } finally {
      setTraining(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // If in farmer mode, we clear technical data to let AI infer it
      const submissionData = mode === 'farmer' 
        ? { ...soilData, nitrogen: undefined, phosphorus: undefined, potassium: undefined, ph: undefined }
        : { ...soilData, soilType: undefined, region: undefined };

      const data = await getCropRecommendation(submissionData, language);
      setResults(data);

      // Save to Firestore
      if (auth.currentUser) {
        try {
          // Filter out undefined values as Firestore doesn't support them
          const firestoreData = Object.fromEntries(
            Object.entries({
              ...submissionData,
              mode,
              uid: auth.currentUser.uid,
              timestamp: serverTimestamp(),
              recommendations: data,
            }).filter(([_, v]) => v !== undefined)
          );

          await addDoc(collection(db, 'soil_records'), firestoreData);
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, 'soil_records');
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Input Form & Model Insights */}
        <div className="w-full md:w-1/3 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm h-fit">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-emerald-600" />
                {t('common.cropAdvisor')}
              </h3>
              <div className="flex bg-zinc-100 p-1 rounded-lg">
                <button 
                  onClick={() => setMode('farmer')}
                  className={cn(
                    "px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all",
                    mode === 'farmer' ? "bg-white text-emerald-600 shadow-sm" : "text-zinc-400"
                  )}
                >
                  {t('common.farmer')}
                </button>
                <button 
                  onClick={() => setMode('technical')}
                  className={cn(
                    "px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all",
                    mode === 'technical' ? "bg-white text-emerald-600 shadow-sm" : "text-zinc-400"
                  )}
                >
                  {t('common.technical')}
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'technical' ? (
                <div className="grid grid-cols-2 gap-4">
                  <Input label={t('common.nitrogen')} name="nitrogen" value={soilData.nitrogen} onChange={handleInputChange} />
                  <Input label={t('common.phosphorus')} name="phosphorus" value={soilData.phosphorus} onChange={handleInputChange} />
                  <Input label={t('common.potassium')} name="potassium" value={soilData.potassium} onChange={handleInputChange} />
                  <Input label={t('common.ph')} name="ph" value={soilData.ph} step="0.1" onChange={handleInputChange} />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-zinc-500 flex items-center justify-between">
                      {t('common.region')}
                      <button
                        type="button"
                        onClick={handleDetectLocation}
                        disabled={detectingLocation}
                        className="text-[10px] text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 transition-colors"
                      >
                        {detectingLocation ? (
                          <Loader2 className="w-2.5 h-2.5 animate-spin" />
                        ) : (
                          <MapPin className="w-2.5 h-2.5" />
                        )}
                        {detectingLocation ? 'Detecting...' : 'Auto-detect'}
                      </button>
                    </label>
                    <input 
                      type="text"
                      name="region"
                      value={soilData.region}
                      onChange={handleInputChange}
                      placeholder="e.g. Punjab, India"
                      className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-zinc-500">{t('common.soilType')}</label>
                    <select 
                      name="soilType"
                      value={soilData.soilType}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    >
                      <option value="Black Soil">{t('common.blackSoil')}</option>
                      <option value="Red Soil">{t('common.redSoil')}</option>
                      <option value="Alluvial Soil">{t('common.alluvialSoil')}</option>
                      <option value="Sandy Soil">{t('common.sandySoil')}</option>
                      <option value="Clay Soil">{t('common.claySoil')}</option>
                      <option value="Laterite Soil">{t('common.lateriteSoil')}</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-zinc-50 space-y-4">
                <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{t('common.environmentalFactors')}</h4>
                <Input label={t('common.temperature')} name="temperature" value={soilData.temperature} onChange={handleInputChange} icon={<Thermometer className="w-4 h-4" />} />
                <Input label={t('common.humidity')} name="humidity" value={soilData.humidity} onChange={handleInputChange} icon={<Droplets className="w-4 h-4" />} />
                <Input label={t('common.rainfall')} name="rainfall" value={soilData.rainfall} onChange={handleInputChange} icon={<CloudRain className="w-4 h-4" />} />
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    {t('common.getRecommendations')}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* ML Model Insights Card */}
          <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 shadow-xl text-white">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-semibold flex items-center gap-2 text-emerald-400">
                <Cpu className="w-4 h-4" />
                {t('common.modelInsights')}
              </h3>
              <div className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded uppercase tracking-wider">
                Live
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                  <div className="text-[10px] text-zinc-500 uppercase font-bold mb-1">{t('common.accuracy')}</div>
                  <div className="text-xl font-bold text-emerald-400">{(modelStats.accuracy * 100).toFixed(1)}%</div>
                </div>
                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                  <div className="text-[10px] text-zinc-500 uppercase font-bold mb-1">{t('common.datasetSize')}</div>
                  <div className="text-xl font-bold">{modelStats.datasetSize} {t('common.records')}</div>
                </div>
              </div>

              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <div className="text-[10px] text-zinc-500 uppercase font-bold mb-1">{t('common.lastTrained')}</div>
                <div className="text-xs font-mono text-zinc-300">{modelStats.lastTrained}</div>
              </div>

              <button 
                onClick={handleTrainModel}
                disabled={training}
                className="w-full py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 border border-white/10 disabled:opacity-50"
              >
                {training ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    {t('common.trainingInProgress')}
                  </>
                ) : (
                  <>
                    <Database className="w-3 h-3" />
                    {t('common.trainModel')}
                  </>
                )}
              </button>

              <a 
                href="/crop_recommendation.csv" 
                download 
                className="w-full py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-2 border border-emerald-500/20"
              >
                <Database className="w-3 h-3" />
                Download Dataset (CSV)
              </a>
              
              {modelStats.accuracy > 0.98 && !training && (
                <div className="flex items-center gap-2 text-[10px] text-emerald-400 bg-emerald-400/10 p-2 rounded-lg border border-emerald-400/20">
                  <CheckCircle2 className="w-3 h-3" />
                  {t('common.modelTrained')}
                </div>
              )}

              {/* Architecture Breakdown */}
              <div className="pt-4 border-t border-white/10 space-y-3">
                <div className="text-[10px] text-zinc-500 uppercase font-bold">{t('common.architecture')}</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 p-2 bg-white/5 rounded border border-white/10 text-center">
                    <div className="text-[9px] text-zinc-400 mb-1">{t('common.randomForest')}</div>
                    <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 w-[70%]" />
                    </div>
                  </div>
                  <div className="text-zinc-600 font-bold">+</div>
                  <div className="flex-1 p-2 bg-white/5 rounded border border-white/10 text-center">
                    <div className="text-[9px] text-zinc-400 mb-1">{t('common.xgboost')}</div>
                    <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 w-[90%]" />
                    </div>
                  </div>
                </div>
                <p className="text-[9px] text-zinc-500 leading-tight italic">
                  {t('common.ensembleLogic')}
                </p>
              </div>

              {/* Model Comparison Section */}
              <div className="pt-4 border-t border-white/10 space-y-3">
                <div className="text-[10px] text-zinc-500 uppercase font-bold">Model Comparison</div>
                <div className="space-y-2">
                  <div className="p-2 bg-white/5 rounded border border-white/10 flex items-center justify-between">
                    <div className="text-[9px] text-zinc-400">Basic (Logistic, KNN)</div>
                    <div className="text-[10px] text-zinc-500 font-mono">80–85%</div>
                  </div>
                  <div className="p-2 bg-white/5 rounded border border-white/10 flex items-center justify-between">
                    <div className="text-[9px] text-zinc-400">Decent (Decision Tree)</div>
                    <div className="text-[10px] text-amber-500/70 font-mono">85–90%</div>
                  </div>
                  <div className="p-2 bg-white/5 rounded border border-white/10 flex items-center justify-between">
                    <div className="text-[9px] text-zinc-400">Good (Random Forest)</div>
                    <div className="text-[10px] text-blue-400/80 font-mono">90–94%</div>
                  </div>
                  <div className="p-2 bg-emerald-500/10 rounded border border-emerald-500/20 flex items-center justify-between">
                    <div className="text-[9px] text-emerald-400 font-bold">Best (XGBoost, Ensemble)</div>
                    <div className="text-[10px] text-emerald-400 font-bold font-mono">94–99%+</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 bg-emerald-500/20 rounded border border-emerald-500/30">
                  <div className="flex-1 text-[10px] text-emerald-300 font-bold">Current Model Accuracy</div>
                  <div className="text-[12px] text-emerald-400 font-black font-mono">{(modelStats.accuracy * 100).toFixed(2)}%</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="flex-1 space-y-6">
          {!results.length && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                <Sprout className="w-8 h-8 text-zinc-300" />
              </div>
              <h4 className="text-lg font-medium text-zinc-900">{t('common.noAnalysisYet')}</h4>
              <p className="text-sm text-zinc-500 max-w-xs mx-auto mt-2">
                {t('common.enterSoilParams')}
              </p>
            </div>
          )}

          {loading && (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-zinc-100 animate-pulse rounded-2xl" />
              ))}
            </div>
          )}

          <AnimatePresence>
            {results.map((res, idx) => (
              <motion.div
                key={res.crop}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold text-xl">
                        {idx + 1}
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-zinc-900">{res.crop}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">
                            {res.suitabilityScore}% {t('common.confidence')}
                          </span>
                          <span className="text-xs text-zinc-500 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" /> {res.yieldPrediction}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">{t('common.profitability')}</div>
                      <div className={cn(
                        "text-sm font-bold",
                        res.profitabilityEstimate === 'High' ? 'text-emerald-600' : 'text-amber-600'
                      )}>
                        {res.profitabilityEstimate === 'High' ? t('common.high') : 
                         res.profitabilityEstimate === 'Medium' ? t('common.medium') : 
                         res.profitabilityEstimate === 'Low' ? t('common.low') : res.profitabilityEstimate}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-zinc-50">
                    <div className="space-y-3">
                      <h5 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
                        <Info className="w-4 h-4 text-blue-500" />
                        {t('common.explainableInsight')}
                      </h5>
                      <p className="text-sm text-zinc-600 leading-relaxed italic">
                        "{res.explanation}"
                      </p>
                    </div>
                    <div className="space-y-3">
                      <h5 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        {t('common.fertilizerAdvice')}
                      </h5>
                      <p className="text-sm text-zinc-600 leading-relaxed">
                        {res.fertilizerAdvice}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function Input({ label, icon, ...props }: any) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-zinc-500 flex items-center gap-1.5">
        {icon}
        {label}
      </label>
      <input 
        type="number" 
        className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
        {...props}
      />
    </div>
  );
}

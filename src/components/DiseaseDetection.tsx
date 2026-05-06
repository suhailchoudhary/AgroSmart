import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  Bug, 
  AlertCircle, 
  CheckCircle2, 
  Info, 
  RefreshCcw,
  X,
  Search,
  History,
  Calendar,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, addDoc, serverTimestamp, query, where, orderBy, getDocs, limit } from 'firebase/firestore';
import { detectCropDisease } from '../services/gemini';
import { DiseaseDetectionResult } from '../types';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { cn } from '../utils/cn';

import { useLanguage } from '../contexts/LanguageContext';

export default function DiseaseDetection() {
  const { t, language } = useLanguage();
  const [view, setView] = useState<'detect' | 'history'>('detect');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiseaseDetectionResult | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchHistory = async () => {
    if (!auth.currentUser) return;
    setLoadingHistory(true);
    try {
      const q = query(
        collection(db, 'disease_reports'),
        where('uid', '==', auth.currentUser.uid),
        orderBy('timestamp', 'desc'),
        limit(10)
      );
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setHistory(docs);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'disease_reports');
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (view === 'history') {
      fetchHistory();
    }
  }, [view]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDetect = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const base64 = image.split(',')[1];
      const data = await detectCropDisease(base64, language);
      setResult(data);

      // Save to Firestore
      if (auth.currentUser) {
        try {
          await addDoc(collection(db, 'disease_reports'), {
            uid: auth.currentUser.uid,
            disease: data.disease,
            confidence: data.confidence,
            symptoms: data.symptoms,
            treatment: data.treatment,
            prevention: data.prevention,
            timestamp: serverTimestamp(),
            imageUrl: image, // Saving base64 for demo purposes
          });
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, 'disease_reports');
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setImage(null);
    setResult(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold text-zinc-900 flex items-center gap-3">
            <Bug className="w-8 h-8 text-rose-500" />
            {t('common.aiDiseaseDetector')}
          </h2>
          <p className="text-zinc-500 text-sm">
            {t('common.instantDiagnosis')}
          </p>
        </div>

        <div className="flex bg-zinc-100 p-1 rounded-xl self-start">
          <button 
            onClick={() => setView('detect')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
              view === 'detect' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-900"
            )}
          >
            <Camera className="w-4 h-4" />
            {t('common.detect')}
          </button>
          <button 
            onClick={() => setView('history')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
              view === 'history' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-900"
            )}
          >
            <History className="w-4 h-4" />
            {t('common.history')}
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {view === 'detect' ? (
          <motion.div 
            key="detect"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {/* Upload Section */}
            <div className="space-y-4">
              <div 
                onClick={() => !image && fileInputRef.current?.click()}
                className={cn(
                  "relative aspect-square rounded-3xl border-2 border-dashed flex flex-col items-center justify-center transition-all overflow-hidden",
                  image ? "border-zinc-200 bg-zinc-50" : "border-zinc-300 hover:border-emerald-500 hover:bg-emerald-50/50 cursor-pointer"
                )}
              >
                {image ? (
                  <>
                    <img src={image} alt="Upload" className="w-full h-full object-cover" />
                    <button 
                      onClick={(e) => { e.stopPropagation(); reset(); }}
                      className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors"
                    >
                      <X className="w-5 h-5 text-zinc-900" />
                    </button>
                  </>
                ) : (
                  <div className="text-center space-y-4 p-8">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                      <Camera className="w-8 h-8 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-zinc-900">{t('common.clickToUpload')}</p>
                      <p className="text-xs text-zinc-500 mt-1">{t('common.pngJpgLimit')}</p>
                    </div>
                  </div>
                )}
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                accept="image/*" 
                className="hidden" 
              />
              
              <button 
                onClick={handleDetect}
                disabled={!image || loading}
                className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-zinc-900/10"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    {t('common.analyzeImage')}
                  </>
                )}
              </button>
            </div>

            {/* Results Section */}
            <div className="space-y-6">
              <AnimatePresence mode="wait">
                {!result && !loading && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full flex flex-col items-center justify-center text-center p-8 bg-zinc-50 rounded-3xl border border-zinc-100"
                  >
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                      <Info className="w-6 h-6 text-zinc-300" />
                    </div>
                    <h4 className="font-medium text-zinc-900">{t('common.analysisPending')}</h4>
                    <p className="text-xs text-zinc-500 mt-2">
                      {t('common.analysisPendingText')}
                    </p>
                  </motion.div>
                )}

                {loading && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                  >
                    <div className="h-12 bg-zinc-100 animate-pulse rounded-xl" />
                    <div className="space-y-3">
                      <div className="h-4 bg-zinc-100 animate-pulse rounded w-1/3" />
                      <div className="h-20 bg-zinc-100 animate-pulse rounded-xl" />
                    </div>
                    <div className="space-y-3">
                      <div className="h-4 bg-zinc-100 animate-pulse rounded w-1/3" />
                      <div className="h-20 bg-zinc-100 animate-pulse rounded-xl" />
                    </div>
                  </motion.div>
                )}

                {result && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <div className={cn(
                      "p-6 rounded-3xl border flex items-center justify-between",
                      result.disease === 'Healthy' ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'
                    )}>
                      <div>
                        <h4 className={cn(
                          "text-2xl font-bold",
                          result.disease === 'Healthy' ? 'text-emerald-900' : 'text-rose-900'
                        )}>
                          {result.disease === 'Healthy' ? t('common.healthy') : result.disease}
                        </h4>
                        <p className="text-sm opacity-70">{t('common.confidence')}: {(result.confidence * 100).toFixed(1)}%</p>
                      </div>
                      <div className={cn(
                        "p-3 rounded-2xl",
                        result.disease === 'Healthy' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                      )}>
                        {result.disease === 'Healthy' ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                      </div>
                    </div>

                    <ResultCard 
                      title={t('common.symptoms')} 
                      items={result.symptoms} 
                      icon={<Search className="w-4 h-4 text-zinc-400" />} 
                    />
                    <ResultCard 
                      title={t('common.treatment')} 
                      items={result.treatment} 
                      icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />} 
                    />
                    <ResultCard 
                      title={t('common.prevention')} 
                      items={result.prevention} 
                      icon={<Info className="w-4 h-4 text-blue-500" />} 
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="history"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {loadingHistory ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-24 bg-zinc-100 animate-pulse rounded-2xl" />
                ))}
              </div>
            ) : history.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {history.map((report) => (
                  <div 
                    key={report.id}
                    className="bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm flex items-center gap-4 hover:border-emerald-200 transition-all group"
                  >
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-zinc-100 shrink-0">
                      {report.imageUrl ? (
                        <img src={report.imageUrl} alt={report.disease} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Bug className="w-6 h-6 text-zinc-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-zinc-900 truncate">{report.disease}</h4>
                        <span className={cn(
                          "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
                          report.disease === 'Healthy' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        )}>
                          {(report.confidence * 100).toFixed(0)}% {t('common.match')}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-zinc-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {report.timestamp?.toDate().toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1 truncate">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          {report.treatment?.[0] || t('common.noTreatmentInfo')}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-zinc-300 group-hover:text-emerald-500 transition-colors" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-zinc-50 rounded-3xl border border-dashed border-zinc-200">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm mb-4">
                  <History className="w-8 h-8 text-zinc-200" />
                </div>
                <h4 className="text-lg font-bold text-zinc-900">{t('common.noHistory')}</h4>
                <p className="text-zinc-500 text-sm max-w-xs mx-auto mt-2">
                  {t('common.pastDetections')}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ResultCard({ title, items, icon }: any) {
  if (!Array.isArray(items)) return null;
  return (
    <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm space-y-3">
      <h5 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
        {icon}
        {title}
      </h5>
      <ul className="space-y-2">
        {items.map((item: string, i: number) => (
          <li key={i} className="text-sm text-zinc-600 flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-300 mt-1.5 shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

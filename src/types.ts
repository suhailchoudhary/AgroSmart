export interface SoilData {
  nitrogen?: number;
  phosphorus?: number;
  potassium?: number;
  ph?: number;
  temperature?: number;
  humidity?: number;
  rainfall?: number;
  moisture?: number;
  soilType?: string;
  region?: string;
  location?: {
    lat: number;
    lng: number;
  };
}

export interface RecommendationResult {
  crop: string;
  suitabilityScore: number;
  yieldPrediction: string;
  profitabilityEstimate: string;
  explanation: string;
  fertilizerAdvice: string;
}

export interface DiseaseDetectionResult {
  disease: string;
  confidence: number;
  symptoms: string[];
  treatment: string[];
  prevention: string[];
}

export interface MarketPrice {
  crop: string;
  currentPrice: number;
  predictedPrice: number;
  trend: 'up' | 'down' | 'stable';
  volume: number;
  marketShare?: number;
  historicalVolume?: number;
}

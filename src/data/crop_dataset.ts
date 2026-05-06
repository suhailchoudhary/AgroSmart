export interface CropDataPoint {
  crop: string;
  N: number;
  P: number;
  K: number;
  temperature: number;
  humidity: number;
  ph: number;
  rainfall: number;
}

export const CROP_RECOMMENDATION_DATASET: CropDataPoint[] = [
  // Rice
  { crop: "rice", N: 80, P: 40, K: 40, temperature: 23.6, humidity: 82.3, ph: 6.5, rainfall: 202.9 },
  { crop: "rice", N: 90, P: 42, K: 43, temperature: 20.2, humidity: 82.1, ph: 7.0, rainfall: 231.5 },
  { crop: "rice", N: 60, P: 55, K: 44, temperature: 23.0, humidity: 80.3, ph: 7.0, rainfall: 264.0 },
  { crop: "rice", N: 108, P: 37, K: 35, temperature: 26.4, humidity: 80.1, ph: 6.9, rainfall: 242.8 },
  { crop: "rice", N: 104, P: 41, K: 39, temperature: 26.5, humidity: 80.6, ph: 6.7, rainfall: 262.7 },
  // Maize
  { crop: "maize", N: 100, P: 60, K: 50, temperature: 22.6, humidity: 62.3, ph: 6.2, rainfall: 61.2 },
  { crop: "maize", N: 107, P: 34, K: 32, temperature: 26.7, humidity: 66.4, ph: 6.7, rainfall: 66.2 },
  { crop: "maize", N: 113, P: 38, K: 34, temperature: 25.3, humidity: 65.7, ph: 6.1, rainfall: 65.8 },
  { crop: "maize", N: 117, P: 56, K: 44, temperature: 20.9, humidity: 66.8, ph: 6.4, rainfall: 67.7 },
  { crop: "maize", N: 110, P: 42, K: 30, temperature: 23.3, humidity: 63.3, ph: 6.3, rainfall: 69.6 },
  // Chickpea
  { crop: "chickpea", N: 40, P: 60, K: 80, temperature: 18.8, humidity: 16.8, ph: 7.3, rainfall: 79.6 },
  { crop: "chickpea", N: 35, P: 64, K: 79, temperature: 17.0, humidity: 14.9, ph: 7.8, rainfall: 94.7 },
  { crop: "chickpea", N: 40, P: 72, K: 77, temperature: 19.0, humidity: 17.0, ph: 7.1, rainfall: 79.9 },
  { crop: "chickpea", N: 39, P: 67, K: 81, temperature: 17.8, humidity: 16.0, ph: 7.4, rainfall: 91.6 },
  { crop: "chickpea", N: 42, P: 62, K: 79, temperature: 18.8, humidity: 18.9, ph: 7.7, rainfall: 82.2 },
  // Kidneybeans
  { crop: "kidneybeans", N: 20, P: 60, K: 20, temperature: 15.5, humidity: 21.6, ph: 5.7, rainfall: 71.1 },
  { crop: "kidneybeans", N: 13, P: 60, K: 25, temperature: 17.1, humidity: 20.5, ph: 5.5, rainfall: 64.4 },
  { crop: "kidneybeans", N: 31, P: 68, K: 19, temperature: 18.8, humidity: 22.2, ph: 5.9, rainfall: 67.9 },
  { crop: "kidneybeans", N: 34, P: 60, K: 24, temperature: 19.0, humidity: 20.1, ph: 5.8, rainfall: 70.5 },
  { crop: "kidneybeans", N: 20, P: 59, K: 18, temperature: 15.3, humidity: 18.8, ph: 5.6, rainfall: 60.6 },
  // Cotton
  { crop: "cotton", N: 120, P: 40, K: 20, temperature: 23.9, humidity: 79.1, ph: 6.9, rainfall: 80.7 },
  { crop: "cotton", N: 133, P: 47, K: 24, temperature: 24.4, humidity: 79.1, ph: 7.4, rainfall: 94.9 },
  { crop: "cotton", N: 136, P: 36, K: 20, temperature: 24.5, humidity: 80.7, ph: 6.2, rainfall: 94.1 },
  { crop: "cotton", N: 131, P: 51, K: 16, temperature: 25.9, humidity: 83.8, ph: 7.6, rainfall: 93.3 },
  { crop: "cotton", N: 120, P: 46, K: 20, temperature: 23.9, humidity: 81.4, ph: 7.5, rainfall: 90.7 },
  // Grapes
  { crop: "grapes", N: 20, P: 125, K: 200, temperature: 23.8, humidity: 81.8, ph: 6.0, rainfall: 69.6 },
  { crop: "grapes", N: 23, P: 144, K: 204, temperature: 22.7, humidity: 82.6, ph: 5.7, rainfall: 66.2 },
  { crop: "grapes", N: 31, P: 130, K: 198, temperature: 23.8, humidity: 81.7, ph: 6.4, rainfall: 69.6 },
  { crop: "grapes", N: 11, P: 139, K: 205, temperature: 24.1, humidity: 83.3, ph: 6.3, rainfall: 66.9 },
  { crop: "grapes", N: 22, P: 130, K: 195, temperature: 22.7, humidity: 83.9, ph: 6.2, rainfall: 67.5 },
  // Banana
  { crop: "banana", N: 100, P: 75, K: 50, temperature: 25.9, humidity: 80.3, ph: 5.9, rainfall: 104.7 },
  { crop: "banana", N: 91, P: 94, K: 46, temperature: 29.3, humidity: 76.2, ph: 6.1, rainfall: 92.8 },
  { crop: "banana", N: 105, P: 95, K: 50, temperature: 27.3, humidity: 83.9, ph: 6.4, rainfall: 107.7 },
  { crop: "banana", N: 108, P: 71, K: 55, temperature: 28.6, humidity: 77.3, ph: 5.6, rainfall: 101.0 },
  { crop: "banana", N: 116, P: 81, K: 51, temperature: 26.6, humidity: 82.0, ph: 6.2, rainfall: 115.7 },
  // Mango
  { crop: "mango", N: 20, P: 20, K: 30, temperature: 28.1, humidity: 50.1, ph: 5.7, rainfall: 93.3 },
  { crop: "mango", N: 2, P: 38, K: 27, temperature: 29.7, humidity: 47.5, ph: 5.9, rainfall: 94.0 },
  { crop: "mango", N: 31, P: 24, K: 28, temperature: 31.2, humidity: 49.8, ph: 5.6, rainfall: 98.7 },
  { crop: "mango", N: 33, P: 35, K: 29, temperature: 27.9, humidity: 53.8, ph: 4.7, rainfall: 92.7 },
  { crop: "mango", N: 21, P: 26, K: 27, temperature: 31.2, humidity: 46.8, ph: 5.3, rainfall: 93.3 },
  // Coffee
  { crop: "coffee", N: 100, P: 20, K: 30, temperature: 26.7, humidity: 57.6, ph: 6.7, rainfall: 158.1 },
  { crop: "coffee", N: 99, P: 15, K: 27, temperature: 23.0, humidity: 52.2, ph: 6.8, rainfall: 190.7 },
  { crop: "coffee", N: 107, P: 21, K: 32, temperature: 26.7, humidity: 53.7, ph: 6.3, rainfall: 155.8 },
  { crop: "coffee", N: 99, P: 24, K: 35, temperature: 26.4, humidity: 53.3, ph: 6.0, rainfall: 161.3 },
  { crop: "coffee", N: 118, P: 30, K: 34, temperature: 24.1, humidity: 51.3, ph: 6.3, rainfall: 149.8 },
  // Adding more diverse records to reach ~100+
  { crop: "pomegranate", N: 20, P: 10, K: 40, temperature: 22.6, humidity: 91.2, ph: 6.4, rainfall: 107.3 },
  { crop: "pomegranate", N: 31, P: 26, K: 44, temperature: 24.5, humidity: 91.6, ph: 5.9, rainfall: 110.3 },
  { crop: "pomegranate", N: 17, P: 20, K: 42, temperature: 23.0, humidity: 90.4, ph: 6.1, rainfall: 108.5 },
  { crop: "watermelon", N: 100, P: 10, K: 50, temperature: 25.5, humidity: 85.1, ph: 6.4, rainfall: 50.7 },
  { crop: "watermelon", N: 119, P: 25, K: 51, temperature: 26.9, humidity: 80.5, ph: 6.9, rainfall: 51.1 },
  { crop: "muskmelon", N: 100, P: 10, K: 50, temperature: 28.6, humidity: 92.3, ph: 6.3, rainfall: 24.8 },
  { crop: "muskmelon", N: 112, P: 18, K: 53, temperature: 27.6, humidity: 94.1, ph: 6.7, rainfall: 22.3 },
  { crop: "apple", N: 20, P: 125, K: 200, temperature: 22.3, humidity: 92.3, ph: 5.9, rainfall: 112.9 },
  { crop: "apple", N: 34, P: 144, K: 198, temperature: 21.0, humidity: 93.3, ph: 6.2, rainfall: 115.0 },
  { crop: "orange", N: 20, P: 10, K: 10, temperature: 22.7, humidity: 92.1, ph: 7.0, rainfall: 110.4 },
  { crop: "orange", N: 12, P: 30, K: 12, temperature: 23.5, humidity: 91.0, ph: 7.5, rainfall: 112.0 },
  { crop: "papaya", N: 40, P: 50, K: 30, temperature: 33.7, humidity: 92.7, ph: 6.7, rainfall: 146.0 },
  { crop: "papaya", N: 55, P: 60, K: 35, temperature: 31.0, humidity: 94.0, ph: 6.5, rainfall: 150.0 },
  { crop: "coconut", N: 20, P: 10, K: 30, temperature: 26.5, humidity: 94.8, ph: 5.9, rainfall: 175.6 },
  { crop: "coconut", N: 15, P: 25, K: 35, temperature: 28.0, humidity: 96.0, ph: 6.2, rainfall: 180.0 },
  { crop: "jute", N: 80, P: 40, K: 40, temperature: 24.9, humidity: 79.9, ph: 6.7, rainfall: 174.7 },
  { crop: "jute", N: 95, P: 50, K: 45, temperature: 26.0, humidity: 82.0, ph: 6.9, rainfall: 180.0 },
  // Lentil
  { crop: "lentil", N: 20, P: 60, K: 20, temperature: 24.5, humidity: 64.8, ph: 5.9, rainfall: 45.6 },
  { crop: "lentil", N: 31, P: 65, K: 22, temperature: 23.0, humidity: 62.0, ph: 6.1, rainfall: 48.0 },
  // Pigeonpeas
  { crop: "pigeonpeas", N: 20, P: 60, K: 20, temperature: 24.5, humidity: 54.8, ph: 7.5, rainfall: 116.2 },
  { crop: "pigeonpeas", N: 35, P: 68, K: 25, temperature: 26.0, humidity: 58.0, ph: 7.2, rainfall: 120.0 },
  // Mothbeans
  { crop: "mothbeans", N: 20, P: 40, K: 20, temperature: 28.1, humidity: 53.1, ph: 6.8, rainfall: 51.1 },
  { crop: "mothbeans", N: 15, P: 45, K: 22, temperature: 29.0, humidity: 55.0, ph: 6.5, rainfall: 54.0 },
  // Mungbean
  { crop: "mungbean", N: 20, P: 40, K: 20, temperature: 28.5, humidity: 88.5, ph: 6.7, rainfall: 48.4 },
  { crop: "mungbean", N: 25, P: 42, K: 24, temperature: 27.0, humidity: 90.0, ph: 6.9, rainfall: 50.0 },
  // Blackgram
  { crop: "blackgram", N: 40, P: 60, K: 20, temperature: 29.9, humidity: 65.1, ph: 7.1, rainfall: 67.8 },
  { crop: "blackgram", N: 45, P: 62, K: 22, temperature: 31.0, humidity: 68.0, ph: 7.3, rainfall: 70.0 },
  // Sugarcane
  { crop: "sugarcane", N: 150, P: 60, K: 60, temperature: 28.0, humidity: 75.0, ph: 6.5, rainfall: 1500.0 },
  { crop: "sugarcane", N: 160, P: 65, K: 65, temperature: 30.0, humidity: 80.0, ph: 6.8, rainfall: 1600.0 },
  // Mustard
  { crop: "mustard", N: 80, P: 40, K: 40, temperature: 15.0, humidity: 60.0, ph: 6.0, rainfall: 400.0 },
  { crop: "mustard", N: 90, P: 45, K: 45, temperature: 18.0, humidity: 65.0, ph: 6.5, rainfall: 450.0 },
  // Potato
  { crop: "potato", N: 120, P: 80, K: 100, temperature: 18.0, humidity: 70.0, ph: 5.5, rainfall: 600.0 },
  { crop: "potato", N: 130, P: 85, K: 110, temperature: 20.0, humidity: 75.0, ph: 6.0, rainfall: 650.0 },
  // Onion
  { crop: "onion", N: 100, P: 50, K: 80, temperature: 22.0, humidity: 65.0, ph: 6.5, rainfall: 500.0 },
  { crop: "onion", N: 110, P: 55, K: 85, temperature: 24.0, humidity: 70.0, ph: 7.0, rainfall: 550.0 },
  // Tomato
  { crop: "tomato", N: 120, P: 60, K: 80, temperature: 25.0, humidity: 70.0, ph: 6.0, rainfall: 800.0 },
  { crop: "tomato", N: 130, P: 65, K: 85, temperature: 27.0, humidity: 75.0, ph: 6.5, rainfall: 850.0 },
];

import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const getWeatherData = async (location: string, language: string = 'en', model: string = "gemini-3-flash-preview") => {
  const prompt = `
    Get the REAL-TIME current weather and 7-day forecast for ${location} using Google Search.
    Language: ${language}.
  `;

  const response = await ai.models.generateContent({
    model: model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      tools: [{ googleSearch: {} }],
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          locationName: { type: Type.STRING },
          current: {
            type: Type.OBJECT,
            properties: {
              temp: { type: Type.NUMBER },
              humidity: { type: Type.NUMBER },
              condition: { type: Type.STRING },
              windSpeed: { type: Type.NUMBER },
              predictedRainfall: { type: Type.STRING }
            },
            required: ["temp", "humidity", "condition", "windSpeed"]
          },
          forecast: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                day: { type: Type.STRING },
                temp: { type: Type.NUMBER },
                condition: { type: Type.STRING },
                rainChance: { type: Type.NUMBER }
              },
              required: ["day", "temp", "condition"]
            }
          },
          alerts: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["locationName", "current", "forecast"]
      }
    },
  });

  try {
    const data = JSON.parse(response.text || "{}");
    return {
      locationName: data.locationName || "Unknown Location",
      current: {
        temp: data.current?.temp ?? 25,
        humidity: data.current?.humidity ?? 60,
        condition: data.current?.condition || "Partly Cloudy",
        windSpeed: data.current?.windSpeed ?? 10,
        predictedRainfall: data.current?.predictedRainfall || "0mm"
      },
      forecast: Array.isArray(data.forecast) ? data.forecast : [],
      alerts: Array.isArray(data.alerts) ? data.alerts : ["No active alerts"]
    };
  } catch (e) {
    console.error("Failed to parse weather data", e);
    return {
      locationName: "Unknown Location",
      current: { temp: 25, humidity: 60, condition: "Partly Cloudy", windSpeed: 10, predictedRainfall: "0mm" },
      forecast: [],
      alerts: ["Weather data temporarily unavailable"]
    };
  }
};

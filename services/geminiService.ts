import { GoogleGenAI, Modality } from "@google/genai";
import { SensorData, Language, AiAnalysisResult, FarmProfile } from '../types';
import { strings } from '../i18n/strings';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const getSoilHealth = (ph: number, moisture: number, temp: number): AiAnalysisResult['soilHealth'] => {
    const isPhGood = ph >= 5.8 && ph <= 7.2;
    const isMoistureGood = moisture >= 30 && moisture <= 60;
    const isTempGood = temp >= 15 && temp <= 32;

    if (isPhGood && isMoistureGood && isTempGood) return 'Healthy';

    const goodMetricsCount = [isPhGood, isMoistureGood, isTempGood].filter(Boolean).length;
    if (goodMetricsCount >= 2) return 'Needs Improvement';
    
    return 'Poor';
};

export const getAiAnalysis = async (
  sensorData: SensorData,
  language: Language,
  farmProfile?: FarmProfile | null
): Promise<AiAnalysisResult> => {
    const soilHealth = getSoilHealth(sensorData.ph, sensorData.moisture, sensorData.temperature);
    const targetLanguage = language === 'te' ? 'Telugu' : 'English';

    let farmContext = '';
    if (farmProfile) {
        farmContext = `
        Farm Context:
        - Soil Type: ${farmProfile.soilType || 'Not specified'}
        - Currently Grown Crop: ${farmProfile.currentCrop || 'Not specified'}
        `;
    }

    const prompt = `
        You are an expert agricultural assistant for farmers.
        Analyze the following soil data and provide a concise, actionable report in ${targetLanguage}.
        The report must be easy for a farmer to understand.

        Soil Data:
        - pH Level: ${sensorData.ph.toFixed(1)}
        - Moisture: ${sensorData.moisture.toFixed(1)}%
        - Temperature: ${sensorData.temperature.toFixed(1)}°C
        - Current Soil Health Category: ${soilHealth}
        ${farmContext}

        Generate a report with four distinct sections. Use the following exact headings in your response, translated to ${targetLanguage}:
        1.  **${strings[language].analysis_crop_suggestions}**: Suggest 3-4 crops suitable for these specific conditions. Consider the farm context if provided. If the soil is 'Poor' or 'Needs Improvement', recommend resilient crops.
        2.  **${strings[language].analysis_fertilizer_advice}**: Provide simple advice on fertilizers. Mention balanced NPK, compost, or specific amendments based on pH and soil type.
        3.  **${strings[language].analysis_irrigation_suggestion}**: Give clear advice on when and how much to water based on the moisture, temperature, and current crop.
        
        Keep the language simple and direct. Do not add any introductory or concluding remarks outside of these sections.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const text = response.text;
        
        // Split the response text into sections based on the headings.
        const cropSuggestions = text.split(strings[language].analysis_crop_suggestions)[1]?.split(strings[language].analysis_fertilizer_advice)[0]?.trim() || "Could not determine.";
        const fertilizerAdvice = text.split(strings[language].analysis_fertilizer_advice)[1]?.split(strings[language].analysis_irrigation_suggestion)[0]?.trim() || "Could not determine.";
        const irrigationSuggestion = text.split(strings[language].analysis_irrigation_suggestion)[1]?.trim() || "Could not determine.";

        return {
            soilHealth,
            cropSuggestions,
            fertilizerAdvice,
            irrigationSuggestion
        };
    } catch (error) {
        console.error("Error getting AI analysis:", error);
        throw new Error("Failed to get AI analysis.");
    }
};

export const generateSpeech = async (text: string, language: Language): Promise<string | null> => {
    const voiceName = language === 'en' ? 'Kore' : 'Puck'; // Puck has a voice that can be suitable for Telugu

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: voiceName },
                    },
                },
            },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        return base64Audio || null;
    } catch (error) {
        console.error("Error generating speech:", error);
        return null;
    }
};

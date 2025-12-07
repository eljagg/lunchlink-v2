
import { GoogleGenAI, Type } from "@google/genai";
import { MenuItem } from '../types';

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY not set for Gemini Service");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateMenuIdeas = async (cuisine: string, count: number): Promise<MenuItem[]> => {
  const ai = getAiClient();
  if (!ai) return [];

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate ${count} lunch menu items for a corporate cafeteria. Theme/Cuisine: ${cuisine}. 
      Use the following categories: Protein, Carbohydrate, Sides, Fibre, Soup, Vegetarian, DoneToOrder, Sandwiches, Condiments.
      Example items: Jerk Chicken (Protein), Rice and Peas (Carbohydrate), Steamed Veg (Fibre).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              category: { 
                type: Type.STRING, 
                enum: ['Protein', 'Carbohydrate', 'Sides', 'Fibre', 'Soup', 'Vegetarian', 'DoneToOrder', 'Special', 'Drink', 'Dessert', 'Sandwiches', 'Condiments'] 
              },
              calories: { type: Type.NUMBER },
              dietaryInfo: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ['name', 'description', 'category']
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    
    const items = JSON.parse(text);
    // Add IDs
    return items.map((item: any) => ({
      ...item,
      id: Math.random().toString(36).substr(2, 9)
    }));
  } catch (error) {
    console.error("Failed to generate menu:", error);
    return [];
  }
};

export const summarizeComments = async (comments: string[]): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "AI Service Unavailable";

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Here are employee comments about the lunch service:\n\n${comments.join('\n')}\n\nProvide a concise executive summary of the feedback, highlighting key themes and sentiment.`,
    });
    return response.text || "No summary available.";
  } catch (error) {
    console.error("Failed to summarize:", error);
    return "Error generating summary.";
  }
};

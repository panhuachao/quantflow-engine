import { GoogleGenAI } from "@google/genai";

// Initialize the Gemini API client
// Ensure process.env.API_KEY is set in your environment
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateStrategyCode = async (description: string): Promise<string> => {
  if (!apiKey) {
    console.warn("Gemini API Key is missing.");
    return "# Error: No API Key configured in environment.";
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
        You are an expert quantitative trading engineer. 
        Write a Python code snippet using the Backtrader syntax for the following strategy description. 
        Only provide the 'next' method logic and the '__init__' method if necessary.
        Keep it concise and ready to plug into a strategy class.
        
        Strategy Description: ${description}
        
        Output strict Python code only. No markdown formatting like \`\`\`python.
      `,
    });

    return response.text || "# No code generated.";
  } catch (error) {
    console.error("Error generating strategy:", error);
    return "# Error generating strategy code. Please try again.";
  }
};

export const analyzeMarketData = async (dataSummary: string): Promise<string> => {
   if (!apiKey) return "API Key missing.";

   try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
        Analyze the following market data summary and provide a short, 2-sentence sentiment analysis for a trader.
        Data: ${dataSummary}
      `
    });
    return response.text || "Analysis unavailable.";
   } catch (error) {
     return "Error analyzing data.";
   }
}

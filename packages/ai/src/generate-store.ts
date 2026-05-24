import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';

// Initialize clients
const anthropicClient = new Anthropic();
const geminiApiKey = process.env.GOOGLE_API_KEY;
const geminiClient = geminiApiKey ? new GoogleGenerativeAI(geminiApiKey) : null;

export interface GeneratedStore {
  name:        string
  tagline:     string
  description: string
  colors:      { primary: string; background: string; text: string }
  products:    { name: string; description: string; suggestedPrice: number }[]
  heroHeadline: string
  heroCta:     string
}

export async function generateStoreFromDescription(
  userDescription: string
): Promise<GeneratedStore> {
  // Try Gemini first if available (free tier)
  let geminiError: Error | null = null;
  
  if (geminiClient) {
    try {
      // Using gemini-1.5-flash which is widely available
      const model = geminiClient.getGenerativeModel({ model: "gemini-2.0-flash" });
      
      const prompt = `
You are Pailo's store generator. The user describes their business in plain language. Return ONLY valid JSON matching this TypeScript interface:
{
  name: string,           // short business name
  tagline: string,        // one punchy line under 10 words
  description: string,    // 2-sentence about page copy
  colors: { primary: string, background: string, text: string }, // hex codes
  products: [{ name, description, suggestedPrice }],  // 3 products max
  heroHeadline: string,   // big headline for the homepage
  heroCta: string         // call-to-action button text
}
No markdown, no explanation, no backticks. Only the raw JSON object.

User description: ${userDescription}
`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      
      // Extract JSON from response (handle potential markdown formatting)
      let jsonText = text.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.slice(7);
      }
      if (jsonText.endsWith('```')) {
        jsonText = jsonText.slice(0, -3);
      }
      jsonText = jsonText.trim();
      
      return JSON.parse(jsonText) as GeneratedStore;
    } catch (err) {
      geminiError = err instanceof Error ? err : new Error(String(err));
      console.warn('Gemini API failed, falling back to Anthropic:', geminiError);
      // Fall through to Anthropic
    }
  }

  // Fallback to Anthropic
  try {
    const response = await anthropicClient.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: `You are Pailo's store generator. The user describes their business
in plain language. Return ONLY valid JSON matching this TypeScript interface:
{
  name: string,           // short business name
  tagline: string,        // one punchy line under 10 words
  description: string,    // 2-sentence about page copy
  colors: { primary: string, background: string, text: string }, // hex codes
  products: [{ name, description, suggestedPrice }],  // 3 products max
  heroHeadline: string,   // big headline for the homepage
  heroCta: string         // call-to-action button text
}
No markdown, no explanation, no backticks. Only the raw JSON object.`,
      messages: [{
        role: 'user',
        content: userDescription
      }]
    });

    const text = response.content[0].type === 'text'
      ? response.content[0].text : '';

    return JSON.parse(text) as GeneratedStore;
  } catch (anthropicError) {
    // If both fail, throw a meaningful error
    const geminiErrorMessage = geminiError ? geminiError.message : 'Not configured';
    const anthropicErrorMessage = anthropicError instanceof Error ? anthropicError.message : String(anthropicError);
    throw new Error(`AI service unavailable. Gemini error: ${geminiErrorMessage}. Anthropic error: ${anthropicErrorMessage}`);
  }
}
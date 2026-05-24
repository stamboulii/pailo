# @pailo/ai

AI service for generating store descriptions and content.

## Configuration

This service supports multiple AI providers:

### Primary: Google Gemini (Free tier available)
1. Get a free API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add it to your `.env.local` file:
   ```
   GOOGLE_API_KEY=your_gemini_api_key_here
   ```

### Fallback: Anthropic Claude
1. Get an API key from [Anthropic Console](https://console.anthropic.com/)
2. Add it to your `.env.local` file:
   ```
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   ```

## Free Tier Information

**Google Gemini** offers a generous free tier:
- Gemini 2.0 Flash: 15 requests per minute
- Suitable for most store generation use cases
- No credit card required to start

**Anthropic Claude** requires credits:
- Free trial credits available upon signup
- Requires adding billing information for continued use
- The error you encountered indicates insufficient credits

## Recommendation

For a completely free solution, use Google Gemini:
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Get API key" and create a new key
3. Add the key to your `.env.local` as `GOOGLE_API_KEY`
4. Restart your development server

The service will automatically use Gemini when available and fall back to Anthropic if Gemini fails or is not configured.
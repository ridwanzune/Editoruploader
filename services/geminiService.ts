import { GoogleGenAI, Type } from "@google/genai";
import type { FoundArticle, ProcessedArticle, GroundingChunk } from '../types';
import { DEFAULT_GEMINI_API_KEY } from '../constants';

/**
 * Creates a GoogleGenAI client instance using the API key from local storage
 * or a default key. This allows the API key to be changed dynamically by the user.
 * @returns An initialized GoogleGenAI client.
 */
const getAiClient = (): GoogleGenAI => {
    const apiKey = localStorage.getItem('geminiApiKey') || DEFAULT_GEMINI_API_KEY;
    if (!apiKey) {
        // This is a fallback and should not typically be hit if default is configured.
        throw new Error("Gemini API Key is not configured. Please set it in the settings panel.");
    }
    return new GoogleGenAI({ apiKey });
};


/**
 * Extracts a JSON string from text that might contain markdown or conversational filler.
 * @param text The raw text from the AI response.
 * @returns A string that is likely a JSON object.
 */
const extractJsonString = (text: string): string => {
    const trimmedText = text.trim();

    // Prioritize finding a JSON block within markdown ```json ... ```
    const jsonBlockMatch = trimmedText.match(/```json\s*([\s\S]+?)\s*```/);
    if (jsonBlockMatch && jsonBlockMatch[1]) {
        return jsonBlockMatch[1];
    }
    
    // Fallback to a general markdown block ``` ... ```
    const markdownBlockMatch = trimmedText.match(/```\s*([\s\S]+?)\s*```/);
    if (markdownBlockMatch && markdownBlockMatch[1]) {
        return markdownBlockMatch[1];
    }

    // Fallback for cases where JSON is just embedded in text without markdown
    const firstBrace = trimmedText.indexOf('{');
    const lastBrace = trimmedText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
        return trimmedText.substring(firstBrace, lastBrace + 1);
    }
    
    // If no wrappers are found, assume the whole text is the JSON payload
    return trimmedText;
};


/**
 * Generates a summary for a given news URL. Used for the manual workflow.
 */
export const generateSummary = async (newsUrl: string, headline: string): Promise<string> => {
    const ai = getAiClient();
    try {
        const prompt = `Act as a world-class digital news editor with a strong talent for viral social media engagement.
Based on the article at ${newsUrl} and the headline "${headline}", create a compelling summary for a social media post.

Follow these rules for the summary:
1.  **Format**: The summary must be well-structured. Start with a strong opening sentence that grabs attention. Follow with 2-3 short, clear sentences that explain the core of the news.
2.  **Length**: The summary body should be concise, around 50-70 words.
3.  **Conclusion**: After the summary, add a line break. Then, provide 3-5 relevant, trending hashtags. Finally, on a new line, add the source name (e.g., "Source: Prothom Alo").
4.  **Tone**: Professional, engaging, and authoritative.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: 0.7,
                topP: 1,
                topK: 32,
            }
        });
        
        const summary = response.text;
        
        if (!summary) {
            throw new Error("The API returned an empty summary.");
        }

        return summary.trim();

    } catch (error) {
        console.error("Error generating summary from Gemini:", error);
        if (error instanceof Error) {
            throw new Error(`Gemini API Error: ${error.message}`);
        }
        throw new Error("An unexpected error occurred while communicating with the Gemini API.");
    }
};

/**
 * Finds recent, exciting news articles using Google Search grounding.
 * Implements a fallback mechanism: first searches specific sources, then broader sources if no results.
 */
export const findHotNews = async (
    params: { 
        query?: string; 
        region?: 'Bangladesh' | 'International'; 
        existingTitles?: string[];
        timeFilter?: string; // e.g., '1d', '7d', '10d'
    }
): Promise<{ articles: FoundArticle[]; groundingMetadata: GroundingChunk[] }> => {
    const ai = getAiClient();

    const bangladeshiEnglishSources = [
        "www.thedailystar.net", "www.dhakatribune.com", "www.theindependentbd.com",
        "www.tbsnews.net", "www.newagebd.net", "www.thefinancialexpress.com.bd", "www.daily-sun.com"
    ];

    const createPrompt = (useSpecificSources: boolean): string => {
        let prompt = `You are a news discovery agent. Your task is to find up to 5 recent and relevant news topics using Google Search. For each topic, you must generate a compelling headline, a brief summary, and a concise image search query.`;

        const days = params.timeFilter ? params.timeFilter.replace('d', '') : '10';
        prompt += ` Find topics from news published within the last ${days} day(s).`;

        if (params.region === 'Bangladesh') {
            if (useSpecificSources) {
                const sitesQuery = bangladeshiEnglishSources.map(s => `site:${s}`).join(' OR ');
                prompt += `
Search for recent, top English-language news topics from Bangladesh.
**CRITICAL REQUIREMENT:** Your search MUST be restricted to the following trusted news sites. To achieve this, formulate your internal Google Search queries to include this condition: \`(${sitesQuery})\`.
Do not return results from any other websites.
`;
            } else {
                 prompt += `
Search for English-language news topics from reputable news sources in Bangladesh. Your search should be broader than just a few specific sites.
`;
            }
        } else { // 'International'
            prompt += ` Focus on major international news topics from reputable English-language sources.`;
        }

        if (params.query) {
            prompt += ` The topics should be related to: "${params.query}".`;
        }

        if (params.existingTitles && params.existingTitles.length > 0) {
            prompt += `\nExclude any topics with titles similar to these: ${params.existingTitles.join(', ')}.`;
        }
        
        prompt += `
**RESPONSE FORMATTING:**
1.  You MUST return a valid JSON object and nothing else.
2.  The JSON must be an object with a single key "articles". The value must be an array of objects.
3.  Each object in the array must have "title" (string, 5-10 words), "summary" (string, 50-70 words), and "imageQuery" (string, 2-4 keywords for an image search) keys.
4.  Do NOT invent or include any URLs.
5.  **On Failure:** If you find no topics matching the criteria, you MUST return \`{"articles": []}\`. Do not return an error message or any other text.

Example:
{
  "articles": [
    {
      "title": "Massive Fire Engulfs Dhaka Market Causing Millions in Damage",
      "summary": "A devastating fire broke out at a popular market in Dhaka, destroying hundreds of shops. Firefighters are battling the blaze, and the cause is under investigation. No casualties have been reported yet, but the financial losses are immense.",
      "imageQuery": "Dhaka market fire"
    }
  ]
}`;
        return prompt;
    };
    
    const executeSearch = async (prompt: string): Promise<{ articles: FoundArticle[]; groundingMetadata: GroundingChunk[] }> => {
         const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{googleSearch: {}}],
            }
        });
        
        const groundingMetadata = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];

        const jsonString = extractJsonString(response.text);
        const jsonResponse = JSON.parse(jsonString);
        
        if (!jsonResponse.articles || !Array.isArray(jsonResponse.articles)) {
             throw new Error("AI did not return articles in the expected format. The response might be empty or malformed.");
        }
        return { articles: jsonResponse.articles, groundingMetadata: groundingMetadata as GroundingChunk[] };
    }

    try {
        // Step 1: Primary search with specific sources
        const primaryPrompt = createPrompt(true);
        let result = await executeSearch(primaryPrompt);

        // Step 2: Fallback to broader search if the primary one returns nothing and region is Bangladesh
        if (result.articles.length === 0 && params.region === 'Bangladesh') {
            console.warn("Primary search with specific sources returned no results. Trying fallback search.");
            const fallbackPrompt = createPrompt(false);
            result = await executeSearch(fallbackPrompt);
        }
        
        return result;

    } catch (error) {
        console.error("Error finding hot news from Gemini:", error);
        if (error instanceof SyntaxError) {
             throw new Error(`The AI returned an invalid response that could not be parsed as JSON. Please try again.`);
        }
        if (error instanceof Error) {
            throw new Error(`Gemini API Error: ${error.message}`);
        }
        throw new Error("An unexpected error occurred while finding news.");
    }
};


/**
 * Processes a single news URL to extract a headline, multiple image options, and a summary.
 */
export const processNewsUrl = async (newsUrl: string): Promise<ProcessedArticle> => {
    const ai = getAiClient();
    try {
        const prompt = `
You are a specialized news processing agent. Your mission is to analyze the content of the provided news article URL and extract specific information in a strict JSON format.

**CRITICAL INSTRUCTIONS:**
1.  **URL Focus:** Your entire analysis MUST be based ONLY on the content found at this specific URL: ${newsUrl}
2.  **Tool Usage:** Use Google Search to access the content of the URL. Do not use any other sources or prior knowledge.
3.  **JSON Output ONLY:** You MUST return your findings as a single, valid JSON object. Do not include any text, notes, or markdown formatting like \`\`\`json before or after the JSON object.

**SUCCESS JSON STRUCTURE:**
If successful, you must return a JSON object with the following structure:
{
  "headline": "string",
  "imageUrls": ["string", "string", "string"],
  "summary": "string"
}

**FIELD-SPECIFIC INSTRUCTIONS:**
1.  "headline": Create a powerful, emotionally resonant headline for social media, directly based on the article's main point. It MUST be between 5 and 10 words.
2.  "imageUrls": Find 2-3 different, high-quality, relevant image URLs from the article.
    - They MUST be direct links to image files (e.g., .jpg, .png, .webp).
    - They MUST NOT be generic logos, banners, placeholders, or advertisements.
    - Prioritize the 'og:image' as the first option if it is a relevant, high-quality story image. Then, find other distinct "hero" images in the article body.
    - All image URLs must be valid and publicly accessible. If you can only find one, return it in the array. If no suitable images are found, you MUST return an array with a single valid URL for a generic news placeholder image (e.g., from unsplash.com).
3.  "summary": Write a professional, well-formatted summary of 50-70 words. Start with a strong opening sentence. Follow with 2-3 short, clear sentences explaining the core of the news. After the summary, add a single line break, then 3-5 relevant hashtags on a new line, and finally the source publication name on a new line (e.g., "Source: The Daily Star").

**ERROR HANDLING JSON STRUCTURE:**
- If you absolutely cannot access the URL or extract the required content for any reason, you MUST still return a valid JSON object with an "error" key.
- Example error response: { "error": "Failed to access or process the content from the provided URL." }
`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }], // Use Google Search to access the URL
            }
        });

        const jsonString = extractJsonString(response.text);
        const jsonResponse = JSON.parse(jsonString);

        if (jsonResponse.error) {
            throw new Error(`AI reported an error: ${jsonResponse.error}`);
        }

        if (!jsonResponse.headline || !jsonResponse.imageUrls || !Array.isArray(jsonResponse.imageUrls) || jsonResponse.imageUrls.length === 0 || !jsonResponse.summary) {
            throw new Error("AI failed to return all required fields (headline, imageUrls, summary) or imageUrls is empty.");
        }
        return jsonResponse;

    } catch (error) {
        console.error("Error processing news URL with Gemini:", error);
        if (error instanceof SyntaxError) {
            throw new Error(`Gemini API Error: The AI returned an invalid response that was not valid JSON. Please try again.`);
        }
        if (error instanceof Error) {
            // This will catch the structured AI error thrown above, or other general errors.
            throw new Error(`Gemini API Error: ${error.message}`);
        }
        throw new Error("An unexpected error occurred while processing the news URL.");
    }
};

/**
 * Searches for images based on a text query.
 */
export const searchForImagesByQuery = async (query: string): Promise<{ imageUrls: string[], groundingMetadata: GroundingChunk[] }> => {
    const ai = getAiClient();
    try {
        const prompt = `You are an expert image curator using Google Search. Your task is to find up to 9 high-quality, photorealistic images that are directly relevant to the search query: "${query}".
        
        **CRITICAL INSTRUCTIONS:**
        - You MUST use Google Search to find images.
        - Prioritize dynamic, interesting, and clear photos over generic ones.
        - The URLs must be direct links to JPG, PNG, or WEBP image files. Do NOT return links to web pages or data URIs.
        - All URLs must be valid, publicly accessible, and working. You must internally verify this.
        
        **RESPONSE FORMATTING:**
        - You MUST return a valid JSON object and NOTHING ELSE. No extra text, no apologies, no explanations.
        - The JSON object must have a single key "imageUrls", which is an array of strings.
        - If you cannot find any suitable images, you MUST return a JSON object with an empty array: \`{"imageUrls": []}\`.

        Example success response:
        {
          "imageUrls": [
            "https://example.com/image1.jpg",
            "https://example.com/image2.png"
          ]
        }`;
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            }
        });
        
        const groundingMetadata = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
        const jsonString = extractJsonString(response.text);
        const jsonResponse = JSON.parse(jsonString);

        if (!jsonResponse.imageUrls || !Array.isArray(jsonResponse.imageUrls)) {
            throw new Error("AI did not return image URLs in the expected format.");
        }
        
        return { 
            imageUrls: jsonResponse.imageUrls, 
            groundingMetadata: groundingMetadata as GroundingChunk[] 
        };

    } catch (error) {
        console.error("Error searching for images with Gemini:", error);
        if (error instanceof SyntaxError) {
             throw new Error(`The AI returned an invalid response that was not valid JSON. Please try again.`);
        }
        if (error instanceof Error) {
            throw new Error(`Gemini API Error: ${error.message}`);
        }
        throw new Error("An unexpected error occurred while searching for images.");
    }
};

/**
 * Generates an image using Imagen from a text prompt.
 */
export const generateAIImage = async (prompt: string): Promise<string> => {
    const ai = getAiClient();
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-3.0-generate-002',
            // Simplified and more direct prompt wrapper to reduce chances of safety filtering
            prompt: `Photorealistic, news-style photograph. High resolution. Subject: ${prompt}. No text, no logos, no watermarks.`,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/png',
              aspectRatio: '16:9', // Generate landscape image
            },
        });

        // The API can return an array of images, even if we only request one.
        const firstImage = response.generatedImages?.[0];

        if (!firstImage?.image?.imageBytes) {
            // Log the full response for better debugging if something goes wrong.
            console.error("Imagen API Response:", JSON.stringify(response, null, 2));
            
            let reason = "The API did not return any generated images. This could be due to a safety policy violation or a temporary API issue.";
            
            // The `finishReason` property may exist at runtime even if not in the current type definitions.
            // We cast to `any` to bypass the TypeScript error and check for it.
            const unsafeFirstImage = firstImage as any;
            if (unsafeFirstImage?.finishReason && unsafeFirstImage.finishReason !== 'FINISH_REASON_UNSPECIFIED' && unsafeFirstImage.finishReason !== 'OK') {
                reason = `Image generation failed. Reason: ${unsafeFirstImage.finishReason}. This is often due to a safety policy violation. Please adjust your prompt.`;
            }
            
            throw new Error(reason);
        }

        const base64ImageBytes: string = firstImage.image.imageBytes;
        return `data:image/png;base64,${base64ImageBytes}`;

    } catch (error) {
        console.error("Error generating image with Imagen:", error);
        if (error instanceof Error) {
            // Pass the specific error message along.
            throw new Error(`Imagen API Error: ${error.message}`);
        }
        throw new Error("An unexpected error occurred during AI image generation.");
    }
};
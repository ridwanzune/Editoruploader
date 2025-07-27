export interface NewsData {
  headline: string;
  imageUrl: string;
  newsUrl:string;
}

// This payload is structured to match the user's Google Sheet columns.
export interface WebhookPayload {
  headline: string;
  summary: string;
  imageUrl: string;
  newsLink: string;
  status: 'Post' | 'Queue';
}

// Article found by the AI content finder
export interface FoundArticle {
  title: string;
  summary: string;
  imageQuery: string;
  publicationDate?: string; // e.g., "2024-08-15"
}

// Data from Google Search grounding
export interface GroundingChunk {
  web: {
    uri: string;
    title: string;
  };
}

// Article data processed by the AI from a URL
export interface ProcessedArticle {
  headline: string;
  imageUrls: string[]; // Changed from imageUrl to handle multiple options
  summary: string;
}

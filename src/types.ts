export interface Artist {
  id: string;
  name: string;
}

export interface Recommendation {
  name: string;
  genre: string;
  description: string;
  whyYouWillLikeIt: string;
  obscurityLevel: number;
  spotifyUrl?: string | null;
  image?: string | null;
}

export interface RecommendationResponse {
  recommendations: Recommendation[];
  obscurityScore: number;
  obscurityLabel: string;
}

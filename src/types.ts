export interface SavedSearch {
  id: string;
  date: string;
  artists: Artist[];
  recommendations: Recommendation[];
  obscurityScore: number;
  obscurityLabel: string;
}

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
  country?: string;
  decade?: string;
  spotifyUrl?: string | null;
  image?: string | null;
}

export interface RecommendationResponse {
  recommendations: Recommendation[];
  obscurityScore: number;
  obscurityLabel: string;
}

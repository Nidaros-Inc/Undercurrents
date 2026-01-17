
export interface Artist {
  id: string;
  name: string;
}

export interface Recommendation {
  name: string;
  genre: string;
  description: string;
  whyYouWillLikeIt: string;
  obscurityLevel: number; // 1-10, where 10 is very obscure
}

export interface RecommendationResponse {
  recommendations: Recommendation[];
}

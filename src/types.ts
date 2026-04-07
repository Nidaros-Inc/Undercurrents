export interface Track {
  name: string;
  spotifyUrl: string;
  albumArt: string | null;
  albumName: string;
  previewUrl: string | null;
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
  spotifyId?: string | null;
  image?: string | null;
  tracks?: Track[];
}

export interface RecommendationResponse {
  recommendations: Recommendation[];
  obscurityScore: number;
  obscurityLabel: string;
}

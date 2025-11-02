
// === NEWS ===

export interface NewsDataResponse {
  status: string; // "success"
  totalResults: number;
  results: NewsDataArticle[];
  nextPage?: string;
}

export interface NewsDataArticle {
  article_id: string;
  title: string;
  link: string;
  keywords?: string[];
  creator?: string[];
  description?: string;
  content?: string;
  pubDate: string;
  pubDateTZ?: string;
  image_url?: string;
  video_url?: string | null;
  source_id: string;
  source_name?: string;
  source_priority?: number;
  source_url?: string;
  source_icon?: string;
  language?: string;
  country?: string[];
  category?: string[];
  sentiment?: 'positive' | 'neutral' | 'negative';
  sentiment_stats?: {
    positive: number;
    neutral: number;
    negative: number;
  };
  ai_tag?: string[];
  ai_region?: string[];
  ai_org?: string[] | null;
  ai_summary?: string;
  ai_content?: string;
  duplicate?: boolean;
}



// == USER ===

export interface UserData {
  model: string; // e.g., "User"
  documents: UserDocument[];
}

export interface UserDocument {
  gender: 'male' | 'female';
  sent_friend_request?: boolean,
  friends?: boolean,
  name: {
    title: string;
    first: string;
    last: string;
  };
  location: {
    street: string;
    city: string;
    state: string;
    zip: number;
  };
  email: string;
  username: string;
  password: string;
  salt: string;
  md5: string;
  sha1: string;
  sha256: string;
  registered: number; // Unix timestamp
  dob: number; // Unix timestamp
  phone: string;
  cell: string;
  PPS: string;
  picture: {
    large: string;
    medium: string;
    thumbnail: string;
  };
}
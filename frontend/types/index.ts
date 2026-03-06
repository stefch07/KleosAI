export interface User {
  id: string;
  email: string;
  name: string;
  restaurantName?: string;
  restaurantAddress?: string;
  googlePlaceId?: string;
  createdAt?: string;
}

export interface Review {
  id: string;
  userId: string;
  googleReviewId?: string;
  authorName: string;
  authorPhotoUrl?: string;
  rating: number;
  text: string;
  publishedAt: string;
  isRead: boolean;
  sentiment?: 'positive' | 'neutral' | 'negative';
  aiResponse?: string;
  responseStatus: 'pending' | 'generated' | 'published';
  createdAt: string;
  updatedAt: string;
}

export interface Alert {
  id: string;
  userId: string;
  reviewId: string;
  review: Review;
  isRead: boolean;
  createdAt: string;
}

export interface ReviewStats {
  total: number;
  positive: number;
  neutral: number;
  negative: number;
  unread: number;
  averageRating: number;
  recentReviews: Review[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

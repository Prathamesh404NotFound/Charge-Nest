import { 
  User, 
  ChargingSpot, 
  ChargingRequest, 
  Review, 
  Favorite, 
  Notification,
  LeaderboardEntry,
  Referral,
  ContactForm,
  NewsletterSignup,
  SpotSearchParams,
  SpotSearchResults,
  CreateSpotData,
  UpdateSpotData,
  CreateRequestData,
  ApiResponse,
  PaginatedResponse
} from '@/types';

// Mock API service layer - structured to easily replace with real Firebase/backend
class ApiService {
  private baseUrl = '/api'; // Change to your API endpoint

  // Helper methods
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  private post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  private put<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  private delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Authentication
  async getCurrentUser(): Promise<ApiResponse<User>> {
    // Mock implementation - replace with Firebase auth
    return this.get<User>('/auth/me');
  }

  async updateUserProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    return this.put<User>('/auth/profile', data);
  }

  // Charging Spots
  async searchSpots(params: SpotSearchParams): Promise<ApiResponse<SpotSearchResults>> {
    const queryParams = new URLSearchParams();
    
    if (params.query) queryParams.append('query', params.query);
    if (params.location) {
      queryParams.append('lat', params.location.lat.toString());
      queryParams.append('lng', params.location.lng.toString());
      if (params.location.radius) queryParams.append('radius', params.location.radius.toString());
    }
    if (params.categories?.length) queryParams.append('categories', params.categories.join(','));
    if (params.outletTypes?.length) queryParams.append('outletTypes', params.outletTypes.join(','));
    if (params.chargingSpeeds?.length) queryParams.append('chargingSpeeds', params.chargingSpeeds.join(','));
    if (params.priceRange) {
      queryParams.append('minPrice', params.priceRange.min.toString());
      queryParams.append('maxPrice', params.priceRange.max.toString());
    }
    if (params.rating) queryParams.append('rating', params.rating.toString());
    if (params.amenities?.length) queryParams.append('amenities', params.amenities.join(','));
    if (params.availableNow !== undefined) queryParams.append('availableNow', params.availableNow.toString());
    if (params.verified !== undefined) queryParams.append('verified', params.verified.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    return this.get<SpotSearchResults>(`/spots/search?${queryParams}`);
  }

  async getSpotById(id: string): Promise<ApiResponse<ChargingSpot>> {
    return this.get<ChargingSpot>(`/spots/${id}`);
  }

  async createSpot(data: CreateSpotData): Promise<ApiResponse<ChargingSpot>> {
    return this.post<ChargingSpot>('/spots', data);
  }

  async updateSpot(data: UpdateSpotData): Promise<ApiResponse<ChargingSpot>> {
    return this.put<ChargingSpot>(`/spots/${data.id}`, data);
  }

  async deleteSpot(id: string): Promise<ApiResponse<void>> {
    return this.delete<void>(`/spots/${id}`);
  }

  async getMySpots(): Promise<ApiResponse<ChargingSpot[]>> {
    return this.get<ChargingSpot[]>('/spots/my');
  }

  // Charging Requests
  async createRequest(data: CreateRequestData): Promise<ApiResponse<ChargingRequest>> {
    return this.post<ChargingRequest>('/requests', data);
  }

  async getMyRequests(): Promise<ApiResponse<ChargingRequest[]>> {
    return this.get<ChargingRequest[]>('/requests/my');
  }

  async getRequestsForSpot(spotId: string): Promise<ApiResponse<ChargingRequest[]>> {
    return this.get<ChargingRequest[]>(`/spots/${spotId}/requests`);
  }

  async updateRequestStatus(id: string, status: ChargingRequest['status'], message?: string): Promise<ApiResponse<ChargingRequest>> {
    return this.put<ChargingRequest>(`/requests/${id}`, { status, message });
  }

  async completeRequest(id: string, feedback: { rating: number; comment: string }): Promise<ApiResponse<ChargingRequest>> {
    return this.put<ChargingRequest>(`/requests/${id}/complete`, feedback);
  }

  // Reviews
  async createReview(spotId: string, data: { rating: number; comment: string; photos?: string[] }): Promise<ApiResponse<Review>> {
    return this.post<Review>(`/spots/${spotId}/reviews`, data);
  }

  async getSpotReviews(spotId: string, page = 1, limit = 10): Promise<ApiResponse<PaginatedResponse<Review>>> {
    return this.get<PaginatedResponse<Review>>(`/spots/${spotId}/reviews?page=${page}&limit=${limit}`);
  }

  async updateReview(reviewId: string, data: Partial<Review>): Promise<ApiResponse<Review>> {
    return this.put<Review>(`/reviews/${reviewId}`, data);
  }

  async deleteReview(reviewId: string): Promise<ApiResponse<void>> {
    return this.delete<void>(`/reviews/${reviewId}`);
  }

  async markReviewHelpful(reviewId: string): Promise<ApiResponse<Review>> {
    return this.put<Review>(`/reviews/${reviewId}/helpful`, {});
  }

  // Favorites
  async addToFavorites(spotId: string): Promise<ApiResponse<Favorite>> {
    return this.post<Favorite>('/favorites', { spotId });
  }

  async removeFromFavorites(spotId: string): Promise<ApiResponse<void>> {
    return this.delete<void>(`/favorites/${spotId}`);
  }

  async getMyFavorites(): Promise<ApiResponse<ChargingSpot[]>> {
    return this.get<ChargingSpot[]>('/favorites');
  }

  // Notifications
  async getNotifications(page = 1, limit = 20): Promise<ApiResponse<PaginatedResponse<Notification>>> {
    return this.get<PaginatedResponse<Notification>>(`/notifications?page=${page}&limit=${limit}`);
  }

  async markNotificationAsRead(notificationId: string): Promise<ApiResponse<Notification>> {
    return this.put<Notification>(`/notifications/${notificationId}/read`, {});
  }

  async markAllNotificationsAsRead(): Promise<ApiResponse<void>> {
    return this.put<void>('/notifications/read-all', {});
  }

  // Rewards & Leaderboard
  async getLeaderboard(limit = 50): Promise<ApiResponse<LeaderboardEntry[]>> {
    return this.get<LeaderboardEntry[]>(`/leaderboard?limit=${limit}`);
  }

  async getMyReferrals(): Promise<ApiResponse<Referral[]>> {
    return this.get<Referral[]>('/referrals');
  }

  async createReferral(email: string): Promise<ApiResponse<Referral>> {
    return this.post<Referral>('/referrals', { email });
  }

  async getUserStats(): Promise<ApiResponse<User['stats']>> {
    return this.get<User['stats']>('/user/stats');
  }

  // Contact & Newsletter
  async submitContactForm(data: ContactForm): Promise<ApiResponse<void>> {
    return this.post<void>('/contact', data);
  }

  async subscribeNewsletter(data: NewsletterSignup): Promise<ApiResponse<void>> {
    return this.post<void>('/newsletter', data);
  }

  // Admin endpoints
  async getAdminStats(): Promise<ApiResponse<any>> {
    return this.get<any>('/admin/stats');
  }

  async getAdminUsers(page = 1, limit = 50): Promise<ApiResponse<PaginatedResponse<User>>> {
    return this.get<PaginatedResponse<User>>(`/admin/users?page=${page}&limit=${limit}`);
  }

  async getAdminSpots(status?: ChargingSpot['status'], page = 1, limit = 50): Promise<ApiResponse<PaginatedResponse<ChargingSpot>>> {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (status) params.append('status', status);
    return this.get<PaginatedResponse<ChargingSpot>>(`/admin/spots?${params}`);
  }

  async getAdminRequests(status?: ChargingRequest['status'], page = 1, limit = 50): Promise<ApiResponse<PaginatedResponse<ChargingRequest>>> {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (status) params.append('status', status);
    return this.get<PaginatedResponse<ChargingRequest>>(`/admin/requests?${params}`);
  }

  async approveSpot(spotId: string): Promise<ApiResponse<ChargingSpot>> {
    return this.put<ChargingSpot>(`/admin/spots/${spotId}/approve`, {});
  }

  async suspendSpot(spotId: string, reason: string): Promise<ApiResponse<ChargingSpot>> {
    return this.put<ChargingSpot>(`/admin/spots/${spotId}/suspend`, { reason });
  }

  async updateUserRole(userId: string, role: User['role']): Promise<ApiResponse<User>> {
    return this.put<User>(`/admin/users/${userId}/role`, { role });
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Export individual methods for easier importing
export const {
  getCurrentUser,
  updateUserProfile,
  searchSpots,
  getSpotById,
  createSpot,
  updateSpot,
  deleteSpot,
  getMySpots,
  createRequest,
  getMyRequests,
  getRequestsForSpot,
  updateRequestStatus,
  completeRequest,
  createReview,
  getSpotReviews,
  updateReview,
  deleteReview,
  markReviewHelpful,
  addToFavorites,
  removeFromFavorites,
  getMyFavorites,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getLeaderboard,
  getMyReferrals,
  createReferral,
  getUserStats,
  submitContactForm,
  subscribeNewsletter,
  getAdminStats,
  getAdminUsers,
  getAdminSpots,
  getAdminRequests,
  approveSpot,
  suspendSpot,
  updateUserRole,
} = apiService;

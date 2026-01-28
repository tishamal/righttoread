// src/services/api.ts
import { API_ENDPOINTS } from '../config/apiConfig';
import { httpClient } from '../utils/httpClient';

export interface Book {
  id: string;
  title: string;
  grade: string;
  subject: string;
  author: string;
  description?: string;
  published_by_nie: boolean;
  year_published?: number;
  status: 'draft' | 'pending' | 'approved' | 'published';
  created_at: string;
  updated_at: string;
}

export interface Analytics {
  id: string;
  book_id: string;
  user_id?: string;
  school_name: string;
  reading_time_minutes: number;
  pages_read: number;
  audio_played: boolean;
  interaction_type?: string;
  created_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Books API
export const booksAPI = {
  async getAll(grade?: string): Promise<Book[]> {
    try {
      const url = grade ? `${API_ENDPOINTS.books}?grade=${encodeURIComponent(grade)}` : API_ENDPOINTS.books;
      const data = await httpClient.get<ApiResponse<Book[]>>(url);
      if (!data.success) throw new Error(data.error || 'Failed to fetch books');
      return data.data || [];
    } catch (error) {
      console.error('Error fetching books:', error);
      throw error;
    }
  },

  async getById(id: string): Promise<Book> {
    try {
      const data = await httpClient.get<ApiResponse<Book>>(API_ENDPOINTS.bookById(id));
      if (!data.success) throw new Error(data.error || 'Failed to fetch book');
      return data.data!;
    } catch (error) {
      console.error('Error fetching book:', error);
      throw error;
    }
  },

  async getByGrade(grade: string): Promise<Book[]> {
    try {
      const data = await httpClient.get<ApiResponse<Book[]>>(API_ENDPOINTS.booksByGrade(grade));
      if (!data.success) throw new Error(data.error || 'Failed to fetch books');
      return data.data || [];
    } catch (error) {
      console.error('Error fetching books by grade:', error);
      throw error;
    }
  },

  async create(book: Partial<Book>): Promise<Book> {
    try {
      const data = await httpClient.post<ApiResponse<Book>>(API_ENDPOINTS.books, book);
      if (!data.success) throw new Error(data.error || 'Failed to create book');
      return data.data!;
    } catch (error) {
      console.error('Error creating book:', error);
      throw error;
    }
  },

  async update(id: string, book: Partial<Book>): Promise<Book> {
    try {
      const data = await httpClient.put<ApiResponse<Book>>(API_ENDPOINTS.bookById(id), book);
      if (!data.success) throw new Error(data.error || 'Failed to update book');
      return data.data!;
    } catch (error) {
      console.error('Error updating book:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const data = await httpClient.delete<ApiResponse<void>>(API_ENDPOINTS.bookById(id));
      if (!data.success) throw new Error(data.error || 'Failed to delete book');
    } catch (error) {
      console.error('Error deleting book:', error);
      throw error;
    }
  },

  async getCount(): Promise<number> {
    try {
      const data = await httpClient.get<ApiResponse<{ total: number }>>(API_ENDPOINTS.bookCount);
      if (!data.success) throw new Error(data.error || 'Failed to get book count');
      return data.data?.total || 0;
    } catch (error) {
      console.error('Error getting book count:', error);
      return 0;
    }
  },
};

// Analytics API
export const analyticsAPI = {
  // Overview stats
  async getOverviewStats(): Promise<any> {
    try {
      const result = await httpClient.get<any>(API_ENDPOINTS.analytics.overview);
      if (!result.success) throw new Error(result.error || 'Failed to fetch overview stats');
      return result.data || {};
    } catch (error) {
      console.error('Error fetching overview stats:', error);
      throw error;
    }
  },

  // School analytics
  async getSchoolsStats(params?: { limit?: number; offset?: number; sortBy?: string }): Promise<any[]> {
    try {
      const url = new URL(API_ENDPOINTS.analytics.schools);
      if (params?.limit) url.searchParams.append('limit', params.limit.toString());
      if (params?.offset) url.searchParams.append('offset', params.offset.toString());
      if (params?.sortBy) url.searchParams.append('sortBy', params.sortBy);

      const result = await httpClient.get<any>(url.toString());
      if (!result.success) throw new Error(result.error || 'Failed to fetch schools stats');
      return result.data || [];
    } catch (error) {
      console.error('Error fetching schools stats:', error);
      throw error;
    }
  },

  // ✅ FIXED: School timeline (this is what was broken)
  async getSchoolTimeline(schoolId: number, range: string): Promise<any[]> {
    try {
      const data = await httpClient.get<ApiResponse<any[]>>(
        `${API_ENDPOINTS.analytics.schoolTimeline(schoolId)}?range=${encodeURIComponent(range)}`
      );
      if (!data.success) throw new Error(data.error || 'Failed to fetch school timeline');
      return data.data || [];
    } catch (error) {
      console.error('Error fetching school timeline:', error);
      throw error;
    }
  },

  // Book analytics
  async getPopularBooks(limit?: number): Promise<any[]> {
    try {
      const url = new URL(API_ENDPOINTS.analytics.popularBooks);
      if (limit) url.searchParams.append('limit', limit.toString());

      const result = await httpClient.get<any>(url.toString());
      if (!result.success) throw new Error(result.error || 'Failed to fetch popular books');
      return result.data || [];
    } catch (error) {
      console.error('Error fetching popular books:', error);
      throw error;
    }
  },

  async getBookDetails(bookId: number): Promise<any> {
    try {
      const result = await httpClient.get<any>(API_ENDPOINTS.analytics.bookDetails(bookId));
      if (!result.success) throw new Error(result.error || 'Failed to fetch book details');
      return result.data || {};
    } catch (error) {
      console.error('Error fetching book details:', error);
      throw error;
    }
  },

  async getBooksByGrade(): Promise<any[]> {
    try {
      const result = await httpClient.get<any>(API_ENDPOINTS.analytics.booksByGrade);
      if (!result.success) throw new Error(result.error || 'Failed to fetch books by grade');
      return result.data || [];
    } catch (error) {
      console.error('Error fetching books by grade:', error);
      throw error;
    }
  },

  // Time series data
  async getTimelineData(range: string): Promise<any[]> {
    try {
      const result = await httpClient.get<any>(`${API_ENDPOINTS.analytics.timeline}?range=${encodeURIComponent(range)}`);
      if (!result.success) throw new Error(result.error || 'Failed to fetch timeline data');
      return result.data || [];
    } catch (error) {
      console.error('Error fetching timeline data:', error);
      throw error;
    }
  },

  async getReadingPatterns(): Promise<any[]> {
    try {
      const result = await httpClient.get<any>(API_ENDPOINTS.analytics.readingPatterns);
      if (!result.success) throw new Error(result.error || 'Failed to fetch reading patterns');
      return result.data || [];
    } catch (error) {
      console.error('Error fetching reading patterns:', error);
      throw error;
    }
  },

  // Page engagement
  async getPageEngagement(bookId?: number): Promise<any[]> {
    try {
      const url = new URL(API_ENDPOINTS.analytics.pageEngagement);
      if (bookId) url.searchParams.append('bookId', bookId.toString());

      const result = await httpClient.get<any>(url.toString());
      if (!result.success) throw new Error(result.error || 'Failed to fetch page engagement');
      return result.data || [];
    } catch (error) {
      console.error('Error fetching page engagement:', error);
      throw error;
    }
  },

  // Sync & health
  async getSyncStatus(): Promise<any> {
    try {
      const result = await httpClient.get<any>(API_ENDPOINTS.analytics.syncStatus);
      if (!result.success) throw new Error(result.error || 'Failed to fetch sync status');
      return result.data || {};
    } catch (error) {
      console.error('Error fetching sync status:', error);
      throw error;
    }
  },

  async getSyncLogs(limit?: number): Promise<any[]> {
    try {
      const url = new URL(API_ENDPOINTS.analytics.syncLogs);
      if (limit) url.searchParams.append('limit', limit.toString());

      const result = await httpClient.get<any>(url.toString());
      if (!result.success) throw new Error(result.error || 'Failed to fetch sync logs');
      return result.data || [];
    } catch (error) {
      console.error('Error fetching sync logs:', error);
      throw error;
    }
  },

  async getDeviceStats(): Promise<any[]> {
    try {
      const result = await httpClient.get<any>(API_ENDPOINTS.analytics.deviceStats);
      if (!result.success) throw new Error(result.error || 'Failed to fetch device stats');
      return result.data || [];
    } catch (error) {
      console.error('Error fetching device stats:', error);
      throw error;
    }
  },
};

// TTS Service API
export const ttsAPI = {
  async uploadBook(pdfFile: File, startingPageNumber: number): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('pdf_file', pdfFile);
      formData.append('starting_page_number', startingPageNumber.toString());

      const data = await httpClient.post<any>(API_ENDPOINTS.tts.uploadBook, formData);
      return data;
    } catch (error) {
      console.error('Error uploading book for TTS processing:', error);
      throw error;
    }
  },

  async uploadBookWithDownload(pdfFile: File, startingPageNumber: number): Promise<Blob> {
    try {
      const formData = new FormData();
      formData.append('pdf_file', pdfFile);
      formData.append('starting_page_number', startingPageNumber.toString());

      const blob = await httpClient.uploadRaw<Blob>(API_ENDPOINTS.tts.uploadWithDownload, formData);
      return blob;
    } catch (error) {
      console.error('Error uploading book for TTS processing with download:', error);
      throw error;
    }
  },

  async getBooksForReview(params?: {
    status?: string;
    grade?: number;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    try {
      const url = new URL(API_ENDPOINTS.tts.booksForReview);
      if (params?.status) url.searchParams.append('status', params.status);
      if (params?.grade !== undefined) url.searchParams.append('grade', params.grade.toString());
      if (params?.limit) url.searchParams.append('limit', params.limit.toString());
      if (params?.offset) url.searchParams.append('offset', params.offset.toString());

      const data = await httpClient.get<any>(url.toString());
      return data.success ? data.data : [];
    } catch (error) {
      console.error('Error fetching books for review:', error);
      throw error;
    }
  },

  async getBookDetails(bookId: string | number): Promise<any> {
    try {
      const data = await httpClient.get<any>(API_ENDPOINTS.tts.bookDetails(bookId));
      return data.success ? data.data : null;
    } catch (error) {
      console.error('Error fetching book details:', error);
      throw error;
    }
  },

  async getPresignedUrls(
    bookId: string | number,
    s3Keys: string[],
    expiresIn: number = 3600
  ): Promise<Record<string, string>> {
    try {
      const data = await httpClient.post<any>(API_ENDPOINTS.tts.presignedUrls(bookId), {
          s3_keys: s3Keys,
          expires_in: expiresIn,
        });

      return data.success ? data.data : {};
    } catch (error) {
      console.error('Error getting presigned URLs:', error);
      throw error;
    }
  },

  async updateReviewStatus(
    bookId: string | number,
    status: string,
    reviewerNotes?: string
  ): Promise<any> {
    try {
      const data = await httpClient.put<any>(API_ENDPOINTS.tts.reviewStatus(bookId), {
          status,
          reviewer_notes: reviewerNotes,
        });
      return data;
    } catch (error) {
      console.error('Error updating review status:', error);
      throw error;
    }
  },

  async updatePageBlocks(
    bookId: string | number,
    pageNumber: number,
    updates: {
      blockOrder?: number[];
      ssmlEdits?: Record<string, string>;
      voiceChanges?: Record<string, string>;
      audioSpeed?: 'normal' | 'slow';
    }
  ): Promise<any> {
    try {
      const data = await httpClient.post<any>(API_ENDPOINTS.tts.updateBlocks(bookId, pageNumber), {
          blockOrder: updates.blockOrder,
          ssmlEdits: updates.ssmlEdits,
          voiceChanges: updates.voiceChanges,
          audioSpeed: updates.audioSpeed || 'normal',
        });
      return data;
    } catch (error) {
      console.error('Error updating page blocks:', error);
      throw error;
    }
  },
};

export default {
  booksAPI,
  analyticsAPI,
  ttsAPI,
};

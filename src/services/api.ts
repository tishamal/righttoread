// src/services/api.ts
import { BACKEND_API_URL, API_ENDPOINTS } from '../config/apiConfig';

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
      const response = await fetch(url);
      const data: ApiResponse<Book[]> = await response.json();
      if (!data.success) throw new Error(data.error || 'Failed to fetch books');
      return data.data || [];
    } catch (error) {
      console.error('Error fetching books:', error);
      throw error;
    }
  },

  async getById(id: string): Promise<Book> {
    try {
      const response = await fetch(API_ENDPOINTS.bookById(id));
      const data: ApiResponse<Book> = await response.json();
      if (!data.success) throw new Error(data.error || 'Failed to fetch book');
      return data.data!;
    } catch (error) {
      console.error('Error fetching book:', error);
      throw error;
    }
  },

  async getByGrade(grade: string): Promise<Book[]> {
    try {
      const response = await fetch(API_ENDPOINTS.booksByGrade(grade));
      const data: ApiResponse<Book[]> = await response.json();
      if (!data.success) throw new Error(data.error || 'Failed to fetch books');
      return data.data || [];
    } catch (error) {
      console.error('Error fetching books by grade:', error);
      throw error;
    }
  },

  async create(book: Partial<Book>): Promise<Book> {
    try {
      const response = await fetch(API_ENDPOINTS.books, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(book),
      });
      const data: ApiResponse<Book> = await response.json();
      if (!data.success) throw new Error(data.error || 'Failed to create book');
      return data.data!;
    } catch (error) {
      console.error('Error creating book:', error);
      throw error;
    }
  },

  async update(id: string, book: Partial<Book>): Promise<Book> {
    try {
      const response = await fetch(API_ENDPOINTS.bookById(id), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(book),
      });
      const data: ApiResponse<Book> = await response.json();
      if (!data.success) throw new Error(data.error || 'Failed to update book');
      return data.data!;
    } catch (error) {
      console.error('Error updating book:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const response = await fetch(API_ENDPOINTS.bookById(id), {
        method: 'DELETE',
      });
      const data: ApiResponse<void> = await response.json();
      if (!data.success) throw new Error(data.error || 'Failed to delete book');
    } catch (error) {
      console.error('Error deleting book:', error);
      throw error;
    }
  },

  async getCount(): Promise<number> {
    try {
      const response = await fetch(API_ENDPOINTS.bookCount);
      const data: ApiResponse<{ total: number }> = await response.json();
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
      const response = await fetch(API_ENDPOINTS.analytics.overview);
      const data: ApiResponse<any> = await response.json();
      if (!data.success) throw new Error(data.error || 'Failed to fetch overview stats');
      return data.data || {};
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
      
      const response = await fetch(url.toString());
      const data: ApiResponse<any[]> = await response.json();
      if (!data.success) throw new Error(data.error || 'Failed to fetch schools stats');
      return data.data || [];
    } catch (error) {
      console.error('Error fetching schools stats:', error);
      throw error;
    }
  },

  async getSchoolTimeline(schoolId: number, range: string): Promise<any[]> {
    try {
      const response = await fetch(`${API_ENDPOINTS.analytics.schoolTimeline(schoolId)}?range=${range}`);
      const data: ApiResponse<any[]> = await response.json();
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
      
      const response = await fetch(url.toString());
      const data: ApiResponse<any[]> = await response.json();
      if (!data.success) throw new Error(data.error || 'Failed to fetch popular books');
      return data.data || [];
    } catch (error) {
      console.error('Error fetching popular books:', error);
      throw error;
    }
  },

  async getBookDetails(bookId: number): Promise<any> {
    try {
      const response = await fetch(API_ENDPOINTS.analytics.bookDetails(bookId));
      const data: ApiResponse<any> = await response.json();
      if (!data.success) throw new Error(data.error || 'Failed to fetch book details');
      return data.data || {};
    } catch (error) {
      console.error('Error fetching book details:', error);
      throw error;
    }
  },

  async getBooksByGrade(): Promise<any[]> {
    try {
      const response = await fetch(API_ENDPOINTS.analytics.booksByGrade);
      const data: ApiResponse<any[]> = await response.json();
      if (!data.success) throw new Error(data.error || 'Failed to fetch books by grade');
      return data.data || [];
    } catch (error) {
      console.error('Error fetching books by grade:', error);
      throw error;
    }
  },

  // Time series data
  async getTimelineData(range: string): Promise<any[]> {
    try {
      const response = await fetch(`${API_ENDPOINTS.analytics.timeline}?range=${range}`);
      const data: ApiResponse<any[]> = await response.json();
      if (!data.success) throw new Error(data.error || 'Failed to fetch timeline data');
      return data.data || [];
    } catch (error) {
      console.error('Error fetching timeline data:', error);
      throw error;
    }
  },

  async getReadingPatterns(): Promise<any[]> {
    try {
      const response = await fetch(API_ENDPOINTS.analytics.readingPatterns);
      const data: ApiResponse<any[]> = await response.json();
      if (!data.success) throw new Error(data.error || 'Failed to fetch reading patterns');
      return data.data || [];
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
      
      const response = await fetch(url.toString());
      const data: ApiResponse<any[]> = await response.json();
      if (!data.success) throw new Error(data.error || 'Failed to fetch page engagement');
      return data.data || [];
    } catch (error) {
      console.error('Error fetching page engagement:', error);
      throw error;
    }
  },

  // Sync & health
  async getSyncStatus(): Promise<any> {
    try {
      const response = await fetch(API_ENDPOINTS.analytics.syncStatus);
      const data: ApiResponse<any> = await response.json();
      if (!data.success) throw new Error(data.error || 'Failed to fetch sync status');
      return data.data || {};
    } catch (error) {
      console.error('Error fetching sync status:', error);
      throw error;
    }
  },

  async getSyncLogs(limit?: number): Promise<any[]> {
    try {
      const url = new URL(API_ENDPOINTS.analytics.syncLogs);
      if (limit) url.searchParams.append('limit', limit.toString());
      
      const response = await fetch(url.toString());
      const data: ApiResponse<any[]> = await response.json();
      if (!data.success) throw new Error(data.error || 'Failed to fetch sync logs');
      return data.data || [];
    } catch (error) {
      console.error('Error fetching sync logs:', error);
      throw error;
    }
  },

  async getDeviceStats(): Promise<any[]> {
    try {
      const response = await fetch(API_ENDPOINTS.analytics.deviceStats);
      const data: ApiResponse<any[]> = await response.json();
      if (!data.success) throw new Error(data.error || 'Failed to fetch device stats');
      return data.data || [];
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

      const response = await fetch(API_ENDPOINTS.tts.uploadBook, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status: ${response.status}`);
      }

      const data = await response.json();
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

      const response = await fetch(API_ENDPOINTS.tts.uploadWithDownload, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status: ${response.status}`);
      }

      const blob = await response.blob();
      return blob;
    } catch (error) {
      console.error('Error uploading book for TTS processing with download:', error);
      throw error;
    }
  },
};

export default {
  booksAPI,
  analyticsAPI,
  ttsAPI,
};

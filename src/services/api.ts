// src/services/api.ts
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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
      const url = grade ? `${API_BASE_URL}/books?grade=${encodeURIComponent(grade)}` : `${API_BASE_URL}/books`;
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
      const response = await fetch(`${API_BASE_URL}/books/${id}`);
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
      const response = await fetch(`${API_BASE_URL}/books/grade/${encodeURIComponent(grade)}`);
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
      const response = await fetch(`${API_BASE_URL}/books`, {
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
      const response = await fetch(`${API_BASE_URL}/books/${id}`, {
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
      const response = await fetch(`${API_BASE_URL}/books/${id}`, {
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
      const response = await fetch(`${API_BASE_URL}/books/stats/count`);
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
  async record(analytics: Partial<Analytics>): Promise<Analytics> {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(analytics),
      });
      const data: ApiResponse<Analytics> = await response.json();
      if (!data.success) throw new Error(data.error || 'Failed to record analytics');
      return data.data!;
    } catch (error) {
      console.error('Error recording analytics:', error);
      throw error;
    }
  },

  async getByBook(bookId: string): Promise<Analytics[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/book/${bookId}`);
      const data: ApiResponse<Analytics[]> = await response.json();
      if (!data.success) throw new Error(data.error || 'Failed to fetch analytics');
      return data.data || [];
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  },

  async getBySchool(schoolName: string): Promise<Analytics[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/school/${encodeURIComponent(schoolName)}`);
      const data: ApiResponse<Analytics[]> = await response.json();
      if (!data.success) throw new Error(data.error || 'Failed to fetch analytics');
      return data.data || [];
    } catch (error) {
      console.error('Error fetching school analytics:', error);
      throw error;
    }
  },

  async getBookStats(): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/stats/books`);
      const data: ApiResponse<any[]> = await response.json();
      if (!data.success) throw new Error(data.error || 'Failed to fetch book stats');
      return data.data || [];
    } catch (error) {
      console.error('Error fetching book stats:', error);
      throw error;
    }
  },

  async getStats(): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/stats`);
      const data: ApiResponse<any> = await response.json();
      if (!data.success) throw new Error(data.error || 'Failed to fetch analytics stats');
      return data.data || { total_users: 0, total_downloads: 0, total_views: 0, active_sessions: 0 };
    } catch (error) {
      console.error('Error fetching analytics stats:', error);
      return { total_users: 0, total_downloads: 0, total_views: 0, active_sessions: 0 };
    }
  },

  async getSchoolStats(): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/stats/schools`);
      const data: ApiResponse<any[]> = await response.json();
      if (!data.success) throw new Error(data.error || 'Failed to fetch school stats');
      return data.data || [];
    } catch (error) {
      console.error('Error fetching school stats:', error);
      throw error;
    }
  },

  async getDateRange(startDate: Date, endDate: Date): Promise<Analytics[]> {
    try {
      const url = new URL(`${API_BASE_URL}/analytics/range`);
      url.searchParams.append('startDate', startDate.toISOString());
      url.searchParams.append('endDate', endDate.toISOString());
      
      const response = await fetch(url.toString());
      const data: ApiResponse<Analytics[]> = await response.json();
      if (!data.success) throw new Error(data.error || 'Failed to fetch analytics');
      return data.data || [];
    } catch (error) {
      console.error('Error fetching date range analytics:', error);
      throw error;
    }
  },
};

export default {
  booksAPI,
  analyticsAPI,
};

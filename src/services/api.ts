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

  async approvePage(bookId: string | number, pageId: number): Promise<any> {
    try {
      const data = await httpClient.post<any>(API_ENDPOINTS.tts.approvePage(bookId, pageId), {});
      return data;
    } catch (error) {
      console.error('Error approving page:', error);
      throw error;
    }
  },

  async deleteBlock(
    bookId: string | number, 
    pageId: number, 
    blockId: string, 
    audioSpeed: 'normal' | 'slow' = 'normal'
  ): Promise<any> {
    try {
      // Use the same base URL logic as other TTS endpoints if possible, or construct carefully
      // Based on DigitalVersionReview.tsx usage:
      const baseUrl = process.env.REACT_APP_TTS_SERVICE_URL || 'http://localhost:8000';
      const url = `${baseUrl}/digital-review/books/${bookId}/pages/${pageId}/blocks/${encodeURIComponent(blockId)}?audio_speed=${audioSpeed}`;
      
      const data = await httpClient.delete<any>(url);
      return data;
    } catch (error) {
      console.error('Error deleting block:', error);
      throw error;
    }
  },

  async regeneratePage(bookId: string | number, pageNumber: number): Promise<any> {
    try {
      const url = `${API_ENDPOINTS.tts.regeneratePage}?book_id=${bookId}&page_number=${pageNumber}`;
      const data = await httpClient.post<any>(url, {});
      return data;
    } catch (error) {
      console.error('Error regenerating page:', error);
      throw error;
    }
  },

  async generateDictionary(bookId: string | number): Promise<any> {
    try {
      const data = await httpClient.post<any>(API_ENDPOINTS.tts.generateDictionary(bookId), {});
      return data;
    } catch (error) {
      console.error('Error generating dictionary:', error);
      throw error;
    }
  },

  async generateAudioLibrary(bookId: string | number): Promise<any> {
    try {
      const data = await httpClient.post<any>(API_ENDPOINTS.tts.generateAudioLibrary(bookId), {});
      return data;
    } catch (error) {
      console.error('Error generating audio library:', error);
      throw error;
    }
  },
};

export interface PendingBook {
  id: number;
  title: string;
  grade: number;
  status: string; // 'pending', 'processing', 'failed'
  total_words: number;
}

export const imagesAPI = {
    async getPendingBooks(): Promise<PendingBook[]> {
        try {
            const data = await httpClient.get<PendingBook[]>(API_ENDPOINTS.images.pending);
            return data;
        } catch (error) {
            console.error('Error fetching pending books:', error);
            throw error;
        }
    },

    async generateImages(bookId: number | string): Promise<any> {
        try {
            const data = await httpClient.post(API_ENDPOINTS.images.generate(bookId), {});
            return data;
        } catch (error) {
            console.error('Error generating images:', error);
            throw error;
        }
    }
};

// Picture Dictionary API
const DICTIONARY_CACHE_KEY = 'picture_dictionary_cache';
// Valid for 50 minutes (S3 presigned URLs expire in 60 mins)
const CACHE_TTL_MS = 50 * 60 * 1000; 

export const pictureDictionaryAPI = {
  async getAll(): Promise<{ word: string; imageUrl: string }[]> {
    try {
      // Check cache first
      const cached = localStorage.getItem(DICTIONARY_CACHE_KEY);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed && Array.isArray(parsed.data) && parsed.timestamp) {
            // Invalidate if cache contains old presigned-URL shape or unmapped s3Key
            const firstItem = parsed.data[0];
            const isStaleShape = firstItem && (
              (firstItem.imageUrl && firstItem.imageUrl.startsWith('https://')) ||
              firstItem.s3Key
            );
            if (!isStaleShape && Date.now() - parsed.timestamp < CACHE_TTL_MS) {
              return parsed.data;
            }
            localStorage.removeItem(DICTIONARY_CACHE_KEY);
          }
        } catch (e) {
          // Invalid JSON in cache, ignore and fetch fresh data
          localStorage.removeItem(DICTIONARY_CACHE_KEY);
        }
      }

      const rawData = await httpClient.get<{ word: string; s3Key?: string; imageUrl?: string; timestamp: string }[]>(
        API_ENDPOINTS.dictionary.list
      );

      // Backend now returns s3Key instead of a presigned imageUrl.
      // Map each entry to use the server-side proxy download endpoint.
      const data = Array.isArray(rawData)
        ? rawData.map((item) => ({
            word: item.word,
            imageUrl: API_ENDPOINTS.dictionary.download(item.word),
          }))
        : [];

      // Update cache
      if (Array.isArray(data)) {
        localStorage.setItem(DICTIONARY_CACHE_KEY, JSON.stringify({
          data,
          timestamp: Date.now()
        }));
      }
      
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching picture dictionary:', error);
      // Fallback to cache if network fails, even if expired (better than nothing)
      const cached = localStorage.getItem(DICTIONARY_CACHE_KEY);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          return parsed.data || [];
        } catch (e) {
          // Ignore parse errors
        }
      }
      throw error;
    }
  },

  async addWord(word: string, description?: string, forceRegenerate: boolean = false): Promise<any> {
    try {
      const data = await httpClient.post<any>(API_ENDPOINTS.dictionary.addWord, { 
        word, 
        description,
        force_regenerate: forceRegenerate
      });
      // Invalidate cache immediately so the new word appears
      localStorage.removeItem(DICTIONARY_CACHE_KEY);
      // Also clear the http client internal cache to ensure we fetch fresh data
      httpClient.clearCache();
      return data;
    } catch (error) {
      console.error('Error adding word to picture dictionary:', error);
      throw error;
    }
  }
};

// Audio Library API
const AUDIO_LIBRARY_CACHE_KEY = 'audio_library_cache';

export const audioLibraryAPI = {
  async getAll(): Promise<{ word: string; audioUrl: string; timestamp: string }[]> {
    try {
      // Check cache (50-min TTL)
      const cached = localStorage.getItem(AUDIO_LIBRARY_CACHE_KEY);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed && Array.isArray(parsed.data) && parsed.timestamp) {
            // Invalidate if cache contains old presigned-URL shape (audioUrl starts with https)
            // or the new s3Key shape that hasn't been mapped yet.
            const firstItem = parsed.data[0];
            const isStaleShape = firstItem && (
              (firstItem.audioUrl && firstItem.audioUrl.startsWith('https://')) ||
              firstItem.s3Key
            );
            if (!isStaleShape && Date.now() - parsed.timestamp < CACHE_TTL_MS) {
              return parsed.data;
            }
            localStorage.removeItem(AUDIO_LIBRARY_CACHE_KEY);
          }
        } catch (e) {
          localStorage.removeItem(AUDIO_LIBRARY_CACHE_KEY);
        }
      }

      const rawData = await httpClient.get<{ word: string; s3Key?: string; audioUrl?: string; timestamp: string }[]>(
        API_ENDPOINTS.audioLibrary.list
      );

      // Backend now returns s3Key instead of a presigned audioUrl.
      // Map each entry to use the server-side proxy download endpoint so that
      // credentials never expire in the browser.
      const data = Array.isArray(rawData)
        ? rawData.map((item) => ({
            word: item.word,
            audioUrl: API_ENDPOINTS.audioLibrary.download(item.word),
            timestamp: item.timestamp,
          }))
        : [];

      if (Array.isArray(data)) {
        localStorage.setItem(AUDIO_LIBRARY_CACHE_KEY, JSON.stringify({
          data,
          timestamp: Date.now(),
        }));
      }

      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching audio library:', error);
      const cached = localStorage.getItem(AUDIO_LIBRARY_CACHE_KEY);
      if (cached) {
        try {
          return JSON.parse(cached).data || [];
        } catch (e) { /* ignore */ }
      }
      throw error;
    }
  },

  invalidateCache() {
    localStorage.removeItem(AUDIO_LIBRARY_CACHE_KEY);
  },
};

// Table of Contents API
export interface TOCEntry {
  id?: number;
  chapter_title: string;
  page_number: number;
  order_index: number;
}

export const tocAPI = {
  async getTableOfContents(bookId: number | string): Promise<TOCEntry[]> {
    try {
      const data = await httpClient.get<any>(API_ENDPOINTS.tts.tableOfContents(bookId));
      return data.success ? data.data : [];
    } catch (error) {
      console.error('Error fetching table of contents:', error);
      throw error;
    }
  },

  async saveTableOfContents(bookId: number | string, entries: TOCEntry[]): Promise<any> {
    try {
      const data = await httpClient.post<any>(API_ENDPOINTS.tts.tableOfContents(bookId), {
        entries,
      });
      return data;
    } catch (error) {
      console.error('Error saving table of contents:', error);
      throw error;
    }
  },
};

const api = {
  booksAPI,
  analyticsAPI,
  ttsAPI,
  imagesAPI,
  pictureDictionaryAPI,
};

// ---------------------------------------------------------------------------
// Book Word Dictionary API
// ---------------------------------------------------------------------------

export interface DictionaryWord {
  word: string;
  type?: string;
  sinhala_translation?: string;
  tamil_translation?: string;
  simple_definition?: string;
  contexts?: string[];
}

export interface DictionaryWordUpdate {
  sinhala_translation?: string;
  tamil_translation?: string;
  simple_definition?: string;
}

export interface DictionaryWordCreate {
  word: string;
  type?: string;
  sinhala_translation?: string;
  tamil_translation?: string;
  simple_definition?: string;
}

export const bookDictionaryAPI = {
  async getByBook(bookName: string): Promise<DictionaryWord[]> {
    try {
      const data = await httpClient.get<{ book_name: string; total_words: number; dictionary: DictionaryWord[] }>(
        API_ENDPOINTS.bookDictionary(bookName)
      );
      return data.dictionary || [];
    } catch (error) {
      console.error('Error fetching book dictionary:', error);
      throw error;
    }
  },

  async updateWord(bookName: string, word: string, payload: DictionaryWordUpdate): Promise<DictionaryWord> {
    try {
      const data = await httpClient.put<DictionaryWord>(
        API_ENDPOINTS.updateDictionaryWord(bookName, word),
        payload
      );
      return data;
    } catch (error) {
      console.error('Error updating dictionary word:', error);
      throw error;
    }
  },

  async addWord(bookName: string, payload: DictionaryWordCreate): Promise<DictionaryWord> {
    try {
      const data = await httpClient.post<DictionaryWord>(
        API_ENDPOINTS.bookDictionary(bookName),
        payload
      );
      return data;
    } catch (error) {
      console.error('Error adding dictionary word:', error);
      throw error;
    }
  },
};

export default api;

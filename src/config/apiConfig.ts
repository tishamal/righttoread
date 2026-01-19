// Centralized API configuration
// Single source of truth for all backend URLs

// Backend API base URL
export const BACKEND_API_URL = process.env.REACT_APP_BACKEND_API_URL || 'http://rtr-alb-1941150311.ap-southeast-1.elb.amazonaws.com/api';

// TTS Service base URL (Python FastAPI service) - this includes /api for the endpoints in api.ts
export const TTS_SERVICE_URL = process.env.REACT_APP_TTS_SERVICE_URL || 'http://47.129.10.145:8000/api';

// API Endpoints
export const API_ENDPOINTS = {
  // Books endpoints (Node.js backend)
  books: `${BACKEND_API_URL}/books`,
  bookById: (id: string) => `${BACKEND_API_URL}/books/${id}`,
  booksByGrade: (grade: string) => `${BACKEND_API_URL}/books/grade/${grade}`,
  bookCount: `${BACKEND_API_URL}/books/stats/count`,

  // Analytics endpoints (Node.js backend)
  analytics: {
    overview: `${BACKEND_API_URL}/analytics/overview`,
    schools: `${BACKEND_API_URL}/analytics/schools/stats`,
    schoolTimeline: (schoolId: number) => `${BACKEND_API_URL}/analytics/schools/${schoolId}/timeline`,
    popularBooks: `${BACKEND_API_URL}/analytics/books/popular`,
    bookDetails: (bookId: number) => `${BACKEND_API_URL}/analytics/books/${bookId}/details`,
    booksByGrade: `${BACKEND_API_URL}/analytics/books/by-grade`,
    timeline: `${BACKEND_API_URL}/analytics/timeline`,
    readingPatterns: `${BACKEND_API_URL}/analytics/reading-patterns`,
    pageEngagement: `${BACKEND_API_URL}/analytics/pages/engagement`,
    syncStatus: `${BACKEND_API_URL}/analytics/sync/status`,
    syncLogs: `${BACKEND_API_URL}/analytics/sync/logs`,
    deviceStats: `${BACKEND_API_URL}/analytics/device/stats`,
  },

  // TTS Service endpoints (Python FastAPI service)
  tts: {
    uploadBook: `${TTS_SERVICE_URL}/tts_service`,
    uploadWithDownload: `${TTS_SERVICE_URL}/tts_service_download`,
    booksForReview: `${TTS_SERVICE_URL}/books/pending_review`,
    bookDetails: (bookId: string | number) => `${TTS_SERVICE_URL}/books/${bookId}/details`,
    presignedUrls: (bookId: string | number) => `${TTS_SERVICE_URL}/books/${bookId}/presigned_urls`,
    reviewStatus: (bookId: string | number) => `${TTS_SERVICE_URL}/books/${bookId}/review_status`,
    updateBlocks: (bookId: string | number, pageNumber: number) => 
      `${TTS_SERVICE_URL}/books/${bookId}/pages/${pageNumber}/update-blocks`,
  },
};

export default API_ENDPOINTS;

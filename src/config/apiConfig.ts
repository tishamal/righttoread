// Centralized API configuration
// Single source of truth for all backend URLs

// Backend API base URL
export const BACKEND_API_URL = process.env.REACT_APP_BACKEND_API_URL;

// TTS Service base URL
export const TTS_SERVICE_URL = process.env.REACT_APP_TTS_SERVICE_URL;

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

  // Image Generation
  images: {
      pending: `${TTS_SERVICE_URL}/v1/images/books-pending`,
      generate: (bookId: number | string) => `${TTS_SERVICE_URL}/v1/images/generate/${bookId}`,
  },
  
  // Picture Dictionary
  dictionary: {
    list: `${TTS_SERVICE_URL}/dictionary`,
    addWord: `${TTS_SERVICE_URL}/dictionary/add`,
  },

  // User Management endpoints (Cognito via Python FastAPI service)
  users: {
    list: `${TTS_SERVICE_URL}/users`,
    create: `${TTS_SERVICE_URL}/users`,
  },

  // Auth endpoints (Cognito via Python FastAPI service)
  auth: {
    login:       `${TTS_SERVICE_URL}/auth/login`,
    setPassword: `${TTS_SERVICE_URL}/auth/set-password`,
    me:          `${TTS_SERVICE_URL}/auth/me`,
  },

  // School Registration endpoints (Python FastAPI service)
  schools: {
    list: `${TTS_SERVICE_URL}/registered-schools`,
    create: `${TTS_SERVICE_URL}/registered-schools`,
    byId: (id: number) => `${TTS_SERVICE_URL}/registered-schools/${id}`,
    update: (id: number) => `${TTS_SERVICE_URL}/registered-schools/${id}`,
    delete: (id: number) => `${TTS_SERVICE_URL}/registered-schools/${id}`,
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
    approvePage: (bookId: string | number, pageId: number) => 
      `${TTS_SERVICE_URL}/digital-review/books/${bookId}/pages/${pageId}/approve`,
    regeneratePage: `${TTS_SERVICE_URL}/tts/regenerate-page`,
    generateDictionary: (bookId: string | number) => `${TTS_SERVICE_URL}/books/${bookId}/generate-dictionary`,
    generateAudioLibrary: (bookId: string | number) => `${TTS_SERVICE_URL}/books/${bookId}/generate-audio-library`,
  },
};

export default API_ENDPOINTS;

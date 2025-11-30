// Analytics TypeScript Interfaces

export interface OverviewStats {
  totalActiveSchools: number;
  totalBooks: number;
  totalReadingTimeMs: number;
  totalReadingTimeHours: number;
  totalRecords: number;
  activeSchoolsLast7Days: number;
  activeSchoolsLast30Days: number;
  percentageChange: {
    schools: number;
    readingTime: number;
    records: number;
  };
}

export interface SchoolMetrics {
  id: number;
  schoolName: string;
  serialNumber: string;
  totalReadingTimeMs: number;
  totalReadingTimeHours: number;
  totalBooksAccessed: number;
  totalRecords: number;
  lastSyncTime: number;
  isActive: boolean;
}

export interface BookAnalytics {
  bookId: number;
  bookTitle: string;
  grade: number;
  totalActiveTimeMs: number;
  totalAccessCount: number;
  uniqueSchools: number;
  avgSessionTimeMs: number;
  pagesAccessed: number[];
}

export interface TimeSeriesDataPoint {
  timestamp: number;
  date: string;
  totalSessions: number;
  totalActiveTimeMs: number;
  uniqueBooks: number;
  uniqueSchools: number;
}

export interface PageEngagement {
  bookId: number;
  bookTitle?: string;
  pageNumber: number;
  totalSessions: number;
  avgActiveTimeMs: number;
  totalActiveTimeMs: number;
}

export interface SyncLogEntry {
  id: number;
  schoolId: number;
  schoolName: string;
  syncTimestamp: number;
  recordsProcessed: number;
  success: boolean;
  errorMessage?: string;
  createdAt: number;
}

export interface DeviceStats {
  platform: string;
  count: number;
  percentage: number;
  appVersion?: string;
  lastSeenAt?: number;
  [key: string]: any;
}

export interface GradeDistribution {
  grade: number;
  count: number;
  totalReadingTimeMs: number;
  percentage: number;
  [key: string]: any;
}

export interface ReadingPattern {
  hour: number;
  dayOfWeek: number;
  totalSessions: number;
  avgSessionTimeMs: number;
  [key: string]: any;
}

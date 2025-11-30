// Analytics Utility Helper Functions

/**
 * Convert milliseconds to hours with decimal precision
 */
export const convertMsToHours = (ms: number): number => {
  return Math.round((ms / (1000 * 60 * 60)) * 100) / 100;
};

/**
 * Convert milliseconds to minutes
 */
export const convertMsToMinutes = (ms: number): number => {
  return Math.round((ms / (1000 * 60)) * 100) / 100;
};

/**
 * Format milliseconds to readable time string (e.g., "2h 30m", "45m", "30s")
 */
export const formatReadingTime = (ms: number): string => {
  if (ms < 1000) return '0s';
  
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    const remainingHours = hours % 24;
    return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
  } else if (hours > 0) {
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  } else if (minutes > 0) {
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  } else {
    return `${seconds}s`;
  }
};

/**
 * Format timestamp to readable date string
 */
export const formatTimestamp = (timestamp: number, includeTime = false): string => {
  const date = new Date(timestamp);
  
  if (includeTime) {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Get relative time string (e.g., "2 hours ago", "3 days ago")
 */
export const getRelativeTime = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  
  if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`;
  if (weeks > 0) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
};

/**
 * Calculate percentage change between two values
 */
export const calculatePercentageChange = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
};

/**
 * Calculate average from array of numbers
 */
export const calculateAverage = (values: number[]): number => {
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, val) => acc + val, 0);
  return Math.round((sum / values.length) * 100) / 100;
};

/**
 * Format large numbers with K, M, B suffixes
 */
export const formatLargeNumber = (num: number): string => {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B';
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

/**
 * Get percentage with precision
 */
export const getPercentage = (value: number, total: number, precision = 1): number => {
  if (total === 0) return 0;
  return Number(((value / total) * 100).toFixed(precision));
};

/**
 * Format percentage for display
 */
export const formatPercentage = (value: number, total: number): string => {
  const percentage = getPercentage(value, total, 1);
  return `${percentage}%`;
};

/**
 * Get color based on grade level
 */
export const getGradeColor = (grade: number): string => {
  const gradeColors: { [key: number]: string } = {
    3: '#FF6B6B',
    4: '#4ECDC4',
    5: '#45B7D1',
    6: '#FFA07A',
    7: '#98D8C8',
    8: '#F7DC6F',
    9: '#BB8FCE',
    10: '#85C1E2',
  };
  return gradeColors[grade] || '#95A5A6';
};

/**
 * Export data to CSV
 */
export const exportToCSV = (data: any[], filename: string): void => {
  if (data.length === 0) return;

  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => {
        const value = row[header];
        // Escape commas and quotes in values
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    ),
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${Date.now()}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Get time range in milliseconds based on range string
 */
export const getTimeRangeMs = (range: string): { start: number; end: number } => {
  const end = Date.now();
  let start: number;

  switch (range) {
    case 'day':
    case '24h':
      start = end - 24 * 60 * 60 * 1000;
      break;
    case 'week':
    case '7d':
      start = end - 7 * 24 * 60 * 60 * 1000;
      break;
    case 'month':
    case '30d':
      start = end - 30 * 24 * 60 * 60 * 1000;
      break;
    case 'quarter':
    case '90d':
      start = end - 90 * 24 * 60 * 60 * 1000;
      break;
    case 'year':
    case '365d':
      start = end - 365 * 24 * 60 * 60 * 1000;
      break;
    default:
      start = end - 30 * 24 * 60 * 60 * 1000; // Default to 30 days
  }

  return { start, end };
};

/**
 * Group time series data by day/week/month
 */
export const groupTimeSeriesData = (
  data: Array<{ timestamp: number; value: number }>,
  granularity: 'day' | 'week' | 'month'
): Array<{ date: string; value: number }> => {
  const grouped: { [key: string]: number } = {};

  data.forEach(item => {
    const date = new Date(item.timestamp);
    let key: string;

    switch (granularity) {
      case 'day':
        key = date.toISOString().split('T')[0];
        break;
      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
        break;
      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
      default:
        key = date.toISOString().split('T')[0];
    }

    grouped[key] = (grouped[key] || 0) + item.value;
  });

  return Object.entries(grouped)
    .map(([date, value]) => ({ date, value }))
    .sort((a, b) => a.date.localeCompare(b.date));
};

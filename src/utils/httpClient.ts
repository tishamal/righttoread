export interface HttpClientConfig {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  cacheTTL?: number;
  enableLogging?: boolean;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class HttpClient {
  private config: HttpClientConfig;
  private cache: Map<string, CacheEntry<any>>;

  constructor() {
    this.config = {
      timeout: Number(process.env.REACT_APP_API_TIMEOUT) || 15000,
      retries: Number(process.env.REACT_APP_API_RETRIES) || 3,
      retryDelay: Number(process.env.REACT_APP_API_RETRY_DELAY) || 1000,
      cacheTTL: Number(process.env.REACT_APP_API_CACHE_TTL) || 300000,
      enableLogging: process.env.REACT_APP_ENABLE_API_LOGGING === 'true',
    };
    this.cache = new Map();
  }

  private log(message: string, data?: any) {
    if (this.config.enableLogging) {
      console.log(`[API] ${message}`, data || '');
    }
  }

  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private getCacheKey(url: string, options?: RequestInit): string {
    return `${url}-${JSON.stringify(options)}`;
  }

  private isCacheValid(entry: CacheEntry<any>): boolean {
    const now = Date.now();
    return now - entry.timestamp < (this.config.cacheTTL || 0);
  }

  private async fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), this.config.timeout);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(id);
      return response;
    } catch (error) {
      clearTimeout(id);
      throw error;
    }
  }

  async request<T>(url: string, options: RequestInit = {}, retries = this.config.retries, responseType: 'json' | 'blob' | 'text' = 'json'): Promise<T> {
    const startTime = Date.now();
    try {
      this.log(`Requesting: ${url}`, options);

      const response = await this.fetchWithTimeout(url, options);

      if (!response.ok) {
        // Don't retry client errors (4xx) except 429 (Too Many Requests) or 408 (Request Timeout)
        if (response.status >= 400 && response.status < 500 && ![408, 429].includes(response.status)) {
           const errorBody = await response.text();
           throw new Error(errorBody || `HTTP Error ${response.status}`);
        }
        throw new Error(`HTTP Error ${response.status}`);
      }
      
      this.log(`Success (${Date.now() - startTime}ms): ${url}`);
      
      if (responseType === 'blob') {
        return await response.blob() as any;
      }
      
      if (responseType === 'text') {
        return await response.text() as any;
      }
      
      // Default JSON
      const text = await response.text();
      const data = text ? JSON.parse(text) : {};
      return data;
      
    } catch (error: any) {
      if (retries && retries > 0) {
        this.log(`Failed. Retrying in ${this.config.retryDelay}ms... (${retries} attempts left)`);
        await this.delay(this.config.retryDelay || 1000);
        return this.request<T>(url, options, retries - 1, responseType);
      }
      
      this.log(`Failed after all retries: ${error.message}`);
      throw error;
    }
  }

  async get<T>(url: string, options: RequestInit = {}, skipCache = false): Promise<T> {
    if (!skipCache && this.config.cacheTTL && this.config.cacheTTL > 0) {
      const cacheKey = this.getCacheKey(url, options);
      const cached = this.cache.get(cacheKey);
      
      if (cached && this.isCacheValid(cached)) {
        this.log(`Cache HIT: ${url}`);
        return cached.data;
      }
    }

    const data = await this.request<T>(url, { ...options, method: 'GET' });

    if (!skipCache && this.config.cacheTTL && this.config.cacheTTL > 0) {
      const cacheKey = this.getCacheKey(url, options);
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
    }

    return data;
  }

  async post<T>(url: string, body?: any, options: RequestInit = {}): Promise<T> {
    const isFormData = body instanceof FormData;
    const headers: HeadersInit = { ...options.headers };
    
    if (!isFormData) {
      (headers as any)['Content-Type'] = 'application/json';
    }

    return this.request<T>(url, {
      ...options,
      method: 'POST',
      headers,
      body: isFormData ? body : JSON.stringify(body),
    });
  }
  
  // Special method for uploads that return blobs
  async uploadRaw<T>(url: string, body: FormData, options: RequestInit = {}): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: 'POST',
      body,
    }, this.config.retries, 'blob');
  }

  async put<T>(url: string, body?: any, options: RequestInit = {}): Promise<T> {
    const isFormData = body instanceof FormData;
    const headers: HeadersInit = { ...options.headers };
    
    if (!isFormData) {
      (headers as any)['Content-Type'] = 'application/json';
    }
    
    // Invalidate cache for this resource if needed based on URL structure, 
    // but for now, we just proceed. A more complex system might clear related collection caches.
    return this.request<T>(url, {
      ...options,
      method: 'PUT',
      headers,
      body: isFormData ? body : JSON.stringify(body),
    });
  }

  async delete<T>(url: string, options: RequestInit = {}): Promise<T> {
     return this.request<T>(url, {
      ...options,
      method: 'DELETE',
    });
  }
  
  // Method to manually clear cache if needed
  clearCache() {
    this.cache.clear();
  }
}

export const httpClient = new HttpClient();

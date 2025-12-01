const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export class ApiError extends Error {
  status: number;
  body?: unknown;
  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    // Abort after 10s by default
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        signal: controller.signal,
        ...options,
      });

      if (!response.ok) {
        let body: unknown = undefined;
        try {
          body = await response.json();
        } catch {
          // ignore json parse error
        }
        const message =
          (typeof body === 'object' && body && 'message' in (body as any)
            ? String((body as any).message)
            : response.statusText) || `HTTP ${response.status}`;
        throw new ApiError(message, response.status, body);
      }

      return (await response.json()) as T;
    } catch (error: any) {
      if (error?.name === 'AbortError') {
        throw new ApiError('Request timeout', 0);
      }
      if (error instanceof ApiError) {
        throw error;
      }
      // Network or unexpected error
      throw new ApiError(error?.message || 'Network error', 0);
    } finally {
      clearTimeout(timeout);
    }
  }

  // Bible API methods
  async getTranslations() {
    return this.request('/bible/translations');
  }

  async getBooks() {
    return this.request('/bible/books');
  }

  async getChapters(bookId: string) {
    const resp = await this.request<any>(`/bible/books/${bookId}/chapters`);
    // Normalize to array
    return Array.isArray(resp?.data) ? resp.data : Array.isArray(resp) ? resp : (resp?.chapters ?? []);
  }

  async getChapter(chapterId: string) {
    const resp = await this.request<any>(`/bible/chapters/${chapterId}`);
    // Normalize to object with verses if present
    if (resp?.data) return resp.data;
    return resp;
  }

  async getVerses(chapterId: string) {
    const resp = await this.request<any>(`/bible/chapters/${chapterId}/verses`);
    // Normalize to array of verses regardless of backend shape
    if (Array.isArray(resp?.data)) return resp.data;
    if (Array.isArray(resp?.verses)) return resp.verses;
    if (Array.isArray(resp)) return resp;
    return [];
  }

  async getVerse(verseId: string) {
    return this.request(`/bible/verses/${verseId}`);
  }

  async searchVerses(query: string) {
    return this.request(`/bible/search?q=${encodeURIComponent(query)}`);
  }

  async getVerseOfDay() {
    return this.request('/bible/verse-of-day');
  }

  async getAudio(book: string, chapter: number) {
    return this.request(`/bible/audio/${book}/${chapter}`);
  }

  async getStrongEntry(code: string) {
    return this.request(`/bible/strong/${code}`);
  }

  // Chat API methods
  async sendChatMessage(message: string, userId?: string) {
    return this.request('/chat', {
      method: 'POST',
      body: JSON.stringify({ message, userId }),
    });
  }

  async getChatHistory(userId: string) {
    return this.request(`/chat/history/${userId}`);
  }

  async getFAQ() {
    return this.request('/chat/faq');
  }
}

export const apiService = new ApiService();
const RAW_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
// Normalize base URL and ensure it includes /api suffix once
const _base = RAW_API_URL.replace(/\/$/, '');
const API_BASE_URL = _base.endsWith('/api') ? _base : `${_base}/api`;

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
        } catch {}
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

  // Helper to append optional bibleId query parameter
  private withBibleId(path: string, bibleId?: string) {
    if (!bibleId) return path;
    const sep = path.includes('?') ? '&' : '?';
    return `${path}${sep}bibleId=${encodeURIComponent(bibleId)}`;
  }

  // Bible API methods: always normalize to a stable shape
  async getTranslations() {
    const resp: any = await this.request('/bible/translations');
    return Array.isArray(resp?.data) ? resp.data : Array.isArray(resp) ? resp : [];
  }

  async getBooks(bibleId?: string) {
    const resp: any = await this.request(this.withBibleId('/bible/books', bibleId));
    return Array.isArray(resp?.data) ? resp.data : Array.isArray(resp) ? resp : (resp?.books ?? []);
  }

  async getChapters(bookId: string, bibleId?: string) {
    const resp: any = await this.request(this.withBibleId(`/bible/books/${bookId}/chapters`, bibleId));
    return Array.isArray(resp?.data) ? resp.data : Array.isArray(resp) ? resp : (resp?.chapters ?? []);
  }

  async getChapter(chapterId: string, bibleId?: string) {
    const resp: any = await this.request(this.withBibleId(`/bible/chapters/${chapterId}`, bibleId));
    return resp?.data ?? resp;
  }

  async getVerses(chapterId: string, bibleId?: string) {
    const resp: any = await this.request(this.withBibleId(`/bible/chapters/${chapterId}/verses`, bibleId));
    if (Array.isArray(resp?.data)) return resp.data;
    if (Array.isArray(resp?.verses)) return resp.verses;
    if (Array.isArray(resp)) return resp;
    return [];
  }

  async getVerse(verseId: string, bibleId?: string) {
    const resp: any = await this.request(this.withBibleId(`/bible/verses/${verseId}`, bibleId));
    return resp?.data ?? resp;
  }

  async searchVerses(query: string, bibleId?: string) {
    const path = this.withBibleId(`/bible/search?q=${encodeURIComponent(query)}`, bibleId);
    const resp: any = await this.request(path);
    return Array.isArray(resp?.data) ? resp.data : Array.isArray(resp) ? resp : (resp?.results ?? []);
  }

  async getVerseOfDay() {
    const resp: any = await this.request('/bible/verse-of-day');
    return resp?.data ?? resp;
  }

  async getAudio(book: string, chapter: number) {
    const resp: any = await this.request(`/bible/audio/${book}/${chapter}`);
    return resp?.data ?? resp;
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
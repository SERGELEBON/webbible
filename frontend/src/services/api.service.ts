const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
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
    return this.request(`/bible/books/${bookId}/chapters`);
  }

  async getChapter(chapterId: string) {
    return this.request(`/bible/chapters/${chapterId}`);
  }

  async getVerses(chapterId: string) {
    return this.request<any>(`/bible/chapters/${chapterId}/verses`);
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
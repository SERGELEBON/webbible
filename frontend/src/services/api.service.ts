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
    // inside ApiService
    private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
        const url = `${API_BASE_URL}${endpoint}`;

        // Abort after 10s by default
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        // helper for actual fetch to allow retry with cache-buster
        const doFetch = async (u: string) => {
            // Build options but ensure our cache and headers aren't lost
            const baseHeaders = {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache',
                ...(options?.headers || {}),
            };

            // Spread options last but ensure we keep signal/cache values
            return fetch(u, {
                cache: 'no-store',
                signal: controller.signal,
                ...options,
                headers: baseHeaders,
            } as RequestInit);
        };

        try {
            let response = await doFetch(url);

            // If server returns 304 Not Modified, retry once with cache-buster
            if (response.status === 304) {
                const sep = url.includes('?') ? '&' : '?';
                const busted = `${url}${sep}__ts=${Date.now()}`;
                response = await doFetch(busted);
            }

            // If no content (204) return undefined (caller must handle)
            if (response.status === 204) {
                return undefined as unknown as T;
            }

            // If not ok -> try to parse body for a helpful error message, but handle missing body
            if (!response.ok) {
                let body: unknown = undefined;
                try {
                    const ct = response.headers.get('content-type') ?? '';
                    if (ct.includes('application/json')) {
                        body = await response.json();
                    } else {
                        // may be empty
                        const txt = await response.text();
                        body = txt ? txt : undefined;
                    }
                } catch (err) {
                    body = undefined;
                }
                const message =
                    (typeof body === 'object' && body && 'message' in (body as any)
                        ? String((body as any).message)
                        : response.statusText) || `HTTP ${response.status}`;
                throw new ApiError(message, response.status, body);
            }

            // Safe parsing: if content-type is json -> json, if text -> text, else try json then text
            const contentType = response.headers.get('content-type') ?? '';
            if (!contentType) {
                // No content-type: try json but safely
                try {
                    return (await response.json()) as T;
                } catch {
                    const txt = await response.text();
                    return txt as unknown as T;
                }
            }

            if (contentType.includes('application/json')) {
                return (await response.json()) as T;
            } else if (contentType.startsWith('text/')) {
                const txt = await response.text();
                return txt as unknown as T;
            } else {
                // fallback: try json then text
                try {
                    return (await response.json()) as T;
                } catch {
                    const txt = await response.text();
                    return txt as unknown as T;
                }
            }
        } catch (error: any) {
            if (error?.name === 'AbortError') {
                throw new ApiError('Request timeout', 0);
            }
            if (error instanceof ApiError) throw error;
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
        if (!resp) return [];
        if (Array.isArray(resp?.data)) return resp.data;
        if (Array.isArray(resp?.translations)) return resp.translations;
        if (Array.isArray(resp)) return resp;
        return [];
    }

    async getBooks(bibleId?: string) {
        const resp: any = await this.request(this.withBibleId('/bible/books', bibleId));

        console.log('🔍 GET'); // <-- Ajoutez cette ligne
        console.log('📦 Réponse de getBooks:', resp); // <-- Ajoutez cette ligne

        if (!resp) return [];
        if (Array.isArray(resp?.data)) return resp.data;
        if (Array.isArray(resp?.books)) return resp.books;
        if (Array.isArray(resp)) return resp;
        return [];
    }

    async getChapters(bookId: string, bibleId?: string) {
        const resp: any = await this.request(this.withBibleId(`/bible/books/${encodeURIComponent(bookId)}/chapters`, bibleId));
        if (!resp) return [];
        if (Array.isArray(resp?.data)) return resp.data;
        if (Array.isArray(resp?.chapters)) return resp.chapters;
        if (Array.isArray(resp?.items)) return resp.items;
        if (Array.isArray(resp)) return resp;
        if (Array.isArray(resp?.data?.chapters)) return resp.data.chapters;
        return [];
    }

    async getChapter(chapterId: string, bibleId?: string) {
        const resp: any = await this.request(this.withBibleId(`/bible/chapters/${encodeURIComponent(chapterId)}`, bibleId));
        if (!resp) return null;
        // return either inner data or resp itself
        return resp?.data ?? resp;
    }

    async getVerses(chapterId: string, bibleId?: string) {
        const resp: any = await this.request(this.withBibleId(`/bible/chapters/${encodeURIComponent(chapterId)}/verses`, bibleId));
        console.log('🔍 GET'); // <-- Ajoutez cette ligne

        if (!resp) return [];
        if (Array.isArray(resp?.data)) return resp.data;
        if (Array.isArray(resp?.verses)) return resp.verses;
        if (Array.isArray(resp)) return resp;
        if (Array.isArray(resp?.data?.verses)) return resp.data.verses;
        // If backend returned a string (plain text) -> split lines into pseudo-verses
        if (typeof resp === 'string') {
            return resp.split(/\r?\n/).filter(Boolean).map((t, i) => ({ id: `${chapterId}-${i + 1}`, text: t }));
        }
        return [];
    }

    //A analyser prondement ----------------------------------------------------
    async getVerse(verseId: string, bibleId?: string) {
        const resp: any = await this.request(this.withBibleId(`/bible/verses/${encodeURIComponent(verseId)}`, bibleId));
        return resp?.data ?? resp;
    }

    async searchVerses(query: string, bibleId?: string) {
        const path = this.withBibleId(`/bible/search?q=${encodeURIComponent(query)}`, bibleId);
        const resp: any = await this.request(path);
        if (!resp) return [];
        if (Array.isArray(resp?.data)) return resp.data;
        if (Array.isArray(resp?.results)) return resp.results;
        if (Array.isArray(resp)) return resp;
        return [];
    }

    async getVerseOfDay() {
        const resp: any = await this.request('/bible/verse-of-day');
        return resp?.data ?? resp;
    }

    async getAudio(book: string, chapter: number) {
        const resp: any = await this.request(`/bible/audio/${encodeURIComponent(book)}/${chapter}`);
        return resp?.data ?? resp;
    }

    // Chat API methods
    async sendChatMessage(message: string, userId?: string) {
        return this.request('/chat', {
            method: 'POST',
            body: JSON.stringify({ message, userId }),
            headers: { 'Content-Type': 'application/json' },
        });
    }

    async getChatHistory(userId: string) {
        return this.request(`/chat/history/${encodeURIComponent(userId)}`);
    }

    async getFAQ() {
        return this.request('/chat/faq');
    }
}

export const apiService = new ApiService();

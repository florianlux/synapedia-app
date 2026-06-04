import type {
  ApiSearchResponse,
  ApiSubstanceDetailResponse,
  ApiInteractionCheckResponse,
} from './types';

// ── Config ─────────────────────────────────────────────────────────────────
// Set EXPO_PUBLIC_SYNAPEDIA_API_URL and EXPO_PUBLIC_SYNAPEDIA_API_KEY
// in your .env.local file (or .env for Expo Go).

const API_URL =
  process.env.EXPO_PUBLIC_SYNAPEDIA_API_URL ?? '';
const API_KEY =
  process.env.EXPO_PUBLIC_SYNAPEDIA_API_KEY ?? '';

const DEFAULT_TIMEOUT = 10_000;
const MAX_RETRIES = 1;

/** Returns true when real API credentials are configured. */
export function isApiConfigured(): boolean {
  return Boolean(API_URL && API_KEY);
}

// ── Error class ─────────────────────────────────────────────────────────────

export class SynapediaApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = 'SynapediaApiError';
  }
}

// ── Core fetch helper ───────────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options: {
    method?: 'GET' | 'POST';
    body?: Record<string, unknown>;
    timeout?: number;
  } = {},
): Promise<T> {
  const { method = 'GET', body, timeout = DEFAULT_TIMEOUT } = options;
  const url = `${API_URL}${path}`;

  let lastError: SynapediaApiError | undefined;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) await new Promise((r) => setTimeout(r, 500 * attempt));

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
        ...(body && { body: JSON.stringify(body) }),
        signal: controller.signal,
      });

      if (!res.ok) {
        let errorMessage = `Synapedia API Fehler (${res.status})`;
        let errorCode: string | undefined;
        try {
          const errorBody = await res.json();
          if (errorBody.error && typeof errorBody.error === 'object') {
            errorMessage = errorBody.error.message ?? errorMessage;
            errorCode = errorBody.error.code;
          } else if (typeof errorBody.error === 'string') {
            errorMessage = errorBody.error;
          } else if (errorBody.message) {
            errorMessage = errorBody.message;
          }
        } catch {
          // Unparsable error body — use default
        }
        const err = new SynapediaApiError(
          errorMessage,
          res.status,
          errorCode ?? (res.status === 404 ? 'NOT_FOUND' : undefined),
        );
        // 4xx errors are not retryable
        if (res.status >= 400 && res.status < 500) throw err;
        lastError = err;
        continue;
      }

      return (await res.json()) as T;
    } catch (err) {
      if (err instanceof SynapediaApiError) {
        if (err.status >= 400 && err.status < 500) throw err;
        lastError = err;
        continue;
      }
      if (err instanceof DOMException && err.name === 'AbortError') {
        lastError = new SynapediaApiError(
          'Zeitüberschreitung. Bitte erneut versuchen.',
          408,
          'TIMEOUT',
        );
        continue;
      }
      lastError = new SynapediaApiError(
        'Synapedia API nicht erreichbar. Bitte später erneut versuchen.',
        503,
        'NETWORK_ERROR',
      );
      continue;
    } finally {
      clearTimeout(timer);
    }
  }

  throw lastError!;
}

// ── Public API functions ────────────────────────────────────────────────────

export async function searchSubstances(
  query: string,
): Promise<ApiSearchResponse> {
  return apiFetch<ApiSearchResponse>(
    `/substances?q=${encodeURIComponent(query)}`,
  );
}

export async function getSubstanceDetail(
  slug: string,
): Promise<ApiSubstanceDetailResponse> {
  return apiFetch<ApiSubstanceDetailResponse>(
    `/substances/${encodeURIComponent(slug)}`,
  );
}

export async function checkInteraction(
  slugs: string[],
): Promise<ApiInteractionCheckResponse> {
  return apiFetch<ApiInteractionCheckResponse>('/interaction-check', {
    method: 'POST',
    body: { substances: slugs },
  });
}

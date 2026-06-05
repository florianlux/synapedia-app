const DEFAULT_API_URL = 'https://synapedia.com';
const DEFAULT_TIMEOUT_MS = 8_000;

const configuredUrl =
  process.env.EXPO_PUBLIC_SYNAPEDIA_API_URL?.trim() || DEFAULT_API_URL;

export const SYNAPEDIA_API_URL = configuredUrl.replace(/\/+$/, '');

export class SynapediaApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code:
      | 'HTTP_ERROR'
      | 'INVALID_JSON'
      | 'INVALID_RESPONSE'
      | 'NETWORK_ERROR'
      | 'TIMEOUT'
      | 'UNSAFE_PATH',
  ) {
    super(message);
    this.name = 'SynapediaApiError';
  }
}

function isAbortError(error: unknown): boolean {
  if (error instanceof Error && error.name === 'AbortError') return true;
  return typeof error === 'object' && error !== null && 'name' in error && error.name === 'AbortError';
}

function buildReadOnlyUrl(path: string, params?: Record<string, string | number | boolean>): string {
  if (!path.startsWith('/api/mobile/')) {
    throw new SynapediaApiError('Unsicherer API-Pfad.', 0, 'UNSAFE_PATH');
  }

  const url = new URL(path, SYNAPEDIA_API_URL);
  Object.entries(params ?? {}).forEach(([key, value]) => {
    url.searchParams.set(key, String(value));
  });
  return url.toString();
}

async function parseJsonSafely(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    throw new SynapediaApiError('API-Antwort ist kein gueltiges JSON.', response.status, 'INVALID_JSON');
  }
}

export async function getJson<T>(
  path: string,
  params?: Record<string, string | number | boolean>,
  options: { timeoutMs?: number } = {},
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
  );

  try {
    const response = await fetch(buildReadOnlyUrl(path, params), {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });

    const data = await parseJsonSafely(response);

    if (!response.ok) {
      throw new SynapediaApiError(
        `Synapedia API Fehler (${response.status}).`,
        response.status,
        'HTTP_ERROR',
      );
    }

    return data as T;
  } catch (error) {
    if (error instanceof SynapediaApiError) throw error;
    if (isAbortError(error)) {
      throw new SynapediaApiError('Zeitueberschreitung beim Laden.', 408, 'TIMEOUT');
    }
    throw new SynapediaApiError('Synapedia API nicht erreichbar.', 503, 'NETWORK_ERROR');
  } finally {
    clearTimeout(timeout);
  }
}

export async function postJson<T>(
  path: string,
  body: Record<string, unknown>,
  options: { timeoutMs?: number } = {},
): Promise<T> {
  if (path !== '/api/mobile/interactions/check') {
    throw new SynapediaApiError('Unsicherer API-Pfad.', 0, 'UNSAFE_PATH');
  }

  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
  );

  try {
    const response = await fetch(buildReadOnlyUrl(path), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    const data = await parseJsonSafely(response);

    if (!response.ok) {
      throw new SynapediaApiError(
        `Synapedia API Fehler (${response.status}).`,
        response.status,
        'HTTP_ERROR',
      );
    }

    return data as T;
  } catch (error) {
    if (error instanceof SynapediaApiError) throw error;
    if (isAbortError(error)) {
      throw new SynapediaApiError('Zeitueberschreitung beim Laden.', 408, 'TIMEOUT');
    }
    throw new SynapediaApiError('Synapedia API nicht erreichbar.', 503, 'NETWORK_ERROR');
  } finally {
    clearTimeout(timeout);
  }
}

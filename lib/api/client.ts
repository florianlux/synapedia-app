const DEFAULT_API_URL = 'https://synapedia.com';
const DEFAULT_TIMEOUT_MS = 8_000;

const configuredUrl =
  process.env.EXPO_PUBLIC_API_BASE_URL?.trim() ||
  process.env.EXPO_PUBLIC_SYNAPEDIA_API_URL?.trim();

export const SYNAPEDIA_API_URL = normalizeApiBaseUrl(configuredUrl);
export const API_BASE_URL = SYNAPEDIA_API_URL;

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

function isDevelopmentRuntime(): boolean {
  return typeof __DEV__ === 'boolean' && __DEV__;
}

function isPrivateIpv4(hostname: string): boolean {
  const parts = hostname.split('.').map((part) => Number(part));
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) {
    return false;
  }

  const [first, second] = parts;
  return (
    first === 10 ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168)
  );
}

function isLocalOrLanHost(hostname: string): boolean {
  const normalized = hostname.toLowerCase();
  return (
    normalized === 'localhost' ||
    normalized === '127.0.0.1' ||
    normalized === '0.0.0.0' ||
    normalized === '::1' ||
    normalized.endsWith('.local') ||
    isPrivateIpv4(normalized)
  );
}

function normalizeApiBaseUrl(rawValue: string | undefined): string {
  const candidate = rawValue?.trim() || DEFAULT_API_URL;
  const withProtocol = /^[a-z][a-z\d+.-]*:\/\//i.test(candidate)
    ? candidate
    : `https://${candidate}`;

  try {
    const url = new URL(withProtocol);
    const isHttp = url.protocol === 'http:' || url.protocol === 'https:';
    if (!isHttp) return DEFAULT_API_URL;

    url.search = '';
    url.hash = '';

    if (!isDevelopmentRuntime() && (url.protocol !== 'https:' || isLocalOrLanHost(url.hostname))) {
      return DEFAULT_API_URL;
    }

    return url.toString().replace(/\/+$/, '');
  } catch {
    return DEFAULT_API_URL;
  }
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
      headers: {
        Accept: 'application/json',
        'Cache-Control': 'no-cache, no-store',
      },
      cache: 'no-store',
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

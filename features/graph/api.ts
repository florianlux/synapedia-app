import { getJson, SynapediaApiError } from '@/lib/api/client';

import { createFallbackGraphPayload } from './fallback';
import { graphFocusToApiFocus, normalizeGraphFocus } from './navigation';
import { normalizeGraphPayload } from './normalize';
import type { GraphPayload } from './types';

export type GraphFetchResult = {
  payload: GraphPayload;
  errorMessage?: string;
};

function errorMessageFor(error: unknown): string {
  if (error instanceof SynapediaApiError) {
    if (error.code === 'TIMEOUT') return 'Der Live-Graph hat zu lange gebraucht. Lokaler Fallback ist sichtbar.';
    if (error.code === 'NETWORK_ERROR') return 'Der Live-Graph ist gerade nicht erreichbar. Lokaler Fallback ist sichtbar.';
    if (error.code === 'INVALID_RESPONSE' || error.code === 'INVALID_JSON') {
      return 'Die Graph-Antwort konnte nicht gelesen werden. Lokaler Fallback ist sichtbar.';
    }
  }

  return 'Live-Daten konnten nicht geladen werden. Lokaler Fallback ist sichtbar.';
}

export async function fetchGraphPayload(
  focus: string | undefined,
  safetyMode = false,
): Promise<GraphFetchResult> {
  const normalizedFocus = normalizeGraphFocus(focus);
  const apiFocus = graphFocusToApiFocus(normalizedFocus);

  if (!normalizedFocus || !apiFocus) {
    return {
      payload: createFallbackGraphPayload(undefined, safetyMode),
      errorMessage: 'Kein gültiger Graph-Fokus angegeben. Lokaler Fallback ist sichtbar.',
    };
  }

  try {
    const response = await getJson<unknown>('/api/graph', { focus: apiFocus });
    const payload = normalizeGraphPayload(response, { focus: normalizedFocus, safetyMode });

    if (payload.nodes.length === 0) {
      throw new SynapediaApiError('Leere Graph-Antwort.', 200, 'INVALID_RESPONSE');
    }

    return { payload };
  } catch (error) {
    return {
      payload: createFallbackGraphPayload(normalizedFocus, safetyMode),
      errorMessage: errorMessageFor(error),
    };
  }
}

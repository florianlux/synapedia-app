import { useCallback, useEffect, useState } from 'react';

import { fetchGraphPayload } from './api';
import type { GraphPayload } from './types';

export type GraphState =
  | { status: 'loading' }
  | {
      status: 'success';
      payload: GraphPayload;
      errorMessage?: string;
      retry: () => void;
    }
  | {
      status: 'error';
      message: string;
      retry: () => void;
    };

export function useGraph(focus: string | undefined, safetyMode = false): GraphState {
  const [reloadKey, setReloadKey] = useState(0);
  const [state, setState] = useState<GraphState>({ status: 'loading' });

  const retry = useCallback(() => {
    setReloadKey((value) => value + 1);
  }, []);

  useEffect(() => {
    let active = true;
    setState({ status: 'loading' });

    fetchGraphPayload(focus, safetyMode)
      .then((result) => {
        if (!active) return;
        setState({
          status: 'success',
          payload: result.payload,
          errorMessage: result.errorMessage,
          retry,
        });
      })
      .catch(() => {
        if (!active) return;
        setState({
          status: 'error',
          message: 'Graphdaten konnten nicht geladen werden.',
          retry,
        });
      });

    return () => {
      active = false;
    };
  }, [focus, reloadKey, retry, safetyMode]);

  return state;
}

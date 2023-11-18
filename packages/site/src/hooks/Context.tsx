import type { Dispatch, ReactNode, Reducer } from 'react';
import { createContext, useEffect, useReducer } from 'react';

import type { Snap } from '../types';
import { detectAccount, detectSnaps, getSnap, isFlask } from '../utils';

export type DerivedAddress = {
  address: string;
  origin: string;
  type: string;
};

export type MetamaskState = {
  account?: string;
  snapsDetected: boolean;
  isFlask: boolean;
  isLoading: boolean;
  installedSnap?: Snap;
  error?: Error;
  safes: any;
  derivedEOAs: DerivedAddress[];
};

const initialState: MetamaskState = {
  snapsDetected: false,
  isFlask: false,
  isLoading: true,
  safes: {},
  derivedEOAs: [],
};

type FoxDispatch = { type: FoxActions; payload: any };

export const MetaMaskContext = createContext<
  [MetamaskState, Dispatch<FoxDispatch>]
>([
  initialState,
  () => {
    /* no op */
  },
]);

export enum FoxActions {
  SetAccount = 'SetAccount',
  SetInstalled = 'SetInstalled',
  SetSnapsDetected = 'SetSnapsDetected',
  SetError = 'SetError',
  SetIsFlask = 'SetIsFlask',
  SetLoading = 'SetLoading',
  SetSafes = 'SetSafes',
  SetDerivedEOAs = 'SetDerivedEOAs',
}

const reducer: Reducer<MetamaskState, FoxDispatch> = (state, action) => {
  switch (action.type) {
    case FoxActions.SetAccount:
      return {
        ...state,
        account: action.payload,
      };
    case FoxActions.SetInstalled:
      return {
        ...state,
        installedSnap: action.payload,
      };
    case FoxActions.SetSnapsDetected:
      return {
        ...state,
        snapsDetected: action.payload,
      };
    case FoxActions.SetIsFlask:
      return {
        ...state,
        isFlask: action.payload,
      };
    case FoxActions.SetLoading:
      return {
        ...state,
        isLoading: action.payload,
      };
    case FoxActions.SetError:
      return {
        ...state,
        error: action.payload,
      };
    case FoxActions.SetSafes:
      return {
        ...state,
        safes: action.payload,
      };
    case FoxActions.SetDerivedEOAs:
      return {
        ...state,
        derivedEOAs: action.payload,
      };
    default:
      return state;
  }
};

/**
 * MetaMask context provider to handle MetaMask and snap status.
 *
 * @param props - React Props.
 * @param props.children - React component to be wrapped by the Provider.
 * @returns JSX.
 */
export const MetaMaskProvider = ({ children }: { children: ReactNode }) => {
  if (typeof window === 'undefined') {
    return <>{children}</>;
  }

  const [state, dispatch] = useReducer(reducer, initialState);

  // Find MetaMask Provider and search for Snaps
  // Also checks if MetaMask version is Flask
  useEffect(() => {
    const setSnapsCompatibility = async () => {
      dispatch({
        type: FoxActions.SetSnapsDetected,
        payload: await detectSnaps(),
      });
    };

    setSnapsCompatibility().catch(console.error);

    const setAccount = async () => {
      dispatch({
        type: FoxActions.SetAccount,
        payload: await detectAccount(),
      });
    };

    setAccount().catch(console.error);
  }, [window.ethereum]);

  // Set installed snaps
  useEffect(() => {
    /**
     * Detect if a snap is installed and set it in the state.
     */
    async function detectSnapInstalled() {
      dispatch({
        type: FoxActions.SetInstalled,
        payload: await getSnap(),
      });
    }

    const checkIfFlask = async () => {
      dispatch({
        type: FoxActions.SetIsFlask,
        payload: await isFlask(),
      });
    };

    if (state.snapsDetected) {
      detectSnapInstalled().catch(console.error);
      checkIfFlask().catch(console.error);
    }
  }, [state.snapsDetected]);

  useEffect(() => {
    let timeoutId: number;

    if (state.error) {
      timeoutId = window.setTimeout(() => {
        dispatch({
          type: FoxActions.SetError,
          payload: undefined,
        });
      }, 10000);
    }

    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [state.error]);

  return (
    <MetaMaskContext.Provider value={[state, dispatch]}>
      {children}
    </MetaMaskContext.Provider>
  );
};

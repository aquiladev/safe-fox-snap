import { useContext } from 'react';
import type { MetaMaskInpageProvider } from '@metamask/providers';

import { defaultSnapOrigin } from '../config';
import type { GetSnapsResponse, Snap } from '../types';
import { FoxActions, MetaMaskContext } from '../hooks';

/**
 * Get the installed snaps in MetaMask.
 *
 * @param provider - The MetaMask inpage provider.
 * @returns The snaps installed in MetaMask.
 */
export const getSnaps = async (
  provider?: MetaMaskInpageProvider,
): Promise<GetSnapsResponse> =>
  (await (provider ?? window.ethereum).request({
    method: 'wallet_getSnaps',
  })) as unknown as GetSnapsResponse;
/**
 * Connect a snap to MetaMask.
 *
 * @param snapId - The ID of the snap.
 * @param params - The params to pass with the snap to connect.
 */
export const connectSnap = async (
  snapId: string = defaultSnapOrigin,
  params: Record<'version' | string, unknown> = {},
) => {
  await window.ethereum.request({
    method: 'wallet_requestSnaps',
    params: {
      [snapId]: params,
    },
  });
};

/**
 * Get the snap from MetaMask.
 *
 * @param version - The version of the snap to install (optional).
 * @returns The snap object returned by the extension.
 */
export const getSnap = async (version?: string): Promise<Snap | undefined> => {
  try {
    const snaps = await getSnaps();

    return Object.values(snaps).find(
      (snap) =>
        snap.id === defaultSnapOrigin && (!version || snap.version === version),
    );
  } catch (error) {
    console.log('Failed to obtain installed snap', error);
    return undefined;
  }
};

/**
 * Invoke the "hello" method from the example snap.
 */

export const sendHello = async () => {
  await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: { snapId: defaultSnapOrigin, request: { method: 'hello' } },
  });
};

export const sendPing = async () => {
  const res = await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: { snapId: defaultSnapOrigin, request: { method: 'ping' } },
  });
  console.log(res);
};

export const sendGetSafes = async () => {
  return window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
      snapId: defaultSnapOrigin,
      request: { method: 'safeFox_getSafes', params: { chainId: 5 } },
    },
  });
};

export const useSnap = () => {
  const [, dispatch] = useContext(MetaMaskContext);

  const initSnap = async (chainId: number) => {
    try {
      const res = await window.ethereum.request({
        method: 'wallet_invokeSnap',
        params: {
          snapId: defaultSnapOrigin,
          request: { method: 'safeFox_getSafes', params: { chainId } },
        },
      });
      console.log('SAFES', res);

      const derivedAddresses = await window.ethereum.request({
        method: 'wallet_invokeSnap',
        params: {
          snapId: defaultSnapOrigin,
          request: { method: 'safeFox_getDerivedEOAs', params: { chainId } },
        },
      });
      console.log('DERIVED EOAs', derivedAddresses);

      dispatch({ type: FoxActions.SetSafes, payload: res });
      dispatch({ type: FoxActions.SetDerivedEOAs, payload: derivedAddresses });
      dispatch({ type: FoxActions.SetLoading, payload: false });
    } catch (error) {
      console.error(error);
      dispatch({ type: FoxActions.SetError, payload: error });
    }
    return;
  };

  return {
    initSnap,
  };
};

export const isLocalSnap = (snapId: string) => snapId.startsWith('local:');

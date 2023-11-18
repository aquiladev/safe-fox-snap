import SafeApiKit from '@safe-global/api-kit';
import Safe, { EthersAdapter } from '@safe-global/protocol-kit';

import { ApiParams, ConfirmTxRequestParams } from "./types/snapApi";
import { SnapState } from "./types/snapState";

export async function confirmTx(params: ApiParams): Promise<SnapState> {
  try {
    const { state, requestParams } = params;
    const { chainId } = requestParams as ConfirmTxRequestParams;
    if (chainId !== 5) {
      throw new Error(`Unsupported chainId: ${chainId}`);
    }

    return state;
  } catch (err) {
    console.error(`Problem found: ${err}`);
    throw err;
  }
}

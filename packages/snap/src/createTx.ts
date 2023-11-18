import { ApiParams, CreateTxRequestParams } from './types/snapApi';
import { SnapState } from './types/snapState';

export async function createTx(params: ApiParams): Promise<SnapState> {
  try {
    const { state, requestParams } = params;
    const { chainId } = requestParams as CreateTxRequestParams;
    if (chainId !== 5) {
      throw new Error(`Unsupported chainId: ${chainId}`);
    }

    return state;
  } catch (err) {
    console.error(`Problem found: ${err}`);
    throw err;
  }
}

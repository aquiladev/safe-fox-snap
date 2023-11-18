import { Mutex } from 'async-mutex';
import { SnapState } from './snapState';

export type ApiParams = {
  state: SnapState;
  requestParams: ApiRequestParams;
  mutex: Mutex;
  snap: any;
};

type BaseRequestParams = {
  chainId: number;
};

export type GetSafesRequestParams = BaseRequestParams;
export type GetDerivedEOAsRequestParams = BaseRequestParams;
export type CreateRandomTransferRequestParams = BaseRequestParams & {
  safe: string;
  to: string;
};

export type ConfirmTxRequestParams = BaseRequestParams & {
  safeTxHash: string;
  safe: string;
  execute?: boolean;
};

export type ApiRequestParams =
  | GetSafesRequestParams
  | GetDerivedEOAsRequestParams
  | CreateRandomTransferRequestParams
  | ConfirmTxRequestParams;

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
export type CreateTxRequestParams = BaseRequestParams & {
  safe: string;
  to: string;
  value: number;
  operation: number;
  data?: string;
  gasToken?: string;
  safeTxGas: number;
  baseGas: number;
  gasPrice: number;
  refundReceiver?: string;
  nonce: number;
  contractTransactionHash: string;
  sender: string;
  signature?: string;
  origin?: string;
};

export type ConfirmTxRequestParams = BaseRequestParams & {
  safeTxHash: string;
  signature: string;
};

export type ApiRequestParams =
  | GetSafesRequestParams
  | GetDerivedEOAsRequestParams
  | CreateTxRequestParams
  | ConfirmTxRequestParams;

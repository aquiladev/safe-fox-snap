export type SnapState = Record<number, Network>;

export type Network = Record<string, Safe[]>;
export type Safe = {
  address: string;
  meta: any;
  txs: any;
  balances: any;
};

import { ethers, utils } from 'ethers';
import SafeApiKit from '@safe-global/api-kit';
import { EthersAdapter } from '@safe-global/protocol-kit';

import { ApiParams, GetSafesRequestParams } from './types/snapApi';
import { SnapState } from './types/snapState';
import { API_NET_MAP } from './utils/constants';

export async function getSafes(params: ApiParams): Promise<SnapState> {
  try {
    const { state, requestParams } = params;
    const { chainId } = requestParams as GetSafesRequestParams;

    if (chainId !== 5) {
      throw new Error(`Unsupported chainId: ${chainId}`);
    }

    const accounts = await ethereum.request({
      method: 'eth_requestAccounts',
    });

    // const provider = new ethers.providers.Web3Provider(ethereum);
    // const safeService = new SafeApiKit({
    //   txServiceUrl: 'https://safe-transaction-goerli.safe.global',
    //   ethAdapter: new EthersAdapter({ ethers, provider }),
    // });

    const acc = (accounts instanceof Array ? accounts : [])[0];
    const url = `${API_NET_MAP[chainId]}/api/v1/owners/${utils.getAddress(
      acc,
    )}/safes/`;
    const res = await (await fetch(url)).json();
    const { safes } = res || { safes: [] };
    let data: any[] = [];
    if (safes instanceof Array) {
      data = await Promise.all(safes.map((s) => loadSafeDetailes(s, chainId)));
    }

    // const res = await safeService.getSafesByOwner(
    //   (data instanceof Array ? data : [])[0],
    // );

    // const data = snapUtils.getNetworks(state);
    console.log(`getSafes:\n${JSON.stringify(data, null, 2)}`);

    return {
      5: {
        [acc]: data,
      },
    };
  } catch (err) {
    console.error(`Problem found: ${err}`);
    throw err;
  }
}

async function loadSafeDetailes(address: string, chainId: number) {
  const baseUrl = API_NET_MAP[chainId];
  const metaUrl = `${baseUrl}/api/v1/safes/${utils.getAddress(address)}/`;
  const txsUrl = `${baseUrl}/api/v1/safes/${utils.getAddress(
    address,
  )}/all-transactions`;
  const balancesUrl = `${baseUrl}/api/v1/safes/${utils.getAddress(
    address,
  )}/balances`;

  const [meta, txs, balances] = await Promise.all([
    fetch(metaUrl).then((response) => response.json()),
    fetch(txsUrl).then((response) => response.json()),
    fetch(balancesUrl).then((response) => response.json()),
  ]);

  return {
    address,
    meta,
    txs,
    balances,
  };
}

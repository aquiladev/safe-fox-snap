import { ethers, utils } from 'ethers';
import { ApiParams, GetDerivedEOAsRequestParams } from './types/snapApi';

type DerivedAaddress = {
  address: string;
  origin: string;
  type: string;
};

export async function getDerivedEOAs(
  params: ApiParams,
): Promise<DerivedAaddress[]> {
  try {
    const { requestParams } = params;
    const { chainId } = requestParams as GetDerivedEOAsRequestParams;

    if (chainId !== 5) {
      throw new Error(`Unsupported chainId: ${chainId}`);
    }

    const accs = await snap.request({
      method: 'wallet_invokeSnap',
      params: {
        snapId: 'local:http://localhost:8081/',
        request: {
          method: 'starkNet_recoverAccounts',
          params: {
            startScanIndex: 0,
            maxScanned: 1,
            maxMissed: 0,
          },
        },
      },
    });
    console.log(
      `getDerivedEOAs [starkNet_recoverAccounts]:\n${JSON.stringify(
        accs,
        null,
        2,
      )}`,
    );

    // TODO: create account if not exists
    if (accs.length === 0) {
      throw new Error(`No accounts found`);
    }

    const result = await snap.request({
      method: 'wallet_invokeSnap',
      params: {
        snapId: 'local:http://localhost:8081/',
        request: {
          method: 'starkNet_signMessage',
          params: {
            signerAddress: accs[0].address,
            typedDataMessage: {
              types: {
                StarkNetDomain: [
                  { name: 'name', type: 'felt' },
                  { name: 'version', type: 'felt' },
                  { name: 'chainId', type: 'felt' },
                ],
                Person: [
                  { name: 'name', type: 'felt' },
                  { name: 'wallet', type: 'felt' },
                ],
                Msg: [{ name: 'contents', type: 'felt' }],
              },
              primaryType: 'Msg',
              domain: {
                name: 'Safe Fox',
                version: '1',
                chainId: 1,
              },
              message: {
                contents: 'safe-fox',
              },
            },
          },
        },
      },
    });
    console.log(
      `getDerivedEOAs [starkNet_signMessage]:\n${JSON.stringify(
        result,
        null,
        2,
      )}`,
    );

    ///EXAMPLE RESPONSE:
    // [
    //   "3489021473805912492976161311730578220633115504777095853859855237218457450358",
    //   "1076565483328287807263344511969348560651213095899548353674941112483357552268"
    // ]

    const accounts = [];
    if (result instanceof Array) {
      const derivedPKey = utils.keccak256(
        utils.toUtf8Bytes((result as Array<string>).join('')),
      );
      console.log(`getDerivedEOAs [derivedPKey]:\n${derivedPKey}`);
      const wallet = new ethers.Wallet(derivedPKey);
      accounts.push({
        address: wallet.address,
        origin: accs[0].address,
        type: 'starkNet',
      });
    }

    return accounts;
  } catch (err) {
    console.error(`Problem found: ${err}`);
    throw err;
  }
}

import { ethers, utils } from 'ethers';
import Safe, { EthersAdapter } from '@safe-global/protocol-kit';
import { GelatoRelayPack } from '@safe-global/relay-kit';

import { ApiParams, ConfirmTxRequestParams } from './types/snapApi';
import { recoveAccounts, signMessage } from './utils/starknet';
import { API_NET_MAP } from './utils/constants';
import SafeTransaction from '@safe-global/protocol-kit/dist/src/utils/transactions/SafeTransaction';

export async function confirmTxAA(params: ApiParams): Promise<void> {
  try {
    const { requestParams } = params;
    const { chainId, safe, safeTxHash, execute } =
      requestParams as ConfirmTxRequestParams;
    if (chainId !== 5) {
      throw new Error(`Unsupported chainId: ${chainId}`);
    }

    const accs = await recoveAccounts();
    if (accs.length === 0) {
      throw new Error(`No accounts found`);
    }

    const result = await signMessage(accs[0].address, 'safe-fox');
    if (!(result instanceof Array)) {
      throw new Error(`Unexpected result type: ${typeof result}`);
    }

    const derivedPKey = utils.keccak256(
      utils.toUtf8Bytes((result as Array<string>).join('')),
    );
    const provider = new ethers.providers.Web3Provider(ethereum as any);
    const wallet = new ethers.Wallet(derivedPKey, provider);

    const ethAdapter = new EthersAdapter({
      ethers,
      signerOrProvider: wallet,
    });

    const _safe = await Safe.create({
      ethAdapter,
      safeAddress: safe,
    });
    const signature = await _safe.signTransactionHash(safeTxHash);
    console.log('SIGNATURE', signature);

    const baseUrl = API_NET_MAP[chainId];
    const confirmUrl = `${baseUrl}/api/v1/multisig-transactions/${safeTxHash}/confirmations/`;

    if (!execute) {
      const response = await fetch(confirmUrl, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          accept: 'application/json',
        },
        body: JSON.stringify({ signature: signature.data }),
      });
      const result = await response.json();
      console.log('TRANSACTION CONFIRM', result);
    } else {
      const txUrl = `${baseUrl}/api/v1/multisig-transactions/${safeTxHash}/`;
      const response = await fetch(txUrl);
      const result = await response.json();
      console.log('TRANSACTION', JSON.stringify(result));

      const safeTx = await _safe.toSafeTransactionType(result);
      console.log('AAA', JSON.stringify(safeTx.data), safe);

      const relayPack = new GelatoRelayPack(
        'AkQntxvkPezC64h_ObbjRD4bVIk5aDl2533ftYlQAEQ_',
      );
      // GelatoRelaySDK/sponsoredCall: Failed with error: GelatoRelaySDK/getSupportedNetworks: Failed with error: (e.adapter || s.adapter) is not a function
      const tx = await relayPack.createRelayedTransaction({
        safe: _safe,
        // transactions: [safeTx.data],
        transactions: [
          {
            to: safeTx.data.to,
            data: safeTx.data.data,
            value: safeTx.data.value,
          },
        ],
      });
      const res = await relayPack.executeRelayTransaction(tx, _safe, {
        isSponsored: true,
      });
      console.log('TRANSACTION RELAY', res);

      // const d = await _safe.executeTransaction(result);
      // console.log('TRANSACTION EXEC', d);
    }

    // const safeApiKit = new SafeApiKit({
    //   txServiceUrl: API_NET_MAP[chainId],
    //   ethAdapter,
    // });
    // const signatureResponse = await safeApiKit.confirmTransaction(
    //   safeTxHash,
    //   signature.data,
    // );

    // const transaction = await safeApiKit.getTransaction(safeTxHash)
    // _safe.executeTransaction(transaction, signature.data)
    // return {};
  } catch (err) {
    console.error(`Problem found: ${err}`);
    throw err;
  }
}

import { GelatoRelayPack } from '@safe-global/relay-kit';
import { ApiParams, CreateRandomTransferRequestParams } from './types/snapApi';
import { SnapState } from './types/snapState';
import { BigNumber, ethers, utils } from 'ethers';
import { recoveAccounts, signMessage } from './utils/starknet';
import Safe, { EthersAdapter } from '@safe-global/protocol-kit';
import { MetaTransactionData } from '@safe-global/safe-core-sdk-types';

export async function createRandomTransfer(
  params: ApiParams,
): Promise<SnapState> {
  try {
    const { state, requestParams } = params;
    const { chainId, safe, to } =
      requestParams as CreateRandomTransferRequestParams;
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

    const relayPack = new GelatoRelayPack(
      'AkQntxvkPezC64h_ObbjRD4bVIk5aDl2533ftYlQAEQ_',
    );

    const transaction: MetaTransactionData = {
      to: to,
      data: '0x',
      value: BigNumber.from(Math.floor(Math.random() * 10)).toHexString(), // random integer from 0 to 9:
    };
    const relayedTransaction = await relayPack.createRelayedTransaction({
      safe: _safe,
      transactions: [transaction],
      options: {
        isSponsored: true,
      },
    });
    console.log('CREATE TRANSACTION', JSON.stringify(relayedTransaction));

    const { taskId } = await relayPack.executeRelayTransaction(
      await _safe.signTransaction(relayedTransaction),
      _safe,
    );
    console.log('TASK', taskId);

    return state;
  } catch (err) {
    console.error(`Problem found: ${err}`);
    throw err;
  }
}

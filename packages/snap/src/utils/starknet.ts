export async function recoveAccounts() {
  return snap.request({
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
}

export async function signMessage(address: string, msg: string) {
  return snap.request({
    method: 'wallet_invokeSnap',
    params: {
      snapId: 'local:http://localhost:8081/',
      request: {
        method: 'starkNet_signMessage',
        params: {
          signerAddress: address,
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
              contents: msg,
            },
          },
        },
      },
    },
  });
}

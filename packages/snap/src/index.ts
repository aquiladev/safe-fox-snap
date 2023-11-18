import type { OnRpcRequestHandler } from '@metamask/snaps-types';
import { panel, text } from '@metamask/snaps-ui';
import { Mutex } from 'async-mutex';

import { ApiParams, ApiRequestParams } from './types/snapApi';
import { getSafes } from './getSafes';
import { createTx } from './createTx';
import { getDerivedEOAs } from './getDerivedEOAs';

declare const snap;
const mutex = new Mutex();

/**
 * Handle incoming JSON-RPC requests, sent through `wallet_invokeSnap`.
 *
 * @param args - The request handler args as object.
 * @param args.origin - The origin of the request, e.g., the website that
 * invoked the snap.
 * @param args.request - A validated JSON-RPC request object.
 * @returns The result of `snap_dialog`.
 * @throws If the request method is not valid for this snap.
 */
export const onRpcRequest: OnRpcRequestHandler = async ({
  origin,
  request,
}) => {
  // Switch statement for methods not requiring state to speed things up a bit
  if (request.method === 'ping') {
    console.log('pong');
    return 'pong';
  }

  let state = await snap.request({
    method: 'snap_manageState',
    params: {
      operation: 'get',
    },
  });

  if (!state) {
    state = {};

    // initialize state if empty and set default data
    await snap.request({
      method: 'snap_manageState',
      params: {
        operation: 'update',
        newState: state,
      },
    });
  }

  const requestParams = request?.params as unknown as ApiRequestParams;
  console.log(
    `${request.method}:\nrequestParams: ${JSON.stringify(requestParams)}`,
  );

  const apiParams: ApiParams = {
    state,
    requestParams,
    snap,
    mutex,
  };

  switch (request.method) {
    // case 'hello':
    //   return snap.request({
    //     method: 'snap_dialog',
    //     params: {
    //       type: 'confirmation',
    //       content: panel([
    //         text(`Hello, **${origin}**!`),
    //         text('This custom confirmation is just for display purposes.'),
    //         text(
    //           'But you can edit the snap source code to make it do something, if you want to!',
    //         ),
    //       ]),
    //     },
    //   });
    case 'safeFox_getSafes':
      return getSafes(apiParams);
    case 'safeFox_getDerivedEOAs':
      return getDerivedEOAs(apiParams);
    case 'safeFox_createTx':
      return createTx(apiParams);
    case 'safeFox_confirmTxAA':
      return createTx(apiParams);
    default:
      throw new Error('Method not found.');
  }
};

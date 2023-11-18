import { useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import { BigNumber } from 'ethers';

import {
  ConnectButton,
  InstallFlaskButton,
  ReconnectButton,
  SendHelloButton,
  Card,
  Button,
} from '../components';
import { defaultSnapOrigin } from '../config';
import { FoxActions, MetaMaskContext } from '../hooks';
import {
  connectSnap,
  getSnap,
  isLocalSnap,
  sendGetSafes,
  sendHello,
  sendPing,
  shouldDisplayReconnectButton,
  useSnap,
} from '../utils';
import { MainView } from '../components/MainView';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  margin-top: 7.6rem;
  margin-bottom: 7.6rem;
  ${({ theme }) => theme.mediaQueries.small} {
    padding-left: 2.4rem;
    padding-right: 2.4rem;
    margin-top: 2rem;
    margin-bottom: 2rem;
    width: auto;
  }
`;

const Heading = styled.h1`
  margin-top: 0;
  margin-bottom: 2.4rem;
  text-align: center;
`;

const Span = styled.span`
  color: ${(props) => props.theme.colors.primary?.default};
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.large};
  font-weight: 500;
  margin-top: 0;
  margin-bottom: 0;
  ${({ theme }) => theme.mediaQueries.small} {
    font-size: ${({ theme }) => theme.fontSizes.text};
  }
`;

const CardContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  max-width: 64.8rem;
  width: 100%;
  height: 100%;
  margin-top: 1.5rem;
`;

const Notice = styled.div`
  background-color: ${({ theme }) => theme.colors.background?.alternative};
  border: 1px solid ${({ theme }) => theme.colors.border?.default};
  color: ${({ theme }) => theme.colors.text?.alternative};
  border-radius: ${({ theme }) => theme.radii.default};
  padding: 2.4rem;
  margin-top: 2.4rem;
  max-width: 60rem;
  width: 100%;

  & > * {
    margin: 0;
  }
  ${({ theme }) => theme.mediaQueries.small} {
    margin-top: 1.2rem;
    padding: 1.6rem;
  }
`;

const ErrorMessage = styled.div`
  background-color: ${({ theme }) => theme.colors.error?.muted};
  border: 1px solid ${({ theme }) => theme.colors.error?.default};
  color: ${({ theme }) => theme.colors.error?.alternative};
  border-radius: ${({ theme }) => theme.radii.default};
  padding: 2.4rem;
  margin-bottom: 2.4rem;
  margin-top: 2.4rem;
  max-width: 60rem;
  width: 100%;
  ${({ theme }) => theme.mediaQueries.small} {
    padding: 1.6rem;
    margin-bottom: 1.2rem;
    margin-top: 1.2rem;
    max-width: 100%;
  }
`;

const CHAIN = 5;

const Index = () => {
  const [state, dispatch] = useContext(MetaMaskContext);
  const { initSnap } = useSnap();

  const isMetaMaskReady = isLocalSnap(defaultSnapOrigin)
    ? state.isFlask
    : state.snapsDetected;

  const handleConnectClick = async () => {
    try {
      await connectSnap();
      const installedSnap = await getSnap();

      dispatch({
        type: FoxActions.SetInstalled,
        payload: installedSnap,
      });
    } catch (error) {
      console.error(error);
      dispatch({ type: FoxActions.SetError, payload: error });
    }
  };

  const handleSendHelloClick = async () => {
    try {
      await sendHello();
    } catch (error) {
      console.error(error);
      dispatch({ type: FoxActions.SetError, payload: error });
    }
  };

  const handleSendPingClick = async () => {
    try {
      await sendPing();
    } catch (error) {
      console.error(error);
      dispatch({ type: FoxActions.SetError, payload: error });
    }
  };

  const handleSendGetSafesClick = async () => {
    try {
      await sendGetSafes();
    } catch (error) {
      console.error(error);
      dispatch({ type: FoxActions.SetError, payload: error });
    }
  };

  useEffect(() => {
    if (state.installedSnap) {
      const chainId = BigNumber.from(window.ethereum?.chainId).toNumber();
      console.log('chainId', chainId);
      if (chainId !== CHAIN) {
        dispatch({
          type: FoxActions.SetError,
          payload: new Error(
            'The chain is not supported, pls switch to Goerli',
          ),
        });
      }

      console.log('state', state);
      const { enabled, blocked } = state.installedSnap as unknown as {
        enabled: boolean;
        blocked: boolean;
      };
      if (enabled && !blocked) {
        initSnap(chainId);
      }
    }
  }, [state.installedSnap]);

  // const chainSafes = state.safes[CHAIN];
  // console.log('BBBBBB', chainSafes, state.account);
  // const accSafes = !!chainSafes && chainSafes[state.account];
  // console.log('AAAAAA', accSafes);

  return (
    <Container>
      {/* <Heading>
        Welcome to <Span>template-snap</Span>
      </Heading> */}
      {/* <Subtitle>
        Get started by editing <code>src/index.ts</code>
      </Subtitle> */}
      <CardContainer>
        {state.error && (
          <ErrorMessage>
            <b>An error happened:</b> {state.error.message}
          </ErrorMessage>
        )}
        {!isMetaMaskReady && (
          <Card
            content={{
              title: 'Install',
              description:
                'Snaps is pre-release software only available in MetaMask Flask, a canary distribution for developers with access to upcoming features.',
              button: <InstallFlaskButton />,
            }}
            fullWidth
          />
        )}
        {!state.installedSnap && (
          <Card
            content={{
              title: 'Connect',
              description:
                'Get started by connecting to and installing the example snap.',
              button: (
                <ConnectButton
                  onClick={handleConnectClick}
                  disabled={!isMetaMaskReady}
                />
              ),
            }}
            disabled={!isMetaMaskReady}
            fullWidth
          />
        )}
        {/* {shouldDisplayReconnectButton(state.installedSnap) && (
          <Card
            content={{
              title: 'Reconnect',
              description:
                'While connected to a local running snap this button will always be displayed in order to update the snap if a change is made.',
              button: (
                <ReconnectButton
                  onClick={handleConnectClick}
                  disabled={!state.installedSnap}
                />
              ),
            }}
            disabled={!state.installedSnap}
            fullWidth
          />
        )} */}
        {/* <Card
          content={{
            title: 'Send actions',
            description:
              'Display a custom message within a confirmation screen in MetaMask.',
            button: (
              <SendHelloButton
                onClick={handleSendHelloClick}
                disabled={!state.installedSnap}
              />
            ),
          }}
          disabled={!state.installedSnap}
          fullWidth={
            isMetaMaskReady &&
            Boolean(state.installedSnap) &&
            !shouldDisplayReconnectButton(state.installedSnap)
          }
        /> */}
        {/* <Notice>
          <p>
            Please note that the <b>snap.manifest.json</b> and{' '}
            <b>package.json</b> must be located in the server root directory and
            the bundle must be hosted at the location specified by the location
            field.
          </p>
        </Notice> */}
      </CardContainer>
      {state.isLoading ? (
        <div>Loading ...</div>
      ) : (
        <>
          {/* <CardContainer>
            <Button
              onClick={handleSendPingClick}
              disabled={!state.installedSnap}
            >
              Ping
            </Button>
            <Button
              onClick={handleSendGetSafesClick}
              disabled={!state.installedSnap}
            >
              Get Safes
            </Button>
          </CardContainer> */}
          {/* {accSafes.length && (
            <SafeView
              address={accSafes[0].address}
              meta={accSafes[0].meta}
              assets={accSafes[0].balances}
              txs={accSafes[0].txs}
            ></SafeView>
          )} */}
          {state.account && (
            <MainView address={state.account} chainId={CHAIN} />
          )}
        </>
      )}
    </Container>
  );
};

export default Index;

import { useContext, useEffect } from 'react';
import styled from 'styled-components';
import { BigNumber } from 'ethers';

import { ConnectButton, InstallFlaskButton, Card } from '../components';
import { defaultSnapOrigin } from '../config';
import { FoxActions, MetaMaskContext } from '../hooks';
import { connectSnap, getSnap, isLocalSnap, useSnap } from '../utils';
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

  return (
    <Container>
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
      </CardContainer>
      {state.isLoading ? (
        <div>Loading ...</div>
      ) : (
        <>
          {state.account && (
            <MainView address={state.account} chainId={CHAIN} />
          )}
        </>
      )}
    </Container>
  );
};

export default Index;

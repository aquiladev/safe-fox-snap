import { useContext, useState } from 'react';
import styled from 'styled-components';

import { SideBar } from '../components/SideBar';
import { MetaMaskContext } from '../hooks';
import { shortenAddress } from '../utils/utils';
import { formatUnits } from 'ethers/lib/utils';
import { Button } from './Button';

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  min-height: 609px;
  max-height: 79vh;
  border: 1px solid ${(props) => props.theme.colors.border.default};

  @media (max-height: 768px) {
    max-height: 609px;
  }
`;

const RightPart = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-height: 100%;
  background-color: ${(props) => props.theme.colors.background.default};
  padding: ${(props) => props.theme.spacing.small};
  min-width: 480px;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const RightPartContent = styled.div`
  padding: ${(props) => props.theme.spacing.small};
  overflow-y: scroll;
`;

const RightPartContentHeader = styled.h1`
  color: ${(props) => props.theme.colors.text.default};
  font-size: ${({ theme }) => theme.typography.h4.fontSize};
`;

const SubHeader = styled.h2`
  color: ${(props) => props.theme.colors.text.default};
  font-size: ${({ theme }) => theme.fontSizes.text};
`;

const ItemView = styled.div`
  background-color: ${(props) => props.theme.colors.background.alternative};
  margin-bottom: ${(props) => props.theme.spacing.tiny2};
  padding: ${(props) => props.theme.spacing.tiny2};
`;

type Props = {
  address: string;
  chainId: number;
};

export const MainView = ({ address, chainId }: Props) => {
  const [state, dispatch] = useContext(MetaMaskContext);
  const [selectedTab, setSelectedTab] = useState(0);

  const chainSafes = state.safes[chainId];
  const accSafes = !!chainSafes && chainSafes[address];

  if (!accSafes || !accSafes.length) {
    return <div>Loading ...</div>;
  }

  const firstSafe = accSafes?.sort(
    (s1, s2) => s2?.txs?.count - s1?.txs?.count,
  )[0];
  console.log('FIRST', firstSafe);

  return (
    <Wrapper>
      <SideBar
        address={address}
        chainId={chainId}
        handleClick={(tab) => setSelectedTab(tab)}
      />
      <RightPart>
        <RightPartContent>
          {selectedTab === 0 && (
            <>
              <RightPartContentHeader>Transactions</RightPartContentHeader>
              <SubHeader style={{ color: 'orange' }}>Queued</SubHeader>
              {firstSafe.txs &&
                firstSafe.txs.results instanceof Array &&
                firstSafe.txs.results
                  .filter(
                    (tx) => !tx.blockNumber && tx.nonce >= firstSafe.meta.nonce,
                  )
                  .map((tx, i) => {
                    return (
                      <ItemView key={i}>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                          }}
                        >
                          <div>
                            <b>From:</b> {shortenAddress(tx.from)}
                          </div>
                          <div>
                            <b>To:</b> {shortenAddress(tx.to)}
                          </div>
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                          }}
                        >
                          <div>
                            <b>Data:</b>{' '}
                            {(tx.data || '0x').slice(0, 24) + '...'}
                          </div>
                          <div>
                            <b>Value:</b> {formatUnits(tx.value || 0, 18)}
                          </div>
                        </div>
                        <div>
                          <Button>Execute</Button>
                        </div>
                      </ItemView>
                    );
                  })}
              <SubHeader style={{ color: 'green' }}>Completed</SubHeader>
              {firstSafe.txs &&
                firstSafe.txs.results instanceof Array &&
                firstSafe.txs.results
                  .filter((tx) => tx.blockNumber)
                  .map((tx, i) => {
                    return (
                      <ItemView key={i}>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                          }}
                        >
                          <div>
                            <b>From:</b> {shortenAddress(tx.from)}
                          </div>
                          <div>
                            <b>To:</b> {shortenAddress(tx.to)}
                          </div>
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                          }}
                        >
                          <div>
                            <b>Data:</b>{' '}
                            {(tx.data || '0x').slice(0, 24) + '...'}
                          </div>
                          <div>
                            <b>Value:</b> {formatUnits(tx.value || 0, 18)}
                          </div>
                        </div>
                        <div>
                          <b>BlockNumber:</b> {tx.blockNumber}
                        </div>
                      </ItemView>
                    );
                  })}
            </>
          )}
          {selectedTab === 1 && (
            <>
              <RightPartContentHeader>Assets</RightPartContentHeader>
              {firstSafe.balances &&
                firstSafe.balances instanceof Array &&
                firstSafe.balances.map((b, i) => {
                  if (!b.token) {
                    return (
                      <ItemView key={i}>
                        <div>
                          <b>ETH: </b>
                          {formatUnits(b.balance, 18)}
                        </div>
                      </ItemView>
                    );
                  } else {
                    return (
                      <ItemView key={i}>
                        <div>
                          <b>
                            {b.token.name} ({b.token.symbol}):{' '}
                          </b>
                          {formatUnits(b.balance, b.token.decimals)}
                        </div>
                      </ItemView>
                    );
                  }
                })}
            </>
          )}
        </RightPartContent>
      </RightPart>
    </Wrapper>
  );
};

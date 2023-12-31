import { useContext, useRef, useState } from 'react';
import styled from 'styled-components';
import { BigNumber } from 'ethers';
import { SafeDetailsModal } from '../SafeDetailsModal';
import { SafesList } from '../SafesList';

const ActButton = styled.div`
  padding-top: 15px;
  padding-bottom: 15px;
  padding-left: 20px;
  cursor: pointer;
  font-size: 18px;
  font-weight: 600;

  &:hover {
    color: ${(props) => props.theme.colors.text.alternative};
    background-color: ${(props) => props.theme.colors.background.alternative};
  }
`;

import {
  AccountDetailButton,
  AccountDetails,
  AccountDetailsContent,
  AccountImageStyled,
  AddTxButton,
  CreateSafeButton,
  DivList,
  PopInStyled,
  RowDiv,
  Wrapper,
} from './SideBar.style';
import { MetaMaskContext } from '../../hooks';
import { SafeAddress } from '../SafeAddress';
import { createRandomTransfer } from '../../utils';

type Props = {
  address: string;
  chainId: number;
  selectedSafe: string;
  handleClick(opt: number): void;
};

export const SideBarView = ({
  address,
  chainId,
  selectedSafe,
  handleClick,
}: Props) => {
  const [state] = useContext(MetaMaskContext);

  const [accountDetailsOpen, setAccountDetailsOpen] = useState(false);

  const chainSafes = state.safes[chainId];

  // Select safe with most transactions
  const accSafes = !!chainSafes && chainSafes[address];

  const ref = useRef<HTMLDivElement>();
  const firstSafe = accSafes?.find((s) => s.address === selectedSafe);
  const rest = accSafes?.filter((x) => x.address !== firstSafe.address);

  return (
    <Wrapper>
      <PopInStyled
        isOpen={accountDetailsOpen}
        setIsOpen={setAccountDetailsOpen}
      >
        <SafeDetailsModal meta={firstSafe.meta} />
      </PopInStyled>
      <AccountDetails
        arrowVisible={false}
        closeTrigger="click"
        offSet={[0, 0]}
        content={
          <AccountDetailsContent>
            <SafesList safes={rest.map((s) => s.address)} />
            <CreateSafeButton backgroundTransparent iconLeft="add">
              Create safe
            </CreateSafeButton>
            <AccountDetailButton
              backgroundTransparent
              iconLeft="info-circle"
              style={{ paddingLeft: '8px' }}
              onClick={() => setAccountDetailsOpen(true)}
            >
              Safe metadata
            </AccountDetailButton>
          </AccountDetailsContent>
        }
      >
        <AccountImageStyled
          address={BigNumber.from(firstSafe.address).toString()}
        />
      </AccountDetails>

      <RowDiv>
        <SafeAddress address={firstSafe.address} />
      </RowDiv>
      <DivList ref={ref as any}>
        <ActButton onClick={() => handleClick(0)}>Transactions</ActButton>
        <ActButton onClick={() => handleClick(1)}>Assets</ActButton>
      </DivList>
      <AddTxButton
        disabled
        onClick={async () => {
          try {
            await createRandomTransfer(selectedSafe, state.account);
            alert('Transaction created');
          } catch (error) {
            console.error(error);
          }
        }}
      >
        Add transaction
      </AddTxButton>
    </Wrapper>
  );
};

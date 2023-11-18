import { useContext, useState } from 'react';
import { formatUnits } from 'ethers/lib/utils';
import { Button } from '../Button';
import {
  Wrapper,
  ModalTitle,
  ModalHeaderContainer,
  ButtonsContainer,
} from './ConfirmSafeTxModal.style';
import { confirmSafeTxAA } from '../../utils';
import { Alert } from '../Alert';
import { MetaMaskContext } from '../../hooks';
import { shortenAddress } from '../../utils/utils';

type Props = {
  handleCancel: () => void;
  tx: any;
};

export const ConfirmSafeTxModalView = ({ handleCancel, tx }: Props) => {
  const [state] = useContext(MetaMaskContext);
  const [error, setError] = useState<string>();

  return (
    <Wrapper>
      <ModalHeaderContainer>
        <ModalTitle>Confirm transaction</ModalTitle>
      </ModalHeaderContainer>
      <div>
        <b>To</b>: {tx.to}
      </div>
      <div>
        <b>Value</b>: {formatUnits(tx.value || 0, 18)}
      </div>
      <div>
        <b>Data</b>: {tx.data}
      </div>
      <div>
        <b>Nonce</b>: {tx.nonce}
      </div>
      <div>
        <b>Proposer</b>: {tx.proposer}
      </div>
      <div>
        <b>Tx Type</b>: {tx.txType}
      </div>
      <div>
        <b>Submitted At</b>: {tx.submissionDate}
      </div>
      <div style={{ borderTop: '1px solid black', paddingTop: 12 }}>
        <b>Account</b>:
        <select>
          <option value={state.account}>{state.account}</option>
          {state.derivedEOAs.map((eoa, i) => {
            return (
              <option key={i} value={eoa.origin}>
                [{eoa.type}] {shortenAddress(eoa.origin, 8)}
              </option>
            );
          })}
        </select>
      </div>
      {error && <Alert text={error} variant="error" />}
      <ButtonsContainer>
        <Button onClick={() => handleCancel()}>Cancel</Button>
        <Button
          onClick={async () => {
            try {
              setError('');
              await confirmSafeTxAA(tx.safe, tx.safeTxHash);
            } catch (error) {
              console.error(error);
              setError(error.message);
            }
          }}
        >
          Confirm
        </Button>
      </ButtonsContainer>
    </Wrapper>
  );
};

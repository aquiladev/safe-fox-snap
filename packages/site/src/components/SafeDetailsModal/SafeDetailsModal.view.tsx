import { useContext } from 'react';
import { ThemeContext } from 'styled-components';
import {
  AccountImageDiv,
  AccountImageStyled,
  AddressCopy,
  AddressQrCode,
  ModalWrapper,
  Row,
  Title,
  TitleDiv,
  Wrapper,
} from './SafeDetailsModal.style';

type Props = {
  address: string;
  meta: any;
};

export const SafeDetailsModalView = ({ address, meta }: Props) => {
  const themeContext = useContext(ThemeContext);

  return (
    <ModalWrapper>
      <AccountImageDiv>
        <AccountImageStyled size={64} address={address} />
      </AccountImageDiv>
      <Wrapper>
        {/* <TitleDiv>
          <Title>{accountName}</Title>
        </TitleDiv>
        <AddressQrCode
          value={address}
          bgColor={themeContext.colors.background.default}
          fgColor={themeContext.colors.text.default}
        />
        <AddressCopy address={address} /> */}
        {Object.entries(meta).map(([key, value]) => (
          <Row key={key}>
            <b>{key}</b>: {value}
          </Row>
        ))}
      </Wrapper>
    </ModalWrapper>
  );
};

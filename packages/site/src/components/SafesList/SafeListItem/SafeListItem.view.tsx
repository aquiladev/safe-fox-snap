import { Wrapper, Row } from './SafeListItem.style';
import { ReactComponent as SafeIcon } from '../../../assets/safe.svg';
import { shortenAddress } from '../../../utils/utils';

type Props = {
  account: string;
};

export const SafeListItemView = ({ account }: Props) => {
  return (
    <Wrapper>
      <Row>
        <SafeIcon />
        <span style={{ paddingLeft: 8 }}>{shortenAddress(account)}</span>
      </Row>
    </Wrapper>
  );
};

import { PopperPlacementType } from '@mui/material';
import { shortenAddress } from '../../utils/utils';
import { PopperTooltip } from '../PopperTooltip';
import { Wrapper } from './SafeAddress.style';
import { ReactComponent as SafeIcon } from '../../assets/safe.svg';

type Props = {
  address: string;
  full?: boolean;
  placement?: PopperPlacementType;
};

export const SafeAddressView = ({ address, full, placement }: Props) => {
  const handleAddressClick = () => {
    navigator.clipboard.writeText(address);
  };

  return (
    <>
      <PopperTooltip
        content="Copied!"
        closeTrigger="click"
        placement={placement}
      >
        <PopperTooltip
          content="Copy to clipboard"
          closeTrigger="hover"
          placement={placement}
        >
          <Wrapper
            onClick={handleAddressClick}
            backgroundTransparent
            customIconLeft={<SafeIcon />}
          >
            {full ? address : shortenAddress(address)}
          </Wrapper>
        </PopperTooltip>
      </PopperTooltip>
    </>
  );
};

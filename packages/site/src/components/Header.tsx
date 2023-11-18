import { useContext } from 'react';
import styled, { useTheme } from 'styled-components';

import { FoxActions, MetaMaskContext } from '../hooks';
import { connectSnap, getThemePreference, getSnap } from '../utils';
import { HeaderButtons } from './Buttons';
import { SnapLogo } from './SnapLogo';
import { Toggle } from './Toggle';
import { shortenAddress } from '../utils/utils';
import {
  AccountDetails,
  AccountDetailsContent,
  AccountImageStyled,
} from './SideBar/SideBar.style';
import { BigNumber } from 'ethers';

const HeaderWrapper = styled.header`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 2.4rem;
  border-bottom: 1px solid ${(props) => props.theme.colors.border?.default};
`;

const Title = styled.p`
  font-size: ${(props) => props.theme.fontSizes.title};
  font-weight: bold;
  margin: 0;
  margin-left: 1.2rem;
  ${({ theme }) => theme.mediaQueries.small} {
    display: none;
  }
`;

const LogoWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const RightContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const AccBlock = styled.div`
  padding-right: 10px;
`;

export const Header = ({
  handleToggleClick,
}: {
  handleToggleClick(): void;
}) => {
  const theme = useTheme();
  const [state, dispatch] = useContext(MetaMaskContext);

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
  return (
    <HeaderWrapper>
      <LogoWrapper>
        <SnapLogo color={theme.colors.icon?.default} size={36} />
        <Title>Safe Fox</Title>
      </LogoWrapper>
      <RightContainer>
        {state.account && (
          <AccBlock>
            <AccountDetails
              arrowVisible={false}
              closeTrigger="click"
              offSet={[0, 0]}
              content={
                <AccountDetailsContent>
                  Derived accounts:
                  <hr />
                  {state.derivedEOAs.map((acc) => (
                    <div style={{ textAlign: 'left' }}>
                      <div>
                        [{acc.type}] {shortenAddress(acc.origin, 8)}
                      </div>
                      <div>
                        {'  '} - {acc.address}
                      </div>
                    </div>
                  ))}
                </AccountDetailsContent>
              }
            >
              <AccountImageStyled
                address={BigNumber.from(state.account).toString()}
                size={22}
              />
              <b style={{ paddingTop: 7, paddingBottom: 7 }}>
                {shortenAddress(state.account)}
              </b>
            </AccountDetails>
          </AccBlock>
        )}
        <Toggle
          onToggle={handleToggleClick}
          defaultChecked={getThemePreference()}
        />
        <HeaderButtons state={state} onConnectClick={handleConnectClick} />
      </RightContainer>
    </HeaderWrapper>
  );
};

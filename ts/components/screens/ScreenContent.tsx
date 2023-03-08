import { Content } from "native-base";
import * as React from "react";

import { StyleProp, ViewStyle } from "react-native";
import { ProfileMainScreenContext } from "../../screens/profile/ProfileMainScreen";
import { WalletHomeScreenContext } from "../../screens/wallet/WalletHomeScreen";
import { ComponentProps } from "../../types/react";
import { ScreenContentHeader } from "./ScreenContentHeader";

interface OwnProps {
  hideHeader?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  bounces?: boolean;
  contentRefreshControl?: ComponentProps<Content>["refreshControl"];
  referenceToContentScreen?: (
    c: ScreenContentRoot
  ) => ScreenContentRoot | React.LegacyRef<Content>;
}

export type ScreenContentRoot = {
  _root: ScreenContentFunctions;
};

type ScreenContentFunctions = {
  scrollToPosition: (x: number, y: number) => void;
};

type Props = OwnProps & ComponentProps<typeof ScreenContentHeader>;

/**
 * Wraps a BaseScreenComponent with a title and a subtitle
 */
class ScreenContent extends React.PureComponent<Props> {
  public render() {
    const {
      title,
      icon,
      iconFont,
      subtitle,
      dark,
      hideHeader,
      contentStyle,
      bounces
    } = this.props;

    return (
      <ProfileMainScreenContext.Consumer>
        {ProfileContentRef => (
          <WalletHomeScreenContext.Consumer>
            {walletContentRef => (
              <Content
                ref={c => {
                  walletContentRef.setScreenContentRef(
                    c as unknown as ScreenContentRoot
                  );
                  ProfileContentRef.setScreenContentRef(
                    c as unknown as ScreenContentRoot
                  );
                }}
                noPadded={true}
                style={contentStyle}
                bounces={bounces}
                refreshControl={this.props.contentRefreshControl}
              >
                {!hideHeader && (
                  <ScreenContentHeader
                    icon={icon}
                    iconFont={iconFont}
                    title={title}
                    subtitle={subtitle}
                    dark={dark}
                  />
                )}
                {this.props.children}
              </Content>
            )}
          </WalletHomeScreenContext.Consumer>
        )}
      </ProfileMainScreenContext.Consumer>
    );
  }
}

export default ScreenContent;

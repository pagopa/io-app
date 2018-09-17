import { Option } from "fp-ts/lib/Option";
import {
  Button,
  Content,
  H3,
  Left,
  List,
  ListItem,
  Right,
  Text
} from "native-base";
import * as React from "react";
import { Clipboard, StyleSheet } from "react-native";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";

import TopScreenComponent from "../../components/screens/TopScreenComponent";
import IconFont from "../../components/ui/IconFont";
import I18n from "../../i18n";
import ROUTES from "../../navigation/routes";
import { logoutRequest } from "../../store/actions/authentication";
import { FetchRequestActions } from "../../store/actions/constants";
import { startPinReset } from "../../store/actions/pinset";
import { Dispatch } from "../../store/actions/types";
import {
  isLoggedIn,
  isLoggedInWithSessionInfo
} from "../../store/reducers/authentication";
import { createErrorSelector } from "../../store/reducers/error";
import { createLoadingSelector } from "../../store/reducers/loading";
import { GlobalState } from "../../store/reducers/types";
import variables from "../../theme/variables";

type ReduxMappedStateProps = {
  isLoggingOut: boolean;
  logoutError: Option<string>;
  sessionToken?: string;
  walletToken?: string;
};

type ReduxMappedDispatchProps = {
  resetPin: () => void;
  logout: () => void;
};

type OwnProps = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

type Props = OwnProps & ReduxMappedDispatchProps & ReduxMappedStateProps;

const styles = StyleSheet.create({
  itemLeft: {
    flexDirection: "column",
    alignItems: "flex-start"
  },
  itemLeftText: {
    alignSelf: "flex-start"
  }
});

/**
 * A component to show the main screen of the Profile section
 */
class ProfileMainScreen extends React.PureComponent<Props> {
  public render() {
    const {
      navigation,
      resetPin,
      logout,
      sessionToken,
      walletToken
    } = this.props;
    return (
      <TopScreenComponent
        title={I18n.t("profile.main.screenTitle")}
        icon={require("../../../img/icons/gears.png")}
        subtitle={I18n.t("profile.main.screenSubtitle")}
      >
        <Content noPadded={true}>
          <List>
            {/* Privacy */}
            <ListItem
              first={true}
              onPress={() => navigation.navigate(ROUTES.PROFILE_PRIVACY_MAIN)}
            >
              <Left style={styles.itemLeft}>
                <H3>{I18n.t("profile.main.privacy.title")}</H3>
                <Text style={styles.itemLeftText}>
                  {I18n.t("profile.main.privacy.description")}
                </Text>
              </Left>
              <Right>
                <IconFont
                  name="io-right"
                  color={variables.contentPrimaryBackground}
                />
              </Right>
            </ListItem>

            {/* Terms & conditions */}
            <ListItem
              onPress={() =>
                navigation.navigate(ROUTES.PROFILE_TOS, {
                  isProfile: true
                })
              }
            >
              <Left style={styles.itemLeft}>
                <H3>{I18n.t("profile.main.termsAndConditions.title")}</H3>
                <Text style={styles.itemLeftText}>
                  {I18n.t("profile.main.termsAndConditions.description")}
                </Text>
              </Left>
              <Right>
                <IconFont
                  name="io-right"
                  color={variables.contentPrimaryBackground}
                />
              </Right>
            </ListItem>

            <ListItem itemDivider={true}>
              <Text>{I18n.t("profile.main.accountSectionHeader")}</Text>
            </ListItem>

            {/* Reset PIN */}
            <ListItem onPress={resetPin}>
              <Left style={styles.itemLeft}>
                <H3>{I18n.t("pin_login.pin.reset.button_short")}</H3>
                <Text style={styles.itemLeftText}>
                  {I18n.t("pin_login.pin.reset.tip_short")}
                </Text>
              </Left>
              <Right>
                <IconFont
                  name="io-right"
                  color={variables.contentPrimaryBackground}
                />
              </Right>
            </ListItem>

            {/* Logout/Exit */}
            <ListItem onPress={logout}>
              <Left style={styles.itemLeft}>
                <H3>{I18n.t("profile.main.logout")}</H3>
                <Text style={styles.itemLeftText}>
                  {I18n.t("profile.logout")}
                </Text>
              </Left>
              <Right>
                <IconFont
                  name="io-right"
                  color={variables.contentPrimaryBackground}
                />
              </Right>
            </ListItem>

            <ListItem itemDivider={true}>
              <Text>{I18n.t("profile.main.developersSectionHeader")}</Text>
            </ListItem>

            <ListItem last={true}>
              <Left style={styles.itemLeft}>
                {sessionToken && (
                  <Button
                    transparent={true}
                    info={true}
                    onPress={() => Clipboard.setString(sessionToken)}
                  >
                    <Text>{`Session: ${sessionToken}`}</Text>
                  </Button>
                )}
                {walletToken && (
                  <Button
                    transparent={true}
                    info={true}
                    onPress={() => Clipboard.setString(walletToken)}
                  >
                    <Text>{`Wallet: ${walletToken}`}</Text>
                  </Button>
                )}
              </Left>
            </ListItem>
          </List>
        </Content>
      </TopScreenComponent>
    );
  }
}

const mapStateToProps = (state: GlobalState): ReduxMappedStateProps => ({
  isLoggingOut: createLoadingSelector([FetchRequestActions.LOGOUT])(state),
  logoutError: createErrorSelector([FetchRequestActions.LOGOUT])(state),
  sessionToken: isLoggedIn(state.authentication)
    ? state.authentication.sessionToken
    : undefined,
  walletToken: isLoggedInWithSessionInfo(state.authentication)
    ? state.authentication.sessionInfo.walletToken
    : undefined
});

const mapDispatchToProps = (dispatch: Dispatch): ReduxMappedDispatchProps => ({
  resetPin: () => dispatch(startPinReset),
  logout: () => dispatch(logoutRequest())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProfileMainScreen);

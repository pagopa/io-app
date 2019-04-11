import {
  Button,
  Content,
  H3,
  Left,
  List,
  ListItem,
  Right,
  Switch,
  Text,
  Toast
} from "native-base";
import * as React from "react";
import { Alert, Clipboard, StyleSheet, View } from "react-native";
import DeviceInfo from "react-native-device-info";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";

import TopScreenComponent from "../../components/screens/TopScreenComponent";
import IconFont from "../../components/ui/IconFont";
import I18n from "../../i18n";
import ROUTES from "../../navigation/routes";
import {
  logoutRequest,
  sessionExpired
} from "../../store/actions/authentication";
import { setDebugModeEnabled } from "../../store/actions/debug";
import { startPinReset } from "../../store/actions/pinset";
import { clearCache } from "../../store/actions/profile";
import { Dispatch } from "../../store/actions/types";
import {
  isLoggedIn,
  isLoggedInWithSessionInfo
} from "../../store/reducers/authentication";
import { notificationsInstallationSelector } from "../../store/reducers/notifications/installation";
import { GlobalState } from "../../store/reducers/types";
import variables from "../../theme/variables";

type OwnProps = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

type Props = OwnProps &
  ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const copyToClipboardWithFeedback = (text: string) => {
  Clipboard.setString(text);
  Toast.show({
    text: "Copied to clipboard"
  });
};

const styles = StyleSheet.create({
  itemLeft: {
    flexDirection: "column",
    alignItems: "flex-start"
  },
  itemLeftText: {
    alignSelf: "flex-start"
  },
  debugModeSection: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  }
});

/**
 * A component to show the main screen of the Profile section
 */
class ProfileMainScreen extends React.PureComponent<Props> {
  private handleClearCachePress = () => {
    this.props.clearCache();
    Toast.show({ text: "The cache has been cleared." });
  };

  private confirmResetAlert = () =>
    Alert.alert(
      I18n.t("profile.main.resetPin.confirmTitle"),
      I18n.t("profile.main.resetPin.confirmMsg"),
      [
        {
          text: I18n.t("global.buttons.cancel"),
          style: "cancel"
        },
        {
          text: I18n.t("global.buttons.confirm"),
          style: "destructive",
          onPress: this.props.resetPin
        }
      ],
      { cancelable: false }
    );

  public render() {
    const {
      navigation,
      logout,
      backendInfo,
      sessionToken,
      walletToken,
      notificationToken,
      notificationId
    } = this.props;
    return (
      <TopScreenComponent
        title={I18n.t("profile.main.screenTitle")}
        icon={require("../../../img/icons/gears.png")}
        subtitle={I18n.t("profile.main.screenSubtitle")}
      >
        <Content noPadded={true}>
          <List withContentLateralPadding={true}>
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

            <ListItem itemDivider={true}>
              <Text>{I18n.t("profile.main.accountSectionHeader")}</Text>
            </ListItem>

            {/* Reset PIN */}
            <ListItem onPress={this.confirmResetAlert}>
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

            <ListItem>
              <View style={styles.debugModeSection}>
                <Text>Debug mode</Text>
                <Switch
                  value={this.props.isDebugModeEnabled}
                  onValueChange={this.props.setDebugModeEnabled}
                />
              </View>
            </ListItem>

            {this.props.isDebugModeEnabled && (
              <React.Fragment>
                <ListItem>
                  <Button
                    info={true}
                    small={true}
                    onPress={() =>
                      copyToClipboardWithFeedback(DeviceInfo.getVersion())
                    }
                  >
                    <Text>
                      {`${I18n.t(
                        "profile.main.appVersion"
                      )} ${DeviceInfo.getVersion()}`}
                    </Text>
                  </Button>
                </ListItem>
                {backendInfo && (
                  <ListItem>
                    <Button
                      info={true}
                      small={true}
                      onPress={() =>
                        copyToClipboardWithFeedback(backendInfo.version)
                      }
                    >
                      <Text>
                        {`${I18n.t("profile.main.backendVersion")} ${
                          backendInfo.version
                        }`}
                      </Text>
                    </Button>
                  </ListItem>
                )}
                {sessionToken && (
                  <ListItem>
                    <Button
                      info={true}
                      small={true}
                      onPress={() => copyToClipboardWithFeedback(sessionToken)}
                    >
                      <Text
                        ellipsizeMode="tail"
                        numberOfLines={1}
                      >{`Session Token ${sessionToken.slice(0, 6)}`}</Text>
                    </Button>
                  </ListItem>
                )}
                {walletToken && (
                  <ListItem>
                    <Button
                      info={true}
                      small={true}
                      onPress={() => copyToClipboardWithFeedback(walletToken)}
                    >
                      <Text
                        ellipsizeMode="tail"
                        numberOfLines={1}
                      >{`Wallet token ${walletToken.slice(0, 6)}`}</Text>
                    </Button>
                  </ListItem>
                )}

                <ListItem>
                  <Button
                    info={true}
                    small={true}
                    onPress={() => copyToClipboardWithFeedback(notificationId)}
                  >
                    <Text>{`Notification ID ${notificationId.slice(
                      0,
                      6
                    )}`}</Text>
                  </Button>
                </ListItem>

                {notificationToken && (
                  <ListItem>
                    <Button
                      info={true}
                      small={true}
                      onPress={() =>
                        copyToClipboardWithFeedback(notificationToken)
                      }
                    >
                      <Text>{`Notification token ${notificationToken.slice(
                        0,
                        6
                      )}`}</Text>
                    </Button>
                  </ListItem>
                )}

                <ListItem>
                  <Button
                    danger={true}
                    small={true}
                    onPress={this.handleClearCachePress}
                  >
                    <Text>Clear cache</Text>
                  </Button>
                </ListItem>

                <ListItem>
                  <Button
                    danger={true}
                    small={true}
                    onPress={this.props.dispatchSessionExpired}
                  >
                    <Text>{I18n.t("profile.main.forgetCurrentSession")}</Text>
                  </Button>
                </ListItem>
              </React.Fragment>
            )}
          </List>
        </Content>
      </TopScreenComponent>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  backendInfo: state.backendInfo.serverInfo,
  sessionToken: isLoggedIn(state.authentication)
    ? state.authentication.sessionToken
    : undefined,
  walletToken: isLoggedInWithSessionInfo(state.authentication)
    ? state.authentication.sessionInfo.walletToken
    : undefined,
  notificationId: notificationsInstallationSelector(state).id,
  notificationToken: notificationsInstallationSelector(state).token,
  isDebugModeEnabled: state.debug.isDebugModeEnabled
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  resetPin: () => dispatch(startPinReset()),
  logout: () => dispatch(logoutRequest()),
  clearCache: () => dispatch(clearCache()),
  setDebugModeEnabled: (enabled: boolean) =>
    dispatch(setDebugModeEnabled(enabled)),
  dispatchSessionExpired: () => dispatch(sessionExpired())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProfileMainScreen);

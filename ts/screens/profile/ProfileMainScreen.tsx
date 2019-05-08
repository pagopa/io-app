import {
  Button,
  H1,
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
import { Alert, Platform, ScrollView, StyleSheet, View } from "react-native";
import DeviceInfo from "react-native-device-info";
import {
  NavigationEvents,
  NavigationScreenProp,
  NavigationState
} from "react-navigation";
import { connect } from "react-redux";

import ExperimentalFeaturesBanner from "../../components/ExperimentalFeaturesBanner";
import { withLightModalContext } from "../../components/helpers/withLightModalContext";
import TopScreenComponent from "../../components/screens/TopScreenComponent";
import SelectLogoutOption from "../../components/SelectLogoutOption";
import IconFont from "../../components/ui/IconFont";
import { LightModalContextInterface } from "../../components/ui/LightModal";
import I18n from "../../i18n";
import ROUTES from "../../navigation/routes";
import {
  LogoutOption,
  logoutRequest,
  sessionExpired
} from "../../store/actions/authentication";
import { setDebugModeEnabled } from "../../store/actions/debug";
import { preferencesExperimentalFeaturesSetEnabled } from "../../store/actions/persistedPreferences";
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
import { clipboardSetStringWithFeedback } from "../../utils/clipboard";

type OwnProps = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

type Props = OwnProps &
  LightModalContextInterface &
  ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const styles = StyleSheet.create({
  itemLeft: {
    flexDirection: "column",
    alignItems: "flex-start"
  },
  itemLeftText: {
    alignSelf: "flex-start"
  },
  experimentalFeaturesSection: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  debugModeSection: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  modalHeader: {
    marginBottom: 25
  }
});

const getAppLongVersion = () => {
  const buildNumber =
    Platform.OS === "ios" ? ` (${DeviceInfo.getBuildNumber()})` : "";
  return `${DeviceInfo.getVersion()}${buildNumber}`;
};

/**
 * A component to show the main screen of the Profile section
 */
class ProfileMainScreen extends React.PureComponent<Props> {
  private handleClearCachePress = () => {
    this.props.clearCache();
    Toast.show({ text: "The cache has been cleared." });
  };

  private logout = (logoutOption: LogoutOption) => {
    this.props.logout(logoutOption);

    this.props.hideModal();
  };

  private onLogoutPress = () => {
    // Show a modal to let the user select a calendar
    this.props.showModal(
      <SelectLogoutOption
        onCancel={this.props.hideModal}
        onOptionSelected={this.logout}
        header={
          <H1 style={styles.modalHeader}>
            {I18n.t("profile.logout.cta.header")}
          </H1>
        }
      />
    );
  };

  private onExperimentalFeaturesToggle = (enabled: boolean) => {
    if (enabled) {
      Alert.alert(
        I18n.t("profile.main.experimentalFeatures.confirmTitle"),
        I18n.t("profile.main.experimentalFeatures.confirmMessage"),
        [
          {
            text: I18n.t("global.buttons.cancel"),
            style: "cancel"
          },
          {
            text: I18n.t("global.buttons.ok"),
            style: "destructive",
            onPress: () => {
              this.props.dispatchPreferencesExperimentalFeaturesSetEnabled(
                enabled
              );
            }
          }
        ],
        { cancelable: false }
      );
    } else {
      this.props.dispatchPreferencesExperimentalFeaturesSetEnabled(enabled);
    }
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

  private ServiceListRef = React.createRef<ScrollView>();
  private scrollToTop = () => {
    if (this.ServiceListRef.current) {
      this.ServiceListRef.current.scrollTo({ x: 0, y: 0, animated: false });
    }
  };

  // tslint:disable-next-line: no-big-function
  public render() {
    const {
      navigation,
      backendInfo,
      sessionToken,
      walletToken,
      notificationToken,
      notificationId,
      isExperimentalFeaturesEnabled
    } = this.props;
    return (
      <TopScreenComponent
        title={I18n.t("profile.main.screenTitle")}
        icon={require("../../../img/icons/gears.png")}
        subtitle={I18n.t("profile.main.screenSubtitle")}
        banner={
          isExperimentalFeaturesEnabled ? ExperimentalFeaturesBanner : undefined
        }
      >
        <ScrollView ref={this.ServiceListRef}>
          <NavigationEvents onWillFocus={this.scrollToTop} />
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
            <ListItem onPress={this.onLogoutPress}>
              <Left style={styles.itemLeft}>
                <H3>{I18n.t("profile.main.logout")}</H3>
                <Text style={styles.itemLeftText}>
                  {I18n.t("profile.logout.menulabel")}
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
              <View style={styles.experimentalFeaturesSection}>
                <Text>
                  {I18n.t("profile.main.experimentalFeatures.confirmTitle")}
                </Text>
                <Switch
                  value={this.props.isExperimentalFeaturesEnabled}
                  onValueChange={this.onExperimentalFeaturesToggle}
                />
              </View>
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
                      clipboardSetStringWithFeedback(getAppLongVersion())
                    }
                  >
                    <Text>
                      {`${I18n.t(
                        "profile.main.appVersion"
                      )} ${getAppLongVersion()}`}
                    </Text>
                  </Button>
                </ListItem>
                {backendInfo && (
                  <ListItem>
                    <Button
                      info={true}
                      small={true}
                      onPress={() =>
                        clipboardSetStringWithFeedback(backendInfo.version)
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
                      onPress={() =>
                        clipboardSetStringWithFeedback(sessionToken)
                      }
                    >
                      <Text ellipsizeMode="tail" numberOfLines={1}>
                        {`Session Token ${sessionToken}`}
                      </Text>
                    </Button>
                  </ListItem>
                )}
                {walletToken && (
                  <ListItem>
                    <Button
                      info={true}
                      small={true}
                      onPress={() =>
                        clipboardSetStringWithFeedback(walletToken)
                      }
                    >
                      <Text ellipsizeMode="tail" numberOfLines={1}>
                        {`Wallet token ${walletToken}`}
                      </Text>
                    </Button>
                  </ListItem>
                )}

                <ListItem>
                  <Button
                    info={true}
                    small={true}
                    onPress={() =>
                      clipboardSetStringWithFeedback(notificationId)
                    }
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
                        clipboardSetStringWithFeedback(notificationToken)
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
        </ScrollView>
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
  isDebugModeEnabled: state.debug.isDebugModeEnabled,
  isExperimentalFeaturesEnabled:
    state.persistedPreferences.isExperimentalFeaturesEnabled
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  resetPin: () => dispatch(startPinReset()),
  logout: (logoutOption: LogoutOption) => dispatch(logoutRequest(logoutOption)),
  clearCache: () => dispatch(clearCache()),
  setDebugModeEnabled: (enabled: boolean) =>
    dispatch(setDebugModeEnabled(enabled)),
  dispatchSessionExpired: () => dispatch(sessionExpired()),
  dispatchPreferencesExperimentalFeaturesSetEnabled: (enabled: boolean) =>
    dispatch(preferencesExperimentalFeaturesSetEnabled(enabled))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withLightModalContext(ProfileMainScreen));

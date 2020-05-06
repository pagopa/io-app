/**
 * A component to show the main screen of the Profile section
 */
import { Millisecond } from "italia-ts-commons/lib/units";
import { H3, List, ListItem, Text, Toast, View } from "native-base";
import * as React from "react";
import { Alert, Platform, ScrollView, StyleSheet } from "react-native";
import DeviceInfo from "react-native-device-info";
import {
  NavigationEvents,
  NavigationEventSubscription,
  NavigationScreenProp,
  NavigationState
} from "react-navigation";
import { connect } from "react-redux";
import { TranslationKeys } from "../../../locales/locales";
import ButtonDefaultOpacity from "../../components/ButtonDefaultOpacity";
import { ContextualHelp } from "../../components/ContextualHelp";
import FiscalCodeComponent from "../../components/FiscalCodeComponent";
import { withLightModalContext } from "../../components/helpers/withLightModalContext";
import { ContextualHelpPropsMarkdown } from "../../components/screens/BaseScreenComponent";
import DarkLayout from "../../components/screens/DarkLayout";
import { EdgeBorderComponent } from "../../components/screens/EdgeBorderComponent";
import ListItemComponent from "../../components/screens/ListItemComponent";
import SectionHeaderComponent from "../../components/screens/SectionHeaderComponent";
import SelectLogoutOption from "../../components/SelectLogoutOption";
import TouchableDefaultOpacity from "../../components/TouchableDefaultOpacity";
import { AlertModal } from "../../components/ui/AlertModal";
import IconFont from "../../components/ui/IconFont";
import { LightModalContextInterface } from "../../components/ui/LightModal";
import Markdown from "../../components/ui/Markdown";
import Switch from "../../components/ui/Switch";
import I18n from "../../i18n";
import ROUTES from "../../navigation/routes";
import { sessionExpired } from "../../store/actions/authentication";
import { setDebugModeEnabled } from "../../store/actions/debug";
import {
  preferencesExperimentalFeaturesSetEnabled,
  preferencesPagoPaTestEnvironmentSetEnabled
} from "../../store/actions/persistedPreferences";
import { startPinReset } from "../../store/actions/pinset";
import { clearCache } from "../../store/actions/profile";
import { Dispatch } from "../../store/actions/types";
import {
  isLoggedIn,
  isLoggedInWithSessionInfo
} from "../../store/reducers/authentication";
import { isDebugModeEnabledSelector } from "../../store/reducers/debug";
import { notificationsInstallationSelector } from "../../store/reducers/notifications/installation";
import { isPagoPATestEnabledSelector } from "../../store/reducers/persistedPreferences";
import { GlobalState } from "../../store/reducers/types";
import customVariables from "../../theme/variables";
import { clipboardSetStringWithFeedback } from "../../utils/clipboard";
import { isDevEnv } from "../../utils/environment";
import { setStatusBarColorAndBackground } from "../../utils/statusBar";

type OwnProps = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

type Props = OwnProps &
  LightModalContextInterface &
  ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

type State = {
  tapsOnAppVersion: number;
};

const styles = StyleSheet.create({
  itemLeft: {
    flexDirection: "column",
    alignItems: "flex-start"
  },
  itemLeftText: {
    alignSelf: "flex-start"
  },
  developerSectionItem: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  developerSectionItemLeft: {
    flex: 1
  },
  developerSectionItemRight: {
    flex: 0
  },
  modalHeader: {
    lineHeight: 40
  },
  whiteBg: {
    backgroundColor: customVariables.colorWhite
  },

  noRightPadding: {
    paddingRight: 0
  }
});

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "profile.main.contextualHelpTitle",
  body: "profile.main.contextualHelpContent"
};

const consecutiveTapRequired = 4;
const RESET_COUNTER_TIMEOUT = 2000 as Millisecond;

const getAppLongVersion = () => {
  const buildNumber =
    Platform.OS === "ios" ? ` (${DeviceInfo.getBuildNumber()})` : "";
  return `${DeviceInfo.getVersion()}${buildNumber}`;
};

class ProfileMainScreen extends React.PureComponent<Props, State> {
  private navListener?: NavigationEventSubscription;

  constructor(props: Props) {
    super(props);
    this.state = {
      tapsOnAppVersion: 0
    };
    this.handleClearCachePress = this.handleClearCachePress.bind(this);
  }

  public componentDidMount() {
    this.navListener = this.props.navigation.addListener("didFocus", () => {
      setStatusBarColorAndBackground(
        "light-content",
        customVariables.brandDarkGray
      );
    }); // tslint:disable-line no-object-mutation
  }

  public componentWillUnmount() {
    if (this.navListener) {
      this.navListener.remove();
    }
    // This ensures modals will be closed (if there are some opened)
    this.props.hideModal();
    if (this.idResetTap) {
      clearInterval(this.idResetTap);
    }
  }

  private handleClearCachePress() {
    Alert.alert(
      I18n.t("profile.main.cache.alert"),
      undefined,
      [
        {
          text: I18n.t("global.buttons.cancel"),
          style: "cancel"
        },
        {
          text: I18n.t("global.buttons.confirm"),
          style: "destructive",
          onPress: () => {
            this.props.clearCache();
            Toast.show({ text: I18n.t("profile.main.cache.cleared") });
          }
        }
      ],
      { cancelable: false }
    );
  }

  private developerListItem(
    title: string,
    switchValue: boolean,
    onSwitchValueChange: (value: boolean) => void,
    description?: string
  ) {
    return (
      <ListItem style={styles.noRightPadding}>
        <View style={styles.developerSectionItem}>
          <View style={styles.developerSectionItemLeft}>
            <Text style={styles.itemLeftText}>{title}</Text>

            <Text style={styles.itemLeftText}>{description}</Text>
          </View>
          <View style={styles.developerSectionItemRight}>
            <Switch value={switchValue} onValueChange={onSwitchValueChange} />
          </View>
        </View>
      </ListItem>
    );
  }

  private debugListItem(title: string, onPress: () => void, isDanger: boolean) {
    return (
      <ListItem style={styles.noRightPadding}>
        <ButtonDefaultOpacity
          primary={true}
          danger={isDanger}
          small={true}
          onPress={onPress}
        >
          <Text numberOfLines={1}>{title}</Text>
        </ButtonDefaultOpacity>
      </ListItem>
    );
  }

  private onLogoutPress = () => {
    // Show a modal to let the user select a calendar
    this.props.showModal(
      <SelectLogoutOption
        onCancel={this.props.hideModal}
        header={
          <View>
            <H3 style={styles.modalHeader}>
              {I18n.t("profile.logout.cta.header")}
            </H3>
            <View spacer={true} large={true} />
          </View>
        }
      />
    );
  };

  private showModal() {
    this.props.showModal(
      <AlertModal
        message={I18n.t("profile.main.pagoPaEnvironment.alertMessage")}
      />
    );
  }

  private onPagoPAEnvironmentToggle = (enabled: boolean) => {
    if (enabled) {
      Alert.alert(
        I18n.t("profile.main.pagoPaEnvironment.alertConfirmTitle"),
        I18n.t("profile.main.pagoPaEnvironment.alertConfirmMessage"),
        [
          {
            text: I18n.t("global.buttons.cancel"),
            style: "cancel"
          },
          {
            text: I18n.t("global.buttons.confirm"),
            style: "destructive",
            onPress: () => {
              this.props.setPagoPATestEnabled(enabled);
              this.showModal();
            }
          }
        ],
        { cancelable: false }
      );
    } else {
      this.props.setPagoPATestEnabled(enabled);
      this.showModal();
    }
  };

  private idResetTap?: number;

  // When tapped 5 time activate the debug mode of the application.
  // If more than two seconds pass between taps, the counter is reset
  private onTapAppVersion = () => {
    if (this.idResetTap) {
      clearInterval(this.idResetTap);
    }
    // do nothing
    if (this.props.isDebugModeEnabled || isDevEnv) {
      return;
    }
    if (this.state.tapsOnAppVersion === consecutiveTapRequired) {
      this.props.setDebugModeEnabled(true);
      this.setState({ tapsOnAppVersion: 0 });
      Toast.show({ text: I18n.t("profile.main.developerModeOn") });
    } else {
      // tslint:disable-next-line: no-object-mutation
      this.idResetTap = setInterval(
        this.resetAppTapCounter,
        RESET_COUNTER_TIMEOUT
      );
      const tapsOnAppVersion = this.state.tapsOnAppVersion + 1;
      this.setState({
        tapsOnAppVersion
      });
    }
  };

  private resetAppTapCounter = () => {
    this.setState({ tapsOnAppVersion: 0 });
    clearInterval(this.idResetTap);
  };

  /**
   * since no experimental features are available we hide this method (see https://www.pivotaltracker.com/story/show/168263994).
   * It could be usefull when new experimental features will be available
   */
  /*
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
  */

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
      notificationId
    } = this.props;

    const showInformationModal = (
      title: TranslationKeys,
      body: TranslationKeys
    ) => {
      this.props.showModal(
        <ContextualHelp
          onClose={this.props.hideModal}
          title={I18n.t(title)}
          body={() => <Markdown>{I18n.t(body)}</Markdown>}
        />
      );
    };

    // tslint:disable no-big-function
    const screenContent = () => {
      return (
        <ScrollView ref={this.ServiceListRef} style={styles.whiteBg}>
          <NavigationEvents onWillFocus={this.scrollToTop} />
          <View spacer={true} />
          <List withContentLateralPadding={true}>
            {/* Preferences */}
            <ListItemComponent
              title={I18n.t("profile.main.preferences.title")}
              subTitle={I18n.t("profile.main.preferences.description")}
              onPress={() =>
                navigation.navigate(ROUTES.PROFILE_PREFERENCES_HOME)
              }
              isFirstItem={true}
            />

            {/* Privacy */}
            <ListItemComponent
              title={I18n.t("profile.main.privacy.title")}
              subTitle={I18n.t("profile.main.privacy.description")}
              onPress={() => navigation.navigate(ROUTES.PROFILE_PRIVACY_MAIN)}
            />

            {/* APP IO */}
            <ListItemComponent
              title={I18n.t("profile.main.appInfo.title")}
              subTitle={I18n.t("profile.main.appInfo.description")}
              onPress={() =>
                showInformationModal(
                  "profile.main.appInfo.title",
                  "profile.main.appInfo.contextualHelpContent"
                )
              }
              isLastItem={true}
            />

            <SectionHeaderComponent
              sectionHeader={I18n.t("profile.main.accountSectionHeader")}
            />

            {/* Reset unlock code */}
            <ListItemComponent
              title={I18n.t("pin_login.pin.reset.button_short")}
              subTitle={I18n.t("pin_login.pin.reset.tip_short")}
              onPress={this.confirmResetAlert}
            />

            {/* Logout/Exit */}
            <ListItemComponent
              title={I18n.t("profile.main.logout")}
              subTitle={I18n.t("profile.logout.menulabel")}
              onPress={this.onLogoutPress}
              isLastItem={true}
            />

            {this.debugListItem(
              `${I18n.t("profile.main.appVersion")} ${getAppLongVersion()}`,
              this.onTapAppVersion,
              false
            )}

            {/* Developers Section */}
            {(this.props.isDebugModeEnabled || isDevEnv) && (
              <React.Fragment>
                <SectionHeaderComponent
                  sectionHeader={I18n.t("profile.main.developersSectionHeader")}
                />

                {
                  // since no experimental features are available we avoid to render this item (see https://www.pivotaltracker.com/story/show/168263994).
                  // It could be useful when new experimental features will be available
                  /*
                  this.developerListItem(
                  I18n.t("profile.main.experimentalFeatures.confirmTitle"),
                  this.props.isExperimentalFeaturesEnabled,
                  this.onExperimentalFeaturesToggle
                )*/
                }
                {this.developerListItem(
                  I18n.t("profile.main.pagoPaEnvironment.pagoPaEnv"),
                  this.props.isPagoPATestEnabled,
                  this.onPagoPAEnvironmentToggle,
                  I18n.t("profile.main.pagoPaEnvironment.pagoPAEnvAlert")
                )}
                {this.developerListItem(
                  I18n.t("profile.main.debugMode"),
                  this.props.isDebugModeEnabled,
                  this.props.setDebugModeEnabled
                )}
                {this.props.isDebugModeEnabled && (
                  <React.Fragment>
                    {backendInfo &&
                      this.debugListItem(
                        `${I18n.t("profile.main.backendVersion")} ${
                          backendInfo.version
                        }`,
                        () =>
                          clipboardSetStringWithFeedback(backendInfo.version),
                        false
                      )}
                    {sessionToken &&
                      this.debugListItem(
                        `Session Token ${sessionToken}`,
                        () => clipboardSetStringWithFeedback(sessionToken),
                        false
                      )}

                    {walletToken &&
                      this.debugListItem(
                        `Wallet token ${walletToken}`,
                        () => clipboardSetStringWithFeedback(walletToken),
                        false
                      )}

                    {this.debugListItem(
                      `Notification ID ${notificationId.slice(0, 6)}`,
                      () => clipboardSetStringWithFeedback(notificationId),
                      false
                    )}

                    {notificationToken &&
                      this.debugListItem(
                        `Notification token ${notificationToken.slice(0, 6)}`,
                        () => clipboardSetStringWithFeedback(notificationToken),
                        false
                      )}

                    {this.debugListItem(
                      I18n.t("profile.main.cache.clear"),
                      this.handleClearCachePress,
                      true
                    )}

                    {this.debugListItem(
                      I18n.t("profile.main.forgetCurrentSession"),
                      this.props.dispatchSessionExpired,
                      true
                    )}
                  </React.Fragment>
                )}
              </React.Fragment>
            )}

            {/* end list */}
            <EdgeBorderComponent />
          </List>
        </ScrollView>
      );
    };

    return (
      <DarkLayout
        allowGoBack={false}
        bounces={false}
        headerBody={<IconFont name="io-logo" color={"white"} />}
        title={I18n.t("profile.main.title")}
        icon={require("../../../img/icons/profile-illustration.png")}
        topContent={
          <TouchableDefaultOpacity
            onPress={() =>
              this.props.navigation.navigate(ROUTES.PROFILE_FISCAL_CODE)
            }
          >
            <FiscalCodeComponent type={"Preview"} />
          </TouchableDefaultOpacity>
        }
        contextualHelpMarkdown={contextualHelpMarkdown}
        faqCategories={["profile"]}
      >
        {screenContent()}
      </DarkLayout>
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
  isDebugModeEnabled: isDebugModeEnabledSelector(state),
  isPagoPATestEnabled: isPagoPATestEnabledSelector(state),
  isExperimentalFeaturesEnabled:
    state.persistedPreferences.isExperimentalFeaturesEnabled
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  resetPin: () => dispatch(startPinReset()),
  clearCache: () => dispatch(clearCache()),
  setDebugModeEnabled: (enabled: boolean) =>
    dispatch(setDebugModeEnabled(enabled)),
  dispatchSessionExpired: () => dispatch(sessionExpired()),
  setPagoPATestEnabled: (isPagoPATestEnabled: boolean) =>
    dispatch(
      preferencesPagoPaTestEnvironmentSetEnabled({ isPagoPATestEnabled })
    ),
  dispatchPreferencesExperimentalFeaturesSetEnabled: (enabled: boolean) =>
    dispatch(preferencesExperimentalFeaturesSetEnabled(enabled))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withLightModalContext(ProfileMainScreen));

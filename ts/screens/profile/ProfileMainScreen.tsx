import { Millisecond } from "@pagopa/ts-commons/lib/units";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { List, Toast } from "native-base";
import * as React from "react";
import { View, Alert, ScrollView } from "react-native";
import { connect } from "react-redux";
import { TranslationKeys } from "../../../locales/locales";
import ContextualInfo from "../../components/ContextualInfo";
import { VSpacer } from "../../components/core/spacer/Spacer";
import { IOStyles } from "../../components/core/variables/IOStyles";
import FiscalCodeComponent from "../../components/FiscalCodeComponent";
import { withLightModalContext } from "../../components/helpers/withLightModalContext";
import {
  TabBarItemPressType,
  withUseTabItemPressWhenScreenActive
} from "../../components/helpers/withUseTabItemPressWhenScreenActive";
import { ContextualHelpPropsMarkdown } from "../../components/screens/BaseScreenComponent";
import DarkLayout from "../../components/screens/DarkLayout";
import { EdgeBorderComponent } from "../../components/screens/EdgeBorderComponent";
import ListItemComponent from "../../components/screens/ListItemComponent";
import { ScreenContentRoot } from "../../components/screens/ScreenContent";
import SectionHeaderComponent from "../../components/screens/SectionHeaderComponent";
import TouchableDefaultOpacity from "../../components/TouchableDefaultOpacity";
import { AlertModal } from "../../components/ui/AlertModal";
import { LightModalContextInterface } from "../../components/ui/LightModal";
import Markdown from "../../components/ui/Markdown";
import { isPlaygroundsEnabled } from "../../config";
import { lollipopPublicKeySelector } from "../../features/lollipop/store/reducers/lollipop";
import I18n from "../../i18n";
import { IOStackNavigationRouteProps } from "../../navigation/params/AppParamsList";
import { MainTabParamsList } from "../../navigation/params/MainTabParamsList";
import ROUTES from "../../navigation/routes";
import { sessionExpired } from "../../store/actions/authentication";
import { setDebugModeEnabled } from "../../store/actions/debug";
import { navigateToLogout } from "../../store/actions/navigation";
import {
  preferencesIdPayTestSetEnabled,
  preferencesPagoPaTestEnvironmentSetEnabled,
  preferencesPnTestEnvironmentSetEnabled,
  preferencesDesignSystemSetEnabled
} from "../../store/actions/persistedPreferences";
import { clearCache } from "../../store/actions/profile";
import { Dispatch } from "../../store/actions/types";
import {
  isLoggedIn,
  isLoggedInWithSessionInfo
} from "../../store/reducers/authentication";
import { isDebugModeEnabledSelector } from "../../store/reducers/debug";
import { notificationsInstallationSelector } from "../../store/reducers/notifications/installation";
import {
  isIdPayTestEnabledSelector,
  isDesignSystemEnabledSelector,
  isPagoPATestEnabledSelector,
  isPnTestEnabledSelector
} from "../../store/reducers/persistedPreferences";
import { GlobalState } from "../../store/reducers/types";
import { clipboardSetStringWithFeedback } from "../../utils/clipboard";
import { getDeviceId } from "../../utils/device";
import { isDevEnv } from "../../utils/environment";
import { toThumbprint } from "../../features/lollipop/utils/crypto";
import ListItemNav from "../../components/ui/ListItemNav";
import { Divider } from "../../components/core/Divider";
import ListItemInfoCopy from "../../components/ui/ListItemInfoCopy";
import ButtonSolid from "../../components/ui/ButtonSolid";
import { SwitchListItem } from "../../components/ui/SwitchListItem";
import AppVersion from "../../components/AppVersion";

type Props = IOStackNavigationRouteProps<MainTabParamsList, "PROFILE_MAIN"> &
  LightModalContextInterface &
  ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  TabBarItemPressType;

type State = {
  tapsOnAppVersion: number;
};

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "profile.main.contextualHelpTitle",
  body: "profile.main.contextualHelpContent"
};

const consecutiveTapRequired = 4;
const RESET_COUNTER_TIMEOUT = 2000 as Millisecond;

/**
 * A screen to show all the options related to the user profile
 */
class ProfileMainScreen extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      tapsOnAppVersion: 0
    };
    this.handleClearCachePress = this.handleClearCachePress.bind(this);
  }

  public componentWillUnmount() {
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
      <SwitchListItem
        label={title}
        description={description}
        value={switchValue}
        onSwitchValueChange={onSwitchValueChange}
      />
    );
  }

  private debugCopyListItem(label: string, value: string, onPress: () => void) {
    return (
      <>
        <ListItemInfoCopy
          label={label}
          value={value}
          onPress={onPress}
          accessibilityLabel={value}
          numberOfLines={5}
        />
        <Divider />
      </>
    );
  }

  private debugListItem(title: string, onPress: () => void, isDanger: boolean) {
    return (
      <View style={{ paddingVertical: 8 }}>
        {isDanger ? (
          <ButtonSolid
            color="danger"
            label={title}
            onPress={onPress}
            accessibilityLabel={title}
          />
        ) : (
          <ButtonSolid
            color="primary"
            label={title}
            onPress={onPress}
            accessibilityLabel={title}
          />
        )}
      </View>
    );
  }

  private onLogoutPress = () => {
    Alert.alert(
      I18n.t("profile.logout.alertTitle"),
      I18n.t("profile.logout.alertMessage"),
      [
        {
          text: I18n.t("global.buttons.cancel")
        },
        {
          text: I18n.t("profile.logout.exit"),
          onPress: this.props.logout
        }
      ],
      { cancelable: true }
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

  private onPnEnvironmentToggle = (enabled: boolean) => {
    this.props.setPnTestEnabled(enabled);
  };

  private onIdPayTestToggle = (enabled: boolean) => {
    this.props.setIdPayTestEnabled(enabled);
    this.showModal();
  };

  private onDesignSystemToggle = (enabled: boolean) => {
    this.props.setDesignSystemEnabled(enabled);
  };

  private idResetTap?: number;

  // When tapped 5 times activate the debug mode of the application.
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
      // eslint-disable-next-line functional/immutable-data
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

  private renderDeveloperSection() {
    const {
      dispatchSessionExpired,
      isDebugModeEnabled,
      isPagoPATestEnabled,
      isPnTestEnabled,
      isDesignSystemEnabled,
      navigation,
      notificationId,
      notificationToken,
      sessionToken,
      walletToken,
      setDebugModeEnabled,
      isIdPayTestEnabled,
      publicKey
    } = this.props;
    const deviceUniqueId = getDeviceId();
    const thumbprint = toThumbprint(publicKey);

    return (
      <React.Fragment>
        <SectionHeaderComponent
          sectionHeader={I18n.t("profile.main.developersSectionHeader")}
          style={{ borderBottomWidth: 0 }}
        />
        {isPlaygroundsEnabled && (
          <>
            <ListItemNav
              value={"Lollipop Playground"}
              accessibilityLabel={"Lollipop Playground"}
              onPress={() =>
                navigation.navigate(ROUTES.PROFILE_NAVIGATOR, {
                  screen: ROUTES.LOLLIPOP_PLAYGROUND
                })
              }
            />
            {/* We should use FlatList or FlashList to manage
            automatically the <Divider /> component */}
            <Divider />
            <ListItemNav
              value={"MyPortal Web Playground"}
              accessibilityLabel={"MyPortal Web Playground"}
              onPress={() =>
                navigation.navigate(ROUTES.PROFILE_NAVIGATOR, {
                  screen: ROUTES.WEB_PLAYGROUND
                })
              }
            />
            <Divider />
            <ListItemNav
              value={"Markdown Playground"}
              accessibilityLabel={"Markdown Playground"}
              onPress={() =>
                navigation.navigate(ROUTES.PROFILE_NAVIGATOR, {
                  screen: ROUTES.MARKDOWN_PLAYGROUND
                })
              }
            />
            <Divider />
            <ListItemNav
              value={"CGN LandingPage Playground"}
              accessibilityLabel="CGN LandingPage Playground"
              onPress={() =>
                navigation.navigate(ROUTES.PROFILE_NAVIGATOR, {
                  screen: ROUTES.CGN_LANDING_PLAYGROUND
                })
              }
            />
            {isIdPayTestEnabled && (
              <>
                <Divider />
                <ListItemNav
                  value={"IDPay Playground"}
                  accessibilityLabel="IDPay Playground"
                  onPress={() =>
                    navigation.navigate(ROUTES.PROFILE_NAVIGATOR, {
                      screen: ROUTES.IDPAY_ONBOARDING_PLAYGROUND
                    })
                  }
                />
              </>
            )}
          </>
        )}
        <Divider />
        {/* Design System */}
        <ListItemNav
          value={I18n.t("profile.main.designSystem")}
          accessibilityLabel={I18n.t("profile.main.designSystem")}
          onPress={() =>
            navigation.navigate(ROUTES.PROFILE_NAVIGATOR, {
              screen: ROUTES.DESIGN_SYSTEM
            })
          }
        />
        <Divider />
        {this.developerListItem(
          I18n.t("profile.main.pagoPaEnvironment.pagoPaEnv"),
          isPagoPATestEnabled,
          this.onPagoPAEnvironmentToggle,
          I18n.t("profile.main.pagoPaEnvironment.pagoPAEnvAlert")
        )}
        <Divider />
        {this.developerListItem(
          I18n.t("profile.main.pnEnvironment.pnEnv"),
          isPnTestEnabled,
          this.onPnEnvironmentToggle
        )}
        <Divider />
        {this.developerListItem(
          I18n.t("profile.main.debugMode"),
          isDebugModeEnabled,
          setDebugModeEnabled
        )}
        <Divider />
        {this.developerListItem(
          I18n.t("profile.main.idpay.idpayTest"),
          isIdPayTestEnabled,
          this.onIdPayTestToggle,
          I18n.t("profile.main.idpay.idpayTestAlert")
        )}
        <Divider />
        {this.developerListItem(
          I18n.t("profile.main.designSystemEnvironment"),
          isDesignSystemEnabled,
          this.onDesignSystemToggle
        )}
        <Divider />
        {isDebugModeEnabled && (
          <React.Fragment>
            {isDevEnv &&
              sessionToken &&
              this.debugCopyListItem("Session token", sessionToken, () =>
                clipboardSetStringWithFeedback(sessionToken)
              )}

            {isDevEnv &&
              walletToken &&
              this.debugCopyListItem("Wallet token", walletToken, () =>
                clipboardSetStringWithFeedback(walletToken)
              )}

            {isDevEnv &&
              this.debugCopyListItem("Notification ID", notificationId, () =>
                clipboardSetStringWithFeedback(notificationId)
              )}

            {isDevEnv &&
              notificationToken &&
              this.debugCopyListItem(
                "Notification token",
                notificationToken,
                () => clipboardSetStringWithFeedback(notificationToken)
              )}

            {this.debugCopyListItem("Device unique ID", deviceUniqueId, () =>
              clipboardSetStringWithFeedback(deviceUniqueId)
            )}

            {thumbprint &&
              this.debugCopyListItem("Thumbprint", thumbprint, () =>
                clipboardSetStringWithFeedback(thumbprint)
              )}

            <VSpacer size={16} />

            {this.debugListItem(
              I18n.t("profile.main.cache.clear"),
              this.handleClearCachePress,
              true
            )}

            {isDevEnv &&
              this.debugListItem(
                I18n.t("profile.main.forgetCurrentSession"),
                dispatchSessionExpired,
                true
              )}
            {isDevEnv &&
              this.debugListItem(
                I18n.t("profile.main.clearAsyncStorage"),
                () => {
                  void AsyncStorage.clear();
                },
                true
              )}
            {isDevEnv &&
              this.debugListItem(
                I18n.t("profile.main.dumpAsyncStorage"),
                () => {
                  /* eslint-disable no-console */
                  console.log("[DUMP START]");
                  AsyncStorage.getAllKeys()
                    .then(keys => {
                      console.log(`\tAvailable keys: ${keys.join(", ")}`);
                      return Promise.all(
                        keys.map(key =>
                          AsyncStorage.getItem(key).then(value => {
                            console.log(`\tValue for ${key}\n\t\t`, value);
                          })
                        )
                      );
                    })
                    .then(() => console.log("[DUMP END]"))
                    .catch(e => console.error(e));
                  /* eslint-enable no-console */
                },
                false
              )}
          </React.Fragment>
        )}
      </React.Fragment>
    );
  }

  public render() {
    const { navigation } = this.props;

    const showInformationModal = (
      title: TranslationKeys,
      body: TranslationKeys
    ) => {
      this.props.showModal(
        <ContextualInfo
          onClose={this.props.hideModal}
          title={I18n.t(title)}
          body={() => <Markdown>{I18n.t(body)}</Markdown>}
        />
      );
    };

    const screenContent = () => (
      <ScrollView style={IOStyles.bgWhite}>
        <VSpacer size={16} />
        <List withContentLateralPadding={true}>
          {/* Data */}
          <ListItemComponent
            title={I18n.t("profile.main.data.title")}
            subTitle={I18n.t("profile.main.data.description")}
            onPress={() =>
              navigation.navigate(ROUTES.PROFILE_NAVIGATOR, {
                screen: ROUTES.PROFILE_DATA
              })
            }
            isFirstItem
          />

          {/* Preferences */}
          <ListItemComponent
            title={I18n.t("profile.main.preferences.title")}
            subTitle={I18n.t("profile.main.preferences.description")}
            onPress={() =>
              navigation.navigate(ROUTES.PROFILE_NAVIGATOR, {
                screen: ROUTES.PROFILE_PREFERENCES_HOME
              })
            }
          />

          {/* Security */}
          <ListItemComponent
            title={I18n.t("profile.main.security.title")}
            subTitle={I18n.t("profile.main.security.description")}
            onPress={() =>
              navigation.navigate(ROUTES.PROFILE_NAVIGATOR, {
                screen: ROUTES.PROFILE_SECURITY
              })
            }
          />

          {/* Privacy */}
          <ListItemComponent
            title={I18n.t("profile.main.privacy.title")}
            subTitle={I18n.t("profile.main.privacy.description")}
            onPress={() =>
              navigation.navigate(ROUTES.PROFILE_NAVIGATOR, {
                screen: ROUTES.PROFILE_PRIVACY_MAIN
              })
            }
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
          />

          {/* Logout/Exit */}
          <ListItemComponent
            title={I18n.t("profile.main.logout")}
            subTitle={I18n.t("profile.logout.menulabel")}
            onPress={this.onLogoutPress}
            hideIcon={true}
            isLastItem={true}
          />

          {/* Show the app version + Enable debug mode */}
          <AppVersion onPress={this.onTapAppVersion} />

          {/* Developers Section */}
          {(this.props.isDebugModeEnabled || isDevEnv) &&
            this.renderDeveloperSection()}

          {/* end list */}
          <EdgeBorderComponent />
        </List>
      </ScrollView>
    );

    return (
      <DarkLayout
        referenceToContentScreen={(c: ScreenContentRoot) => {
          this.props.setTabPressCallback(
            // eslint-disable-next-line no-underscore-dangle
            () => () => c._root.scrollToPosition(0, 0)
          );

          return c;
        }}
        accessibilityLabel={I18n.t("profile.main.title")}
        bounces={false}
        appLogo={true}
        title={I18n.t("profile.main.title")}
        icon={require("../../../img/icons/profile-illustration.png")}
        topContent={
          <TouchableDefaultOpacity
            accessibilityRole={"button"}
            onPress={() =>
              this.props.navigation.navigate(ROUTES.PROFILE_NAVIGATOR, {
                screen: ROUTES.PROFILE_FISCAL_CODE
              })
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
  isPnTestEnabled: isPnTestEnabledSelector(state),
  isIdPayTestEnabled: isIdPayTestEnabledSelector(state),
  isDesignSystemEnabled: isDesignSystemEnabledSelector(state),
  publicKey: lollipopPublicKeySelector(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  logout: () => navigateToLogout(),
  clearCache: () => dispatch(clearCache()),
  setDebugModeEnabled: (enabled: boolean) =>
    dispatch(setDebugModeEnabled(enabled)),
  setPagoPATestEnabled: (isPagoPATestEnabled: boolean) =>
    dispatch(
      preferencesPagoPaTestEnvironmentSetEnabled({ isPagoPATestEnabled })
    ),
  setPnTestEnabled: (isPnTestEnabled: boolean) =>
    dispatch(preferencesPnTestEnvironmentSetEnabled({ isPnTestEnabled })),
  dispatchSessionExpired: () => dispatch(sessionExpired()),
  setIdPayTestEnabled: (isIdPayTestEnabled: boolean) =>
    dispatch(preferencesIdPayTestSetEnabled({ isIdPayTestEnabled })),
  setDesignSystemEnabled: (isDesignSystemEnabled: boolean) =>
    dispatch(preferencesDesignSystemSetEnabled({ isDesignSystemEnabled }))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(
  withLightModalContext(withUseTabItemPressWhenScreenActive(ProfileMainScreen))
);

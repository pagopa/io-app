import {
  ButtonSolid,
  ContentWrapper,
  Divider,
  H2,
  IOVisualCostants,
  ListItemHeader,
  ListItemInfoCopy,
  ListItemNav,
  ListItemSwitch,
  VSpacer
} from "@pagopa/io-app-design-system";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import I18n from "i18n-js";
import * as React from "react";
import { ComponentProps } from "react";
import { Alert, FlatList, ListRenderItemInfo, View } from "react-native";
import { connect } from "react-redux";
import { IOToast } from "../../components/Toast";
import { withLightModalContext } from "../../components/helpers/withLightModalContext";
import { AlertModal } from "../../components/ui/AlertModal";
import { LightModalContextInterface } from "../../components/ui/LightModal";
import { isPlaygroundsEnabled } from "../../config";
import { isFastLoginEnabledSelector } from "../../features/fastLogin/store/selectors";
import { lollipopPublicKeySelector } from "../../features/lollipop/store/reducers/lollipop";
import { toThumbprint } from "../../features/lollipop/utils/crypto";
import { walletAddCoBadgeStart } from "../../features/wallet/onboarding/cobadge/store/actions";
import ROUTES from "../../navigation/routes";
import { sessionExpired } from "../../store/actions/authentication";
import { setDebugModeEnabled } from "../../store/actions/debug";
import {
  preferencesIdPayTestSetEnabled,
  preferencesPagoPaTestEnvironmentSetEnabled,
  preferencesPnTestEnvironmentSetEnabled
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
  isPagoPATestEnabledSelector,
  isPnTestEnabledSelector
} from "../../store/reducers/persistedPreferences";
import { GlobalState } from "../../store/reducers/types";
import { clipboardSetStringWithFeedback } from "../../utils/clipboard";
import { getDeviceId } from "../../utils/device";
import { isDevEnv } from "../../utils/environment";
import DSEnableSwitch from "./components/DSEnableSwitch";

type PlaygroundsNavListItem = {
  value: string;
  condition?: boolean;
} & Pick<
  ComponentProps<typeof ListItemNav>,
  "description" | "testID" | "onPress"
>;

type DevDataCopyListItem = {
  value: string;
  condition?: boolean;
} & Pick<
  ComponentProps<typeof ListItemInfoCopy>,
  "label" | "testID" | "onPress"
>;

type Props = LightModalContextInterface &
  ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const DeveloperModeSection = (props: Props) => {
  const navigation = useNavigation();
  const { isDebugModeEnabled, setDebugModeEnabled } = props;

  const onAddTestCard = () => {
    if (!props.isPagoPATestEnabled) {
      Alert.alert(
        I18n.t("profile.main.addCard.warning.title"),
        I18n.t("profile.main.addCard.warning.message"),
        [
          {
            text: I18n.t("profile.main.addCard.warning.closeButton"),
            style: "cancel"
          }
        ],
        { cancelable: false }
      );
      return;
    }
    props.startAddTestCard();
  };

  const showModal = () => {
    props.showModal(
      <AlertModal
        message={I18n.t("profile.main.pagoPaEnvironment.alertMessage")}
      />
    );
  };

  const onPnEnvironmentToggle = (enabled: boolean) => {
    props.setPnTestEnabled(enabled);
  };

  const onIdPayTestToggle = (enabled: boolean) => {
    props.setIdPayTestEnabled(enabled);
    showModal();
  };

  const handleClearCachePress = () => {
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
            props.clearCache();
            IOToast.show(I18n.t("profile.main.cache.cleared"));
          }
        }
      ],
      { cancelable: false }
    );
  };

  const onPagoPAEnvironmentToggle = (enabled: boolean) => {
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
              props.setPagoPATestEnabled(enabled);
              showModal();
            }
          }
        ],
        { cancelable: false }
      );
    } else {
      props.setPagoPATestEnabled(enabled);
      showModal();
    }
  };

  const renderDeveloperPlaygroundsSection = () => {
    const { isIdPayTestEnabled } = props;

    const playgroundsNavListItems: ReadonlyArray<PlaygroundsNavListItem> = [
      {
        value: "Lollipop",
        onPress: () =>
          navigation.navigate(ROUTES.PROFILE_NAVIGATOR, {
            screen: ROUTES.LOLLIPOP_PLAYGROUND
          })
      },
      {
        value: "MyPortal Web",
        onPress: () =>
          navigation.navigate(ROUTES.PROFILE_NAVIGATOR, {
            screen: ROUTES.WEB_PLAYGROUND
          })
      },
      {
        value: "Markdown",
        onPress: () =>
          navigation.navigate(ROUTES.PROFILE_NAVIGATOR, {
            screen: ROUTES.MARKDOWN_PLAYGROUND
          })
      },
      {
        value: "CGN Landing Page",
        onPress: () =>
          navigation.navigate(ROUTES.PROFILE_NAVIGATOR, {
            screen: ROUTES.CGN_LANDING_PLAYGROUND
          })
      },
      {
        condition: isIdPayTestEnabled,
        value: "IDPay Onboarding",
        onPress: () =>
          navigation.navigate(ROUTES.PROFILE_NAVIGATOR, {
            screen: ROUTES.IDPAY_ONBOARDING_PLAYGROUND
          })
      },
      {
        condition: isIdPayTestEnabled,
        value: "IDPay Code",
        onPress: () =>
          navigation.navigate(ROUTES.PROFILE_NAVIGATOR, {
            screen: ROUTES.IDPAY_CODE_PLAYGROUND
          })
      },
      {
        // New Wallet
        value: I18n.t("profile.main.walletPlayground.titleSection"),
        onPress: () =>
          navigation.navigate(ROUTES.PROFILE_NAVIGATOR, {
            screen: ROUTES.WALLET_PLAYGROUND
          })
      }
    ];

    // Don't render the separator, even if the item is null
    const filteredPlaygroundsNavListItems = playgroundsNavListItems.filter(
      item => item.condition !== false
    );

    const renderPlaygroundsNavItem = ({
      item: { value, onPress, testID, condition }
    }: ListRenderItemInfo<PlaygroundsNavListItem>) => {
      // If condition is either true or undefined, render the item
      if (condition !== false) {
        return (
          <ListItemNav
            accessibilityLabel={value}
            value={value}
            onPress={onPress}
            testID={testID}
          />
        );
      } else {
        return null;
      }
    };

    return (
      <FlatList
        ListHeaderComponent={<ListItemHeader label="Playground" />}
        scrollEnabled={false}
        keyExtractor={(item: PlaygroundsNavListItem, index: number) =>
          `${item.value}-${index}`
        }
        contentContainerStyle={{
          paddingHorizontal: IOVisualCostants.appMarginDefault
        }}
        data={filteredPlaygroundsNavListItems}
        renderItem={renderPlaygroundsNavItem}
        ItemSeparatorComponent={() => <Divider />}
      />
    );
  };

  const renderDeveloperTestEnvironmentSection = () => {
    const { isPagoPATestEnabled, isPnTestEnabled, isIdPayTestEnabled } = props;

    return (
      <ContentWrapper>
        <ListItemHeader
          label={I18n.t("profile.main.testEnvironmentSectionHeader")}
        />

        <ListItemSwitch
          label={I18n.t("profile.main.pagoPaEnvironment.pagoPaEnv")}
          description={I18n.t("profile.main.pagoPaEnvironment.pagoPAEnvAlert")}
          value={isPagoPATestEnabled}
          onSwitchValueChange={onPagoPAEnvironmentToggle}
        />
        <Divider />
        {/* Add Test Card CTA */}
        <ListItemNav
          value={I18n.t("profile.main.addCard.titleSection")}
          accessibilityLabel={I18n.t("profile.main.addCard.titleSection")}
          onPress={onAddTestCard}
        />
        <Divider />
        <ListItemSwitch
          label={I18n.t("profile.main.pnEnvironment.pnEnv")}
          value={isPnTestEnabled}
          onSwitchValueChange={onPnEnvironmentToggle}
        />
        <Divider />
        <ListItemSwitch
          label={I18n.t("profile.main.idpay.idpayTest")}
          description={I18n.t("profile.main.idpay.idpayTestAlert")}
          value={isIdPayTestEnabled}
          onSwitchValueChange={onIdPayTestToggle}
        />
      </ContentWrapper>
    );
  };

  const debugActionItem = (
    title: string,
    onPress: () => void,
    isDanger: boolean
  ) => (
    <View style={{ paddingVertical: 8 }}>
      {isDanger ? (
        <ButtonSolid
          fullWidth
          color="danger"
          label={title}
          onPress={onPress}
          accessibilityLabel={title}
        />
      ) : (
        <ButtonSolid
          fullWidth
          color="primary"
          label={title}
          onPress={onPress}
          accessibilityLabel={title}
        />
      )}
    </View>
  );

  const renderDeveloperDesignSystemSection = () => (
    <ContentWrapper>
      <ListItemHeader label="Human Interface" />

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
      <DSEnableSwitch />
    </ContentWrapper>
  );

  const renderDeveloperDataSection = () => {
    const {
      isFastLoginEnabled,
      sessionToken,
      walletToken,
      notificationToken,
      notificationId,
      publicKey
    } = props;

    const deviceUniqueId = getDeviceId();
    const thumbprint = toThumbprint(publicKey);

    const devDataCopyListItems: ReadonlyArray<DevDataCopyListItem> = [
      {
        condition: isFastLoginEnabled,
        label: "Fast Login",
        value: `${isFastLoginEnabled}`,
        onPress: () => clipboardSetStringWithFeedback(`${isFastLoginEnabled}`)
      },
      {
        condition: isDevEnv && !!sessionToken,
        label: "Session token",
        value: `${sessionToken}`,
        onPress: () => clipboardSetStringWithFeedback(`${sessionToken}`)
      },
      {
        condition: isDevEnv && !!walletToken,
        label: "Wallet token",
        value: `${walletToken}`,
        onPress: () => clipboardSetStringWithFeedback(`${walletToken}`)
      },
      {
        condition: isDevEnv,
        label: "Notification ID",
        value: `${notificationId}`,
        onPress: () => clipboardSetStringWithFeedback(`${notificationId}`)
      },
      {
        condition: isDevEnv && !!notificationToken,
        label: "Notification token",
        value: `${notificationToken}`,
        onPress: () => clipboardSetStringWithFeedback(`${notificationToken}`)
      },
      {
        label: "Device unique ID",
        value: `${deviceUniqueId}`,
        onPress: () => clipboardSetStringWithFeedback(`${deviceUniqueId}`)
      },
      {
        condition: !!thumbprint,
        label: "Thumbprint",
        value: `${thumbprint}`,
        onPress: () => clipboardSetStringWithFeedback(`${thumbprint}`)
      }
    ];

    // Don't render the separator, even if the item is null
    const filtereddevDataCopyListItems = devDataCopyListItems.filter(
      item => item.condition !== false
    );

    const renderDevDataCopyItem = ({
      item: { label, value, onPress, testID, condition }
    }: ListRenderItemInfo<DevDataCopyListItem>) => {
      // If condition is either true or undefined, render the item
      if (condition !== false) {
        return (
          <ListItemInfoCopy
            label={label}
            value={value}
            onPress={onPress}
            testID={testID}
            accessibilityLabel={value}
            numberOfLines={5}
          />
        );
      } else {
        return null;
      }
    };

    return (
      <FlatList
        ListHeaderComponent={<ListItemHeader label="Data" />}
        scrollEnabled={false}
        keyExtractor={(item: DevDataCopyListItem, index: number) =>
          `${item.value}-${index}`
        }
        contentContainerStyle={{
          paddingHorizontal: IOVisualCostants.appMarginDefault
        }}
        data={filtereddevDataCopyListItems}
        renderItem={renderDevDataCopyItem}
        ItemSeparatorComponent={() => <Divider />}
      />
    );
  };

  const renderDeveloperActionsSection = () => {
    const { dispatchSessionExpired } = props;

    return (
      <ContentWrapper>
        <ListItemHeader label="Actions" />

        {debugActionItem(
          I18n.t("profile.main.cache.clear"),
          handleClearCachePress,
          true
        )}

        {isDevEnv &&
          debugActionItem(
            I18n.t("profile.main.forgetCurrentSession"),
            dispatchSessionExpired,
            true
          )}
        {isDevEnv &&
          debugActionItem(
            I18n.t("profile.main.clearAsyncStorage"),
            () => {
              void AsyncStorage.clear();
            },
            true
          )}
        {isDevEnv &&
          debugActionItem(
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
      </ContentWrapper>
    );
  };

  return (
    <>
      <ContentWrapper>
        <VSpacer size={24} />
        <H2>{I18n.t("profile.main.developersSectionHeader")}</H2>
        <VSpacer size={8} />

        {/* Enable/Disable Developer Mode */}
        <ListItemSwitch
          label={I18n.t("profile.main.debugMode")}
          value={isDebugModeEnabled}
          onSwitchValueChange={setDebugModeEnabled}
        />
      </ContentWrapper>

      <VSpacer size={8} />

      {/* Playgrounds */}
      {isPlaygroundsEnabled && renderDeveloperPlaygroundsSection()}

      <VSpacer size={24} />

      {/* Test Environments */}
      {renderDeveloperTestEnvironmentSection()}

      <VSpacer size={24} />

      {/* Human Interface/Design System */}
      {renderDeveloperDesignSystemSection()}

      {/* Data */}
      {isDebugModeEnabled && (
        <>
          <VSpacer size={24} />
          {renderDeveloperDataSection()}
        </>
      )}

      {/* Actions */}
      {isDebugModeEnabled && (
        <>
          <VSpacer size={32} />
          {renderDeveloperActionsSection()}
        </>
      )}
    </>
  );
};

const mapStateToProps = (state: GlobalState) => ({
  isFastLoginEnabled: isFastLoginEnabledSelector(state),
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
  publicKey: lollipopPublicKeySelector(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
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
  startAddTestCard: () => dispatch(walletAddCoBadgeStart(undefined))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withLightModalContext(DeveloperModeSection));

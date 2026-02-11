import {
  ContentWrapper,
  Divider,
  H2,
  IOButton,
  IOButtonBlockSpecificProps,
  IOToast,
  IOVisualCostants,
  ListItemHeader,
  ListItemInfoCopy,
  ListItemNav,
  ListItemSwitch,
  VSpacer,
  useIOTheme
} from "@pagopa/io-app-design-system";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Sentry from "@sentry/react-native";
import I18n from "i18next";
import { ComponentProps, useContext } from "react";
import { Alert, FlatList, ListRenderItemInfo } from "react-native";
import { AlertModal } from "../../../../components/ui/AlertModal";
import { LightModalContext } from "../../../../components/ui/LightModal";
import { isPlaygroundsEnabled } from "../../../../config";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { setDebugModeEnabled } from "../../../../store/actions/debug";
import {
  preferencesIdPayTestSetEnabled,
  preferencesPagoPaTestEnvironmentSetEnabled,
  preferencesPnTestEnvironmentSetEnabled
} from "../../../../store/actions/persistedPreferences";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { isDebugModeEnabledSelector } from "../../../../store/reducers/debug";
import {
  isIdPayLocallyEnabledSelector,
  isPagoPATestEnabledSelector,
  isPnTestEnabledSelector
} from "../../../../store/reducers/persistedPreferences";
import { clipboardSetStringWithFeedback } from "../../../../utils/clipboard";
import { getDeviceId } from "../../../../utils/device";
import { isDevEnv, isLocalEnv } from "../../../../utils/environment";
import {
  setActiveSessionLoginLocalFlag,
  setStartActiveSessionLogin
} from "../../../authentication/activeSessionLogin/store/actions/index.ts";
import { isActiveSessionLoginLocallyEnabledSelector } from "../../../authentication/activeSessionLogin/store/selectors/index.ts";
import { AUTHENTICATION_ROUTES } from "../../../authentication/common/navigation/routes.ts";
import { sessionExpired } from "../../../authentication/common/store/actions";
import {
  sessionTokenSelector,
  walletTokenSelector
} from "../../../authentication/common/store/selectors";
import { isFastLoginEnabledSelector } from "../../../authentication/fastLogin/store/selectors";
import { ITW_ROUTES } from "../../../itwallet/navigation/routes.ts";
import { lollipopPublicKeySelector } from "../../../lollipop/store/reducers/lollipop";
import { toThumbprint } from "../../../lollipop/utils/crypto";
import { notificationsInstallationSelector } from "../../../pushNotifications/store/reducers/installation";
import { SETTINGS_ROUTES } from "../../common/navigation/routes";
import { clearCache } from "../../common/store/actions";
import ExperimentalDesignEnableSwitch from "./ExperimentalDesignEnableSwitch";

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

type TestEnvironmentsListItem = Pick<
  ComponentProps<typeof ListItemSwitch>,
  | "label"
  | "value"
  | "description"
  | "testID"
  | "onSwitchValueChange"
  | "disabled"
>;

type DevActionButton = {
  condition: boolean;
} & Pick<IOButtonBlockSpecificProps, "color" | "label" | "onPress">;

const DeveloperActionsSection = () => {
  const dispatch = useIODispatch();

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
            dispatch(clearCache());
            IOToast.show(I18n.t("profile.main.cache.cleared"));
          }
        }
      ],
      { cancelable: false }
    );
  };

  const sendSentryTestEvent = () => {
    Sentry.captureException(new Error("Random test Error"));
  };

  const dumpAsyncStorage = () => {
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
  };

  const devActionButtons: ReadonlyArray<DevActionButton> = [
    {
      condition: true,
      label: I18n.t("profile.main.cache.clear"),
      onPress: handleClearCachePress
    },
    {
      condition: isDevEnv,
      label: I18n.t("profile.main.forgetCurrentSession"),
      onPress: () => dispatch(sessionExpired())
    },
    {
      condition: isDevEnv,
      label: I18n.t("profile.main.clearAsyncStorage"),
      onPress: () => {
        void AsyncStorage.clear();
      }
    },
    {
      condition: isDevEnv,
      color: "primary",
      label: I18n.t("profile.main.dumpAsyncStorage"),
      onPress: dumpAsyncStorage
    },
    {
      condition: true,
      color: "primary",
      label: I18n.t("profile.main.sentryTestEvent"),
      onPress: sendSentryTestEvent
    }
  ];

  // Don't render the separator, even if the item is null
  const filteredDevActionButtons = devActionButtons.filter(
    item => item.condition !== false
  );

  const renderDevActionButton = ({
    item: { color = "danger", label, onPress }
  }: ListRenderItemInfo<DevActionButton>) => (
    <IOButton
      fullWidth
      variant="solid"
      color={color}
      label={label}
      accessibilityLabel={label}
      onPress={onPress}
    />
  );

  return (
    <>
      <FlatList
        ListHeaderComponent={<ListItemHeader label="Actions" />}
        scrollEnabled={false}
        keyExtractor={(item: DevActionButton, index: number) =>
          `${item.label}-${index}`
        }
        contentContainerStyle={{
          paddingHorizontal: IOVisualCostants.appMarginDefault
        }}
        data={filteredDevActionButtons}
        renderItem={renderDevActionButton}
        ItemSeparatorComponent={() => <VSpacer size={8} />}
      />
    </>
  );
};

const DeveloperDataSection = () => {
  const isFastLoginEnabled = useIOSelector(isFastLoginEnabledSelector);
  const sessionToken = useIOSelector(sessionTokenSelector);
  const walletToken = useIOSelector(walletTokenSelector);
  const { id: notificationId, token: notificationToken } = useIOSelector(
    notificationsInstallationSelector
  );
  const publicKey = useIOSelector(lollipopPublicKeySelector);
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
      condition: !!notificationToken,
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
  const filteredDevDataCopyListItems = devDataCopyListItems.filter(
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
      data={filteredDevDataCopyListItems}
      renderItem={renderDevDataCopyItem}
      ItemSeparatorComponent={() => <Divider />}
    />
  );
};

const DesignSystemSection = () => {
  const navigation = useIONavigation();

  return (
    <ContentWrapper>
      <ListItemHeader label="Human Interface" />

      <ListItemNav
        value={I18n.t("profile.main.designSystem")}
        accessibilityLabel={I18n.t("profile.main.designSystem")}
        onPress={() =>
          navigation.navigate(SETTINGS_ROUTES.PROFILE_NAVIGATOR, {
            screen: SETTINGS_ROUTES.DESIGN_SYSTEM
          })
        }
      />
      <Divider />
      <ExperimentalDesignEnableSwitch />
    </ContentWrapper>
  );
};

const PlaygroundsSection = () => {
  const navigation = useIONavigation();
  const dispatch = useIODispatch();
  const isIdPayTestEnabled = useIOSelector(isIdPayLocallyEnabledSelector);

  const playgroundsNavListItems: ReadonlyArray<PlaygroundsNavListItem> = [
    {
      value: "Lollipop",
      onPress: () =>
        navigation.navigate(SETTINGS_ROUTES.PROFILE_NAVIGATOR, {
          screen: SETTINGS_ROUTES.LOLLIPOP_PLAYGROUND
        })
    },
    {
      value: "IO Markdown",
      onPress: () =>
        navigation.navigate(SETTINGS_ROUTES.PROFILE_NAVIGATOR, {
          screen: SETTINGS_ROUTES.IO_MARKDOWN_PLAYGROUND
        })
    },
    {
      value: "CGN Landing Page",
      onPress: () =>
        navigation.navigate(SETTINGS_ROUTES.PROFILE_NAVIGATOR, {
          screen: SETTINGS_ROUTES.CGN_LANDING_PLAYGROUND
        })
    },
    {
      condition: isIdPayTestEnabled,
      value: "IDPay Onboarding",
      onPress: () =>
        navigation.navigate(SETTINGS_ROUTES.PROFILE_NAVIGATOR, {
          screen: SETTINGS_ROUTES.IDPAY_ONBOARDING_PLAYGROUND
        })
    },
    {
      condition: isIdPayTestEnabled,
      value: "IDPay Code",
      onPress: () =>
        navigation.navigate(SETTINGS_ROUTES.PROFILE_NAVIGATOR, {
          screen: SETTINGS_ROUTES.IDPAY_CODE_PLAYGROUND
        })
    },
    {
      value: "Documenti su IO",
      onPress: () =>
        navigation.navigate(ITW_ROUTES.MAIN, {
          screen: ITW_ROUTES.PLAYGROUNDS.LANDING
        })
    },
    {
      value: "App Feedback",
      onPress: () =>
        navigation.navigate(SETTINGS_ROUTES.PROFILE_NAVIGATOR, {
          screen: SETTINGS_ROUTES.APP_FEEDBACK_PLAYGROUND
        })
    },
    {
      value: "CIE SDK",
      onPress: () =>
        navigation.navigate(SETTINGS_ROUTES.PROFILE_NAVIGATOR, {
          screen: SETTINGS_ROUTES.CIE_PLAYGROUND
        })
    },
    {
      value: "NFC",
      onPress: () =>
        navigation.navigate(SETTINGS_ROUTES.PROFILE_NAVIGATOR, {
          screen: SETTINGS_ROUTES.NFC_PLAYGROUND
        })
    },
    {
      value: I18n.t(
        "profile.main.loginEnvironment.activeSession.playground.title"
      ),
      onPress: () => {
        dispatch(setStartActiveSessionLogin());
        navigation.navigate(SETTINGS_ROUTES.AUTHENTICATION, {
          screen: AUTHENTICATION_ROUTES.LANDING_ACTIVE_SESSION_LOGIN
        });
      }
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

const DeveloperTestEnvironmentSection = ({
  handleShowModal
}: {
  handleShowModal: () => void;
}) => {
  const dispatch = useIODispatch();
  const isPagoPATestEnabled = useIOSelector(isPagoPATestEnabledSelector);
  const isPnTestEnabled = useIOSelector(isPnTestEnabledSelector);
  const isIdPayTestEnabled = useIOSelector(isIdPayLocallyEnabledSelector);
  const isActiveSessionLoginLocallyEnabled = useIOSelector(
    isActiveSessionLoginLocallyEnabledSelector
  );

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
              dispatch(
                preferencesPagoPaTestEnvironmentSetEnabled({
                  isPagoPATestEnabled: enabled
                })
              );
              handleShowModal();
            }
          }
        ],
        { cancelable: false }
      );
    } else {
      dispatch(
        preferencesPagoPaTestEnvironmentSetEnabled({
          isPagoPATestEnabled: enabled
        })
      );
      handleShowModal();
    }
  };

  const onPnEnvironmentToggle = (enabled: boolean) => {
    dispatch(
      preferencesPnTestEnvironmentSetEnabled({ isPnTestEnabled: enabled })
    );
  };

  const onIdPayTestToggle = (enabled: boolean) => {
    dispatch(preferencesIdPayTestSetEnabled({ isIdPayTestEnabled: enabled }));
    handleShowModal();
  };

  const onActiveSessionLoginToggle = (enabled: boolean) => {
    if (enabled) {
      Alert.alert(
        I18n.t(
          "profile.main.loginEnvironment.activeSession.localFeatureFlag.alertTitle"
        ),
        I18n.t(
          "profile.main.loginEnvironment.activeSession.localFeatureFlag.alertMessage"
        ),
        [
          {
            text: I18n.t("global.buttons.cancel"),
            style: "cancel"
          },
          {
            text: I18n.t(
              "profile.main.loginEnvironment.activeSession.localFeatureFlag.alertConfirmButton"
            ),
            onPress: () => dispatch(setActiveSessionLoginLocalFlag(enabled))
          }
        ],
        { cancelable: true }
      );
    } else {
      dispatch(setActiveSessionLoginLocalFlag(enabled));
    }
  };

  const testEnvironmentsListItems: ReadonlyArray<TestEnvironmentsListItem> = [
    {
      label: I18n.t("profile.main.pagoPaEnvironment.pagoPaEnv"),
      description: isLocalEnv
        ? I18n.t("profile.main.pagoPaEnvironment.pagoPAEnvAlertLocal")
        : I18n.t("profile.main.pagoPaEnvironment.pagoPAEnvAlert"),
      value: isPagoPATestEnabled,
      onSwitchValueChange: onPagoPAEnvironmentToggle,
      disabled: isLocalEnv
    },
    {
      label: I18n.t("profile.main.pnEnvironment.pnEnv"),
      value: isPnTestEnabled,
      onSwitchValueChange: onPnEnvironmentToggle
    },
    {
      label: I18n.t("profile.main.idpay.idpayTest"),
      description: I18n.t("profile.main.idpay.idpayTestAlert"),
      value: isIdPayTestEnabled,
      onSwitchValueChange: onIdPayTestToggle
    },
    {
      label: I18n.t(
        "profile.main.loginEnvironment.activeSession.localFeatureFlag.switchTitle"
      ),
      description: I18n.t(
        "profile.main.loginEnvironment.activeSession.localFeatureFlag.switchDescription"
      ),
      value: isActiveSessionLoginLocallyEnabled,
      onSwitchValueChange: onActiveSessionLoginToggle
    }
  ];

  return (
    <FlatList
      ListHeaderComponent={
        <ListItemHeader
          label={I18n.t("profile.main.testEnvironmentSectionHeader")}
        />
      }
      scrollEnabled={false}
      keyExtractor={(item: TestEnvironmentsListItem, index: number) =>
        `${item.label}-${index}`
      }
      contentContainerStyle={{
        paddingHorizontal: IOVisualCostants.appMarginDefault
      }}
      data={testEnvironmentsListItems}
      renderItem={({ item }) => (
        <ListItemSwitch
          label={item.label}
          description={item.description}
          value={item.value}
          onSwitchValueChange={item.onSwitchValueChange}
          disabled={item.disabled}
        />
      )}
      ItemSeparatorComponent={() => <Divider />}
    />
  );
};

const DeveloperModeSection = () => {
  const { showModal } = useContext(LightModalContext);
  const dispatch = useIODispatch();
  const isDebugModeEnabled = useIOSelector(isDebugModeEnabledSelector);

  const theme = useIOTheme();

  const handleShowModal = () => {
    showModal(
      <AlertModal
        message={I18n.t("profile.main.pagoPaEnvironment.alertMessage")}
      />
    );
  };

  return (
    <>
      <ContentWrapper testID="developerModeSection">
        <VSpacer size={24} />
        <H2 color={theme["textHeading-default"]}>
          {I18n.t("profile.main.developersSectionHeader")}
        </H2>
        <VSpacer size={8} />

        {/* Enable/Disable Developer Mode */}
        <ListItemSwitch
          testID="debugModeSwitch"
          label={I18n.t("profile.main.debugMode")}
          value={isDebugModeEnabled}
          onSwitchValueChange={enabled =>
            dispatch(setDebugModeEnabled(enabled))
          }
        />
      </ContentWrapper>

      <VSpacer size={8} />

      {/* Playgrounds */}
      {isPlaygroundsEnabled && <PlaygroundsSection />}

      <VSpacer size={24} />

      {/* Test Environments */}
      <DeveloperTestEnvironmentSection handleShowModal={handleShowModal} />

      <VSpacer size={24} />

      {/* Human Interface/Design System */}
      <DesignSystemSection />

      {/* Data */}
      {isDebugModeEnabled && (
        <>
          <VSpacer size={24} />
          <DeveloperDataSection />
        </>
      )}

      {/* Actions */}
      {isDebugModeEnabled && (
        <>
          <VSpacer size={32} />
          <DeveloperActionsSection />
        </>
      )}
    </>
  );
};

export default DeveloperModeSection;

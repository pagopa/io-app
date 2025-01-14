import {
  IOColors,
  IconButton,
  TabItem,
  TabNavigation
} from "@pagopa/io-app-design-system";
import {
  useFocusEffect,
  useIsFocused,
  useNavigation,
  useRoute
} from "@react-navigation/native";
import React from "react";
import { AppState, StyleSheet, View } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import {
  SafeAreaView,
  useSafeAreaInsets
} from "react-native-safe-area-context";
import { ToolEnum } from "../../../../definitions/content/AssistanceToolConfig";
import { BaseHeader } from "../../../components/screens/BaseHeader";
import {
  ContextualHelpProps,
  ContextualHelpPropsMarkdown
} from "../../../components/screens/BaseScreenComponent";
import FocusAwareStatusBar from "../../../components/ui/FocusAwareStatusBar";
import I18n from "../../../i18n";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { canShowHelpSelector } from "../../../store/reducers/assistanceTools";
import { assistanceToolConfigSelector } from "../../../store/reducers/backendStatus/remoteConfig";
import { currentRouteSelector } from "../../../store/reducers/navigation";
import { FAQsCategoriesType } from "../../../utils/faq";
import { isAndroid } from "../../../utils/platform";
import {
  assistanceToolRemoteConfig,
  resetCustomFields
} from "../../../utils/supportAssistance";
import { zendeskSupportStart } from "../../zendesk/store/actions";
import {
  BarcodeAnalyticsFlow,
  trackBarcodeCameraAuthorizationDenied,
  trackBarcodeCameraAuthorizationNotDetermined,
  trackBarcodeCameraAuthorized,
  trackBarcodeCameraAuthorizedFromSettings,
  trackBarcodeScanScreenView,
  trackBarcodeScanTorch,
  trackZendeskSupport
} from "../analytics";
import { useIOBarcodeCameraScanner } from "../hooks/useIOBarcodeCameraScanner";
import {
  IOBarcode,
  IOBarcodeFormat,
  IOBarcodeOrigin,
  IOBarcodeType
} from "../types/IOBarcode";
import { BarcodeFailure } from "../types/failure";
import { CameraPermissionView } from "./CameraPermissionView";

type HelpProps = {
  contextualHelp?: ContextualHelpProps;
  contextualHelpMarkdown?: ContextualHelpPropsMarkdown;
  faqCategories?: ReadonlyArray<FAQsCategoriesType>;
  hideHelpButton?: boolean;
};

type Props = {
  /**
   * Accepted barcoded formats that can be detected. Leave empty to accept all formats.
   * If the format is not supported it will return an UNSUPPORTED_FORMAT error
   */
  barcodeFormats?: Array<IOBarcodeFormat>;
  /**
   * Accepted barcode types that can be detected. Leave empty to accept all types.
   * If the type is not supported it will return an UNKNOWN_CONTENT error
   */
  barcodeTypes?: Array<IOBarcodeType>;
  /**
   * Callback called when a barcode is successfully decoded
   */
  onBarcodeSuccess: (
    barcodes: Array<IOBarcode>,
    origin: IOBarcodeOrigin
  ) => void;
  /**
   * Callback called when a barcode is not successfully decoded
   */
  onBarcodeError: (failure: BarcodeFailure, origin: IOBarcodeOrigin) => void;
  /**
   * Callback called when the upload file input is pressed, necessary to show the file input modal
   */
  onFileInputPressed: () => void;
  /**
   * Callback called when the manual input button is pressed
   * necessary to navigate to the manual input screen or show the manual input modal
   */
  onManualInputPressed: () => void;
  /**
   * Mixpanel analytics parameters
   */
  barcodeAnalyticsFlow: BarcodeAnalyticsFlow;
  /**
   * If true, the screen goes into a loading state which disables all interaction and displays a loading indicator
   */
  isLoading?: boolean;
  /**
   * Disables barcode scan capabilities, putting the component in an idle state
   */
  isDisabled?: boolean;
} & HelpProps;

const BarcodeScanBaseScreenComponent = ({
  barcodeFormats,
  barcodeTypes,
  onBarcodeError,
  onBarcodeSuccess,
  onFileInputPressed,
  onManualInputPressed,
  isLoading = false,
  isDisabled = false,
  faqCategories,
  contextualHelp,
  contextualHelpMarkdown,
  hideHelpButton,
  barcodeAnalyticsFlow
}: Props) => {
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  const route = useRoute();

  const currentScreenName = useIOSelector(currentRouteSelector);

  const [isAppInBackground, setIsAppInBackground] = React.useState(
    AppState.currentState !== "active"
  );

  const dispatch = useIODispatch();
  const assistanceToolConfig = useIOSelector(assistanceToolConfigSelector);
  const canShowHelp = useIOSelector(canShowHelpSelector);
  const choosenTool = assistanceToolRemoteConfig(assistanceToolConfig);

  /**
   * Updates the app state when it changes.
   *
   * @param {string} nextAppState - The next state of the app.
   *
   * @returns {void}
   */
  React.useEffect(() => {
    const subscription = AppState.addEventListener("change", nextAppState => {
      setIsAppInBackground(nextAppState !== "active");
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      trackBarcodeScanScreenView(barcodeAnalyticsFlow);
    }, [barcodeAnalyticsFlow])
  );

  const onShowHelp = (): (() => void) | undefined => {
    switch (choosenTool) {
      case ToolEnum.zendesk:
        // The navigation param assistanceForPayment is fixed to false because in this entry point we don't know the category yet.
        return () => {
          trackZendeskSupport(route.name, barcodeAnalyticsFlow);
          resetCustomFields();
          dispatch(
            zendeskSupportStart({
              faqCategories,
              contextualHelp,
              contextualHelpMarkdown,
              startingRoute: currentScreenName,
              assistanceForPayment: false,
              assistanceForCard: false,
              assistanceForFci: false
            })
          );
        };
      default:
        return undefined;
    }
  };

  const canShowHelpButton = () => {
    if (hideHelpButton || !canShowHelp) {
      return false;
    } else {
      return contextualHelp || contextualHelpMarkdown;
    }
  };

  const {
    cameraComponent,
    cameraPermissionStatus,
    requestCameraPermission,
    openCameraSettings,
    hasTorch,
    isTorchOn,
    toggleTorch
  } = useIOBarcodeCameraScanner({
    onBarcodeSuccess,
    onBarcodeError,
    barcodeFormats,
    barcodeTypes,
    isDisabled: isAppInBackground || !isFocused || isDisabled,
    isLoading
  });

  const customGoBack = (
    <IconButton
      icon="closeLarge"
      onPress={navigation.goBack}
      accessibilityLabel={I18n.t("global.buttons.close")}
      color="contrast"
    />
  );

  const openAppSetting = React.useCallback(async () => {
    // Open the custom settings if the app has one
    await openCameraSettings();
  }, [openCameraSettings]);

  const cameraView = React.useMemo(() => {
    if (cameraPermissionStatus === "granted") {
      return cameraComponent;
    }

    if (cameraPermissionStatus === "not-determined") {
      trackBarcodeCameraAuthorizationNotDetermined();

      return (
        <CameraPermissionView
          pictogram="cameraRequest"
          title={I18n.t("barcodeScan.permissions.undefined.title")}
          body={I18n.t("barcodeScan.permissions.undefined.label")}
          action={{
            label: I18n.t("barcodeScan.permissions.undefined.action"),
            accessibilityLabel: I18n.t(
              "barcodeScan.permissions.undefined.action"
            ),
            onPress: async () => {
              trackBarcodeCameraAuthorized();
              await requestCameraPermission();
            }
          }}
        />
      );
    }

    trackBarcodeCameraAuthorizationDenied();

    return (
      <CameraPermissionView
        pictogram="cameraDenied"
        title={I18n.t("barcodeScan.permissions.denied.title")}
        body={I18n.t("barcodeScan.permissions.denied.label")}
        action={{
          label: I18n.t("barcodeScan.permissions.denied.action"),
          accessibilityLabel: I18n.t("barcodeScan.permissions.denied.action"),
          onPress: async () => {
            trackBarcodeCameraAuthorizedFromSettings();
            await openAppSetting();
          }
        }}
      />
    );
  }, [
    cameraPermissionStatus,
    openAppSetting,
    cameraComponent,
    requestCameraPermission
  ]);

  const handleTorchToggle = () => {
    trackBarcodeScanTorch();
    toggleTorch();
  };

  const shouldDisplayTorchButton =
    cameraPermissionStatus === "granted" && hasTorch;

  const torchIconButton: React.ComponentProps<
    typeof BaseHeader
  >["customRightIcon"] = {
    iconName: isTorchOn ? "lightFilled" : "light",
    accessibilityLabel: isTorchOn
      ? I18n.t("accessibility.buttons.torch.turnOff")
      : I18n.t("accessibility.buttons.torch.turnOn"),
    onPress: handleTorchToggle
  };

  return (
    <View style={[styles.screen, { paddingBottom: insets.bottom }]}>
      <View style={styles.cameraContainer}>{cameraView}</View>
      <View style={styles.navigationContainer}>
        <TabNavigation tabAlignment="stretch" selectedIndex={0} color="dark">
          <TabItem
            testID="barcodeScanBaseScreenTabScan"
            label={I18n.t("barcodeScan.tabs.scan")}
            accessibilityLabel={I18n.t("barcodeScan.tabs.a11y.scan")}
          />
          <TabItem
            testID="barcodeScanBaseScreenTabUpload"
            label={I18n.t("barcodeScan.tabs.upload")}
            accessibilityLabel={I18n.t("barcodeScan.tabs.a11y.upload")}
            onPress={onFileInputPressed}
          />
          <TabItem
            testID="barcodeScanBaseScreenTabInput"
            label={I18n.t("barcodeScan.tabs.input")}
            accessibilityLabel={I18n.t("barcodeScan.tabs.a11y.input")}
            onPress={onManualInputPressed}
          />
        </TabNavigation>
      </View>
      <LinearGradient
        colors={["#03134480", "#03134400"]}
        style={styles.headerContainer}
      >
        <SafeAreaView>
          {/* This overrides BaseHeader status bar configuration */}
          <FocusAwareStatusBar barStyle={"light-content"} translucent={true} />
          {/* FIXME: replace with new header */}
          <BaseHeader
            hideSafeArea={true}
            dark={true}
            backgroundColor={"transparent"}
            goBack={true}
            customGoBack={customGoBack}
            onShowHelp={canShowHelpButton() ? onShowHelp() : undefined}
            customRightIcon={
              shouldDisplayTorchButton ? torchIconButton : undefined
            }
          />
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: IOColors["blueIO-850"]
  },
  headerContainer: {
    flex: 1,
    position: "absolute",
    width: "100%",
    height: 160
  },
  cameraContainer: {
    flex: 1,
    flexGrow: 1,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden"
  },
  navigationContainer: {
    paddingVertical: 16
  }
});

export { BarcodeScanBaseScreenComponent };

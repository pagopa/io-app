import {
  HStack,
  HeaderActionProps,
  IOColors,
  IOVisualCostants,
  IconButton,
  LoadingSpinner,
  TabItem,
  TabNavigation
} from "@pagopa/io-app-design-system";
import {
  useFocusEffect,
  useIsFocused,
  useNavigation
} from "@react-navigation/native";

import { Millisecond } from "@pagopa/ts-commons/lib/units";
import I18n from "i18next";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppState, StyleSheet, View } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import {
  SafeAreaView,
  useSafeAreaInsets
} from "react-native-safe-area-context";
import FocusAwareStatusBar from "../../../components/ui/FocusAwareStatusBar";
import { useOfflineToastGuard } from "../../../hooks/useOfflineToastGuard";
import { useStartSupportRequest } from "../../../hooks/useStartSupportRequest";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../store/hooks";
import { canShowHelpSelector } from "../../../store/reducers/assistanceTools";
import { setAccessibilityFocus } from "../../../utils/accessibility";
import {
  ContextualHelpProps,
  ContextualHelpPropsMarkdown
} from "../../../utils/contextualHelp";
import { isTestEnv } from "../../../utils/environment";
import { FAQsCategoriesType } from "../../../utils/faq";
import { isAndroid } from "../../../utils/platform";
import {
  BarcodeAnalyticsFlow,
  trackBarcodeCameraAuthorizationDenied,
  trackBarcodeCameraAuthorizationNotDetermined,
  trackBarcodeCameraAuthorized,
  trackBarcodeCameraAuthorizedFromSettings,
  trackBarcodeScanScreenView,
  trackBarcodeScanTorch
} from "../analytics";
import { useCameraPermissionStatus } from "../hooks/useCameraPermissionStatus";
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
  const scanItemRef = useRef<View>(null);

  const [isAppInBackground, setIsAppInBackground] = useState(
    AppState.currentState !== "active"
  );

  const canShowHelp = useIOSelector(canShowHelpSelector);

  /* Taken from `useHeaderSecondLevel` */
  const startSupportRequest = useOfflineToastGuard(
    useStartSupportRequest({
      faqCategories,
      contextualHelpMarkdown,
      contextualHelp
    })
  );

  /**
   * Updates the app state when it changes.
   *
   * @param {string} nextAppState - The next state of the app.
   *
   * @returns {void}
   */
  useEffect(() => {
    const subscription = AppState.addEventListener("change", nextAppState => {
      setIsAppInBackground(nextAppState !== "active");
    });
    return () => {
      subscription.remove();
    };
  }, []);

  useFocusEffect(
    useCallback(
      () => setAccessibilityFocus(scanItemRef, 200 as Millisecond),
      []
    )
  );

  useFocusEffect(
    useCallback(() => {
      trackBarcodeScanScreenView(barcodeAnalyticsFlow);
    }, [barcodeAnalyticsFlow])
  );

  const canShowHelpButton = () => {
    if (hideHelpButton || !canShowHelp) {
      return false;
    } else {
      return contextualHelp || contextualHelpMarkdown;
    }
  };

  const {
    cameraPermissionStatus,
    requestCameraPermission,
    openCameraSettings
  } = useCameraPermissionStatus();

  const { cameraComponent, hasTorch, isTorchOn, toggleTorch } =
    useIOBarcodeCameraScanner({
      onBarcodeSuccess,
      onBarcodeError,
      barcodeFormats,
      barcodeTypes,
      isDisabled: isAppInBackground || !isFocused || isDisabled,
      isLoading
    });

  const cameraView = useMemo(() => {
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

    if (cameraPermissionStatus === "denied") {
      trackBarcodeCameraAuthorizationDenied();

      return (
        <CameraPermissionView
          pictogram="cameraDenied"
          title={I18n.t("barcodeScan.permissions.denied.title")}
          body={I18n.t("barcodeScan.permissions.denied.label")}
          action={{
            label: I18n.t("barcodeScan.permissions.denied.action"),
            accessibilityLabel: I18n.t("barcodeScan.permissions.denied.action"),
            onPress: () => {
              trackBarcodeCameraAuthorizedFromSettings();
              openCameraSettings();
            }
          }}
        />
      );
    }

    return <LoadingSpinner size={76} color="white" />;
  }, [
    cameraPermissionStatus,
    openCameraSettings,
    cameraComponent,
    requestCameraPermission
  ]);

  const handleTorchToggle = () => {
    trackBarcodeScanTorch();
    toggleTorch();
  };

  const shouldDisplayTorchButton =
    cameraPermissionStatus === "granted" && hasTorch;

  const closeButton: HeaderActionProps = {
    icon: "closeLarge",
    onPress: navigation.goBack,
    accessibilityLabel: I18n.t("global.buttons.close")
  };

  const helpAction: HeaderActionProps = {
    icon: "help",
    onPress: startSupportRequest,
    accessibilityLabel: I18n.t(
      "global.accessibility.contextualHelp.open.label"
    ),
    accessibilityHint: I18n.t("global.accessibility.contextualHelp.open.hint"),
    testID: "helpButton"
  };

  const torchAction: HeaderActionProps = {
    icon: isTorchOn ? "lightFilled" : "light",
    accessibilityLabel: isTorchOn
      ? I18n.t("accessibility.buttons.torch.turnOff")
      : I18n.t("accessibility.buttons.torch.turnOn"),
    onPress: handleTorchToggle
  };

  const HeaderTransparent = () => (
    <View
      style={{
        paddingHorizontal: IOVisualCostants.appMarginDefault,
        height: IOVisualCostants.headerHeight,
        flexGrow: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
      }}
    >
      <IconButton {...closeButton} color="contrast" />

      <HStack allowScaleSpacing space={16} style={{ flexShrink: 0 }}>
        {shouldDisplayTorchButton ? (
          <IconButton {...torchAction} color="contrast" />
        ) : null}

        {canShowHelpButton() ? (
          <IconButton {...helpAction} color="contrast" />
        ) : null}

        {/* {canShowHelpButton() ? onShowHelp() : undefined} */}
      </HStack>
    </View>
  );

  return (
    <View style={[styles.screen, { paddingBottom: insets.bottom }]}>
      <View style={styles.cameraContainer}>{cameraView}</View>
      <View style={styles.navigationContainer}>
        <TabNavigation tabAlignment="stretch" selectedIndex={0} color="dark">
          <TabItem
            ref={scanItemRef}
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
          <FocusAwareStatusBar
            barStyle={"light-content"}
            backgroundColor={isAndroid ? IOColors["blueIO-850"] : "transparent"}
            translucent={false}
          />
          {!isTestEnv && <HeaderTransparent />}
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

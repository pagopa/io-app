import {
  Alert,
  Body,
  BodySmall,
  Icon,
  IOButton,
  IOColors,
  IOSkeleton,
  IOVisualCostants,
  useIOThemeContext,
  VSpacer,
  VStack
} from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import I18n from "i18next";
import { useCallback, useEffect, useMemo } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import QRCode from "react-native-qrcode-skia";
import ItwIcon from "../../../../../../img/features/itWallet/brand/itw_icon.svg";
import { IOScrollView } from "../../../../../components/ui/IOScrollView.tsx";
import { useDebugInfo } from "../../../../../hooks/useDebugInfo.ts";
import { useHeaderSecondLevel } from "../../../../../hooks/useHeaderSecondLevel.tsx";
import {
  IOStackNavigationRouteProps,
  useIONavigation
} from "../../../../../navigation/params/AppParamsList.ts";
import { useIOSelector } from "../../../../../store/hooks.ts";
import { useMaxBrightness } from "../../../../../utils/brightness.ts";
import { emptyContextualHelp } from "../../../../../utils/contextualHelp.ts";
import { ItWalletLogo } from "../../../common/components/ItWalletLogo.tsx";
import {
  ITW_BRANDED_BOX_PADDING,
  ItwBrandedBox
} from "../../../common/components/ItwBrandedBox.tsx";
import { itwIsBannerHiddenSelector } from "../../../common/store/selectors/banners";
import { ITW_ROUTES } from "../../../navigation/routes";
import {
  trackItwProximityQrCode,
  trackItwProximityQrCodeLoadingRetry,
  trackItwStartReissuingPID
} from "../analytics/index.ts";
import { ItwProximityQrCodeInfoBanner } from "../components/ItwProximityQrCodeInfoBanner";
import { ItwProximityMachineContext } from "../machine/provider.tsx";
import {
  selectFailure,
  selectIsBluetoothRequiredState,
  selectIsLoading,
  selectIsPermissionsRequiredState,
  selectQRCodeString
} from "../machine/selectors.ts";
import { ItwProximityParamsList } from "../navigation/ItwProximityParamsList";
import { shouldBlockProximityQrCodeSelector } from "../store/selectors/credentials";

const QR_CODE_LOGO_SIZE = 52;

type StatusBoxProps = {
  iconName: "warningFilled" | "qrCode";
  description: string;
  action?: React.ReactNode;
};

const StatusBox = ({ iconName, description, action }: StatusBoxProps) => (
  <View style={styles.statusBox}>
    <Icon name={iconName} size={24} color="grey-700" />
    <Body style={styles.statusDescription}>{description}</Body>
    {action}
  </View>
);

export type ItwProximityQrCodeScreenNavigationParams = {
  source: "ITW_CREDENTIAL_DETAIL" | "WALLET_HOME";
};

type ItwProximityQrCodeScreenProps = IOStackNavigationRouteProps<
  ItwProximityParamsList,
  "ITW_PROXIMITY_QR_CODE"
>;

export const ItwProximityQrCodeScreen = ({
  route
}: ItwProximityQrCodeScreenProps) => {
  const source = route.params?.source;
  const { themeType, theme } = useIOThemeContext();
  const { width } = useWindowDimensions();

  const navigation = useIONavigation();
  const machineRef = ItwProximityMachineContext.useActorRef();
  const qrCodeString =
    ItwProximityMachineContext.useSelector(selectQRCodeString);
  const isLoading = ItwProximityMachineContext.useSelector(selectIsLoading);
  const failure = ItwProximityMachineContext.useSelector(selectFailure);

  const isPermissionsRequired = ItwProximityMachineContext.useSelector(
    selectIsPermissionsRequiredState
  );
  const isBluetoothRequired = ItwProximityMachineContext.useSelector(
    selectIsBluetoothRequiredState
  );
  const shouldBlockProximityPresentation = useIOSelector(
    shouldBlockProximityQrCodeSelector
  );
  const isQrCodeInfoBannerHidden = useIOSelector(
    itwIsBannerHiddenSelector("proximity_qr_code_info")
  );

  useDebugInfo({
    isLoading,
    failure,
    isPermissionsRequired,
    isBluetoothRequired,
    shouldBlockProximityPresentation,
    qrCodeString
  });

  // Auto-start only on the initial mount. When the flow is closing, the machine
  // transitions back to Idle briefly before unmount, and we must not restart it.
  useEffect(() => {
    if (machineRef.getSnapshot().matches("Idle")) {
      machineRef.send({
        type: "start"
      });
    }
  }, [machineRef]);

  const isDark = themeType === "dark";
  const qrCodeSize =
    width - IOVisualCostants.appMarginDefault * 2 - ITW_BRANDED_BOX_PADDING * 2;
  const qrCodeColor: IOColors = isDark ? "white" : "black";

  useMaxBrightness({ useSmoothTransition: true });

  useHeaderSecondLevel({
    title: "",
    canGoBack: true,
    contextualHelp: emptyContextualHelp,
    supportRequest: true
  });

  const qrCodeStatus = useMemo(() => {
    if (shouldBlockProximityPresentation) {
      return "PID_expired";
    }
    if (failure) {
      return "generation_failed";
    }
    return "valid";
  }, [shouldBlockProximityPresentation, failure]);

  useFocusEffect(
    useCallback(() => {
      if (source) {
        trackItwProximityQrCode({ source, qr_code_status: qrCodeStatus });
      }
    }, [source, qrCodeStatus])
  );

  // When the screen is removed (back button), dismiss the proximity machine
  useEffect(
    () =>
      navigation.addListener("beforeRemove", () => {
        machineRef.send({ type: "dismiss" });
      }),
    [navigation, machineRef]
  );

  // If the user denied permissions or didn't enable Bluetooth, go back
  useEffect(() => {
    if (isPermissionsRequired || isBluetoothRequired) {
      navigation.goBack();
    }
  }, [isPermissionsRequired, isBluetoothRequired, navigation]);

  const handleRetry = () => {
    trackItwProximityQrCodeLoadingRetry();
    machineRef.send({ type: "retry" });
  };

  const handleReissuePress = () => {
    trackItwStartReissuingPID({
      position: "ITW_QR_CODE"
    });
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.IDENTIFICATION.MODE_SELECTION,
      params: {
        eidReissuing: true,
        level: "l3"
      }
    });
  };

  const isFailure = !!failure || shouldBlockProximityPresentation;
  const showStatusContent = !!isLoading || isFailure;

  const renderQrCodeContent = () => {
    if (failure !== undefined) {
      return (
        <StatusBox
          iconName="warningFilled"
          description={I18n.t(
            "features.itWallet.presentation.qrCode.error.message"
          )}
          action={
            <View style={styles.retryActionContainer}>
              <IOButton
                variant="link"
                label={I18n.t("global.buttons.retry")}
                onPress={handleRetry}
              />
            </View>
          }
        />
      );
    }

    if (shouldBlockProximityPresentation) {
      return (
        <StatusBox
          iconName="qrCode"
          description={I18n.t(
            "features.itWallet.presentation.qrCode.error.invalid"
          )}
        />
      );
    }

    if (isLoading || !qrCodeString) {
      return <IOSkeleton shape="square" size={qrCodeSize} radius={16} />;
    }

    return (
      <QRCode
        color={qrCodeColor}
        value={qrCodeString}
        size={qrCodeSize}
        errorCorrectionLevel="H"
        shapeOptions={{
          shape: "circle",
          eyePatternShape: "rounded",
          eyePatternGap: 0,
          gap: 0
        }}
        logoAreaSize={88}
        logoAreaBorderRadius={8}
        logo={<ItwIcon width={QR_CODE_LOGO_SIZE} height={QR_CODE_LOGO_SIZE} />}
      />
    );
  };

  return (
    <IOScrollView>
      <ItwBrandedBox
        variant={isFailure ? "error" : "default"}
        backgroundVariant={"gradient"}
      >
        <VStack space={16}>
          <View style={styles.logoContainer}>
            <ItWalletLogo width={134} height={28} />
            {shouldBlockProximityPresentation && (
              <Icon name="errorFilled" size={20} color={theme.errorIcon} />
            )}
          </View>

          {!showStatusContent && (
            <BodySmall style={styles.centeredText}>
              {I18n.t("features.itWallet.presentation.qrCode.instruction")}
            </BodySmall>
          )}

          {renderQrCodeContent()}
        </VStack>
      </ItwBrandedBox>
      {!isQrCodeInfoBannerHidden && (
        <>
          <VSpacer size={24} />
          <ItwProximityQrCodeInfoBanner />
        </>
      )}
      {shouldBlockProximityPresentation && (
        <>
          <VSpacer size={24} />
          <Alert
            testID="itwExpiredBannerTestID"
            variant="error"
            content={I18n.t(
              "features.itWallet.presentation.qrCode.banner.invalid"
            )}
            action={I18n.t("features.itWallet.presentation.qrCode.reissue.cta")}
            onPress={handleReissuePress}
          />
        </>
      )}
    </IOScrollView>
  );
};

const styles = StyleSheet.create({
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8
  },
  centeredText: {
    textAlign: "center"
  },
  statusBox: {
    backgroundColor: IOColors["grey-50"],
    alignItems: "center",
    justifyContent: "center",
    aspectRatio: 1,
    padding: 16,
    borderRadius: 16,
    gap: 8
  },
  statusDescription: {
    textAlign: "center"
  },
  retryActionContainer: {
    marginTop: 0
  }
});

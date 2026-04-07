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
  VSpacer
} from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { useEffect, useState } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import QRCode from "react-native-qrcode-skia";

import ItwIcon from "../../../../../../img/features/itWallet/brand/itw_icon.svg";
import {
  IOScrollView,
  IOScrollViewActions
} from "../../../../../components/ui/IOScrollView.tsx";
import { useHeaderSecondLevel } from "../../../../../hooks/useHeaderSecondLevel.tsx";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList.ts";
import { useIOSelector } from "../../../../../store/hooks.ts";
import { useMaxBrightness } from "../../../../../utils/brightness.ts";
import { emptyContextualHelp } from "../../../../../utils/contextualHelp.ts";
import { ItWalletLogo } from "../../../common/components/ItWalletLogo.tsx";
import { ItwBrandedBox } from "../../../common/components/ItwBrandedBox.tsx";
import { ITW_ROUTES } from "../../../navigation/routes";
import { ItwProximityMachineContext } from "../machine/provider.tsx";
import {
  selectIsBluetoothRequiredState,
  selectIsLoading,
  selectIsPermissionsRequiredState,
  selectIsQRCodeGenerationError,
  selectQRCodeString
} from "../machine/selectors.ts";
import { shouldBlockProximityQrCodeSelector } from "../store/selectors";

const QR_CODE_LOGO_SIZE = 52;

type StatusBoxProps = {
  action?: React.ReactNode;
  description: string;
  iconName: "qrCode" | "warningFilled";
};

const StatusBox = ({ iconName, description, action }: StatusBoxProps) => (
  <View style={styles.statusBox}>
    <Icon color="grey-700" name={iconName} size={24} />
    <Body style={styles.statusDescription}>{description}</Body>
    {action}
  </View>
);

export const ItwProximityQrCodeScreen = () => {
  const [isRetrying, setIsRetrying] = useState(false);
  const { themeType, theme } = useIOThemeContext();
  const { width } = useWindowDimensions();

  const navigation = useIONavigation();
  const machineRef = ItwProximityMachineContext.useActorRef();
  const qrCodeString =
    ItwProximityMachineContext.useSelector(selectQRCodeString);
  const isLoading = ItwProximityMachineContext.useSelector(selectIsLoading);
  const isProximityError = ItwProximityMachineContext.useSelector(
    selectIsQRCodeGenerationError
  );
  const isPermissionsRequired = ItwProximityMachineContext.useSelector(
    selectIsPermissionsRequiredState
  );
  const isBluetoothRequired = ItwProximityMachineContext.useSelector(
    selectIsBluetoothRequiredState
  );
  const shouldBlockProximityPresentation = useIOSelector(
    shouldBlockProximityQrCodeSelector
  );
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
  const qrCodeSize = width - IOVisualCostants.appMarginDefault * 3;
  const qrCodeColor: IOColors = isDark ? "white" : "black";

  useMaxBrightness({ useSmoothTransition: true });

  useHeaderSecondLevel({
    title: "",
    canGoBack: true,
    contextualHelp: emptyContextualHelp,
    supportRequest: true
  });

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
    setIsRetrying(true);
    machineRef.send({ type: "retry" });
  };

  const handleReissuePress = () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.IDENTIFICATION.MODE_SELECTION,
      params: {
        eidReissuing: true,
        level: "l3"
      }
    });
  };

  const scrollViewActions: IOScrollViewActions | undefined =
    shouldBlockProximityPresentation
      ? {
          type: "SingleButton",
          primary: {
            label: I18n.t("features.itWallet.presentation.qrCode.reissue.cta"),
            onPress: handleReissuePress
          }
        }
      : undefined;

  const showStatusContent =
    isProximityError || shouldBlockProximityPresentation;

  const renderQrCodeContent = () => {
    if (isProximityError) {
      return (
        <StatusBox
          action={
            <View
              style={[
                styles.retryActionContainer,
                isRetrying && styles.retryActionContainerLoading
              ]}
            >
              {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
              {/* @ts-ignore */}
              <IOButton
                label={I18n.t("global.buttons.retry")}
                loading={isRetrying}
                onPress={handleRetry}
                variant="link"
              />
            </View>
          }
          description={I18n.t(
            "features.itWallet.presentation.qrCode.error.message"
          )}
          iconName="warningFilled"
        />
      );
    }

    if (shouldBlockProximityPresentation) {
      return (
        <StatusBox
          description={I18n.t(
            "features.itWallet.presentation.qrCode.error.invalid"
          )}
          iconName="qrCode"
        />
      );
    }

    if (isLoading || !qrCodeString) {
      return <IOSkeleton radius={16} shape="square" size={qrCodeSize} />;
    }

    return (
      <QRCode
        color={qrCodeColor}
        errorCorrectionLevel="H"
        logo={<ItwIcon height={QR_CODE_LOGO_SIZE} width={QR_CODE_LOGO_SIZE} />}
        logoAreaSize={QR_CODE_LOGO_SIZE + 8}
        shapeOptions={{ shape: "rounded", eyePatternShape: "rounded" }}
        size={qrCodeSize}
        value={qrCodeString}
      />
    );
  };

  return (
    <IOScrollView actions={scrollViewActions}>
      <ItwBrandedBox
        backgroundVariant={"gradient"}
        variant={showStatusContent ? "error" : "default"}
      >
        <View style={styles.logoContainer}>
          <ItWalletLogo height={28} width={134} />
          {shouldBlockProximityPresentation && (
            <Icon color={theme.errorIcon} name="errorFilled" size={20} />
          )}
        </View>
        {!showStatusContent && (
          <>
            <VSpacer size={8} />
            <BodySmall style={styles.centeredText}>
              {I18n.t("features.itWallet.presentation.qrCode.instruction")}
            </BodySmall>
          </>
        )}
        <VSpacer size={16} />
        {renderQrCodeContent()}
      </ItwBrandedBox>
      {shouldBlockProximityPresentation && (
        <>
          <VSpacer size={24} />
          <Alert
            content={I18n.t(
              "features.itWallet.presentation.qrCode.banner.invalid"
            )}
            testID="itwExpiredBannerTestID"
            variant="error"
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
  },
  retryActionContainerLoading: {
    marginTop: -4
  }
});

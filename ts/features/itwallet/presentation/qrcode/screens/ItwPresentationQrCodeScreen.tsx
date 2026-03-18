import {
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
import { useNavigation } from "@react-navigation/native";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import QRCode from "react-native-qrcode-skia";
import I18n from "i18next";
import { IOScrollView } from "../../../../../components/ui/IOScrollView";
import { useHeaderSecondLevel } from "../../../../../hooks/useHeaderSecondLevel";
import { useMaxBrightness } from "../../../../../utils/brightness";
import { ItwBrandedBox } from "../../../common/components/ItwBrandedBox";
import { ItWalletLogo } from "../../../common/components/ItWalletLogo";
import { ItwProximityMachineContext } from "../../proximity/machine/provider";
import {
  selectIsLoading,
  selectIsQRCodeGenerationError,
  selectQRCodeString
} from "../../proximity/machine/selectors";
import ItwIcon from "../../../../../../img/features/itWallet/brand/itw_icon.svg";

const QR_CODE_LOGO_SIZE = 52;

export const ItwPresentationQrCodeScreen = () => {
  const [isRetrying, setIsRetrying] = useState(false);
  const { themeType } = useIOThemeContext();
  const { width } = useWindowDimensions();

  const navigation = useNavigation();
  const machineRef = ItwProximityMachineContext.useActorRef();
  const qrCodeString =
    ItwProximityMachineContext.useSelector(selectQRCodeString);
  const isLoading = ItwProximityMachineContext.useSelector(selectIsLoading);
  const isError = ItwProximityMachineContext.useSelector(
    selectIsQRCodeGenerationError
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
    canGoBack: true
  });

  // When the screen is removed (back button), dismiss the proximity machine
  useEffect(
    () =>
      navigation.addListener("beforeRemove", () => {
        machineRef.send({ type: "dismiss" });
      }),
    [navigation, machineRef]
  );

  const QrCodeComponent = useMemo(() => {
    const handleRetry = () => {
      setIsRetrying(true);
      machineRef.send({ type: "retry" });
    };

    if (isError) {
      return (
        <View style={styles.retryBox}>
          <Icon name={"warningFilled"} size={24} color="grey-700" />
          <Body style={styles.retryDescription}>
            {I18n.t("features.itWallet.presentation.qrCode.error.message")}
          </Body>
          {/* This margin top is set to avoid a visual glitch when loading state changes */}
          <View style={{ marginTop: isRetrying ? -4 : 0 }}>
            {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
            {/* @ts-ignore */}
            <IOButton
              variant="link"
              loading={isRetrying}
              label={I18n.t("global.buttons.retry")}
              onPress={handleRetry}
            />
          </View>
        </View>
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
        shapeOptions={{ shape: "rounded", eyePatternShape: "rounded" }}
        logoAreaSize={QR_CODE_LOGO_SIZE + 8}
        logo={<ItwIcon width={QR_CODE_LOGO_SIZE} height={QR_CODE_LOGO_SIZE} />}
      />
    );
  }, [
    isError,
    isLoading,
    isRetrying,
    machineRef,
    qrCodeColor,
    qrCodeSize,
    qrCodeString
  ]);

  return (
    <IOScrollView>
      <ItwBrandedBox variant={isError ? "error" : "default"}>
        <View style={styles.logoContainer}>
          <ItWalletLogo width={134} height={28} />
        </View>
        {!isError && (
          <>
            <VSpacer size={8} />
            <BodySmall style={styles.centeredText}>
              {I18n.t("features.itWallet.presentation.qrCode.instruction")}
            </BodySmall>
          </>
        )}
        <VSpacer size={16} />
        {QrCodeComponent}
      </ItwBrandedBox>
    </IOScrollView>
  );
};

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: "center"
  },
  centeredText: {
    textAlign: "center"
  },
  retryBox: {
    backgroundColor: IOColors["grey-50"],
    alignItems: "center",
    justifyContent: "center",
    aspectRatio: 1,
    padding: 16,
    borderRadius: 16,
    gap: 8
  },
  retryDescription: {
    textAlign: "center"
  }
});

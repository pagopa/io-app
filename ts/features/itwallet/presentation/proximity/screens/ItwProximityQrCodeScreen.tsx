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
import { useEffect, useState } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import QRCode from "react-native-qrcode-skia";
import I18n from "i18next";
import { useSelector } from "react-redux";
import { IOScrollView } from "../../../../../components/ui/IOScrollView.tsx";
import { useHeaderSecondLevel } from "../../../../../hooks/useHeaderSecondLevel.tsx";
import { useMaxBrightness } from "../../../../../utils/brightness.ts";
import { ItwBrandedBox } from "../../../common/components/ItwBrandedBox.tsx";
import { ItWalletLogo } from "../../../common/components/ItWalletLogo.tsx";
import { ItwProximityMachineContext } from "../machine/provider.tsx";
import {
  selectIsLoading,
  selectIsQRCodeGenerationError,
  selectQRCodeString
} from "../machine/selectors.ts";
import ItwIcon from "../../../../../../img/features/itWallet/brand/itw_icon.svg";
import { shouldBlockProximityQrCodeSelector } from "../store/selectors";
import { emptyContextualHelp } from "../../../../../utils/contextualHelp.ts";

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

export const ItwProximityQrCodeScreen = () => {
  const [isRetrying, setIsRetrying] = useState(false);
  const { themeType } = useIOThemeContext();
  const { width } = useWindowDimensions();

  const navigation = useNavigation();
  const machineRef = ItwProximityMachineContext.useActorRef();
  const qrCodeString =
    ItwProximityMachineContext.useSelector(selectQRCodeString);
  const isLoading = ItwProximityMachineContext.useSelector(selectIsLoading);
  const isProximityError = ItwProximityMachineContext.useSelector(
    selectIsQRCodeGenerationError
  );
  const shouldBlockProximityPresentation = useSelector(
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

  const handleRetry = () => {
    setIsRetrying(true);
    machineRef.send({ type: "retry" });
  };

  const showStatusContent =
    isProximityError || shouldBlockProximityPresentation;

  const renderQrCodeContent = () => {
    if (isProximityError) {
      return (
        <StatusBox
          iconName="warningFilled"
          description={I18n.t(
            "features.itWallet.presentation.qrCode.error.message"
          )}
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
                variant="link"
                loading={isRetrying}
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
        shapeOptions={{ shape: "rounded", eyePatternShape: "rounded" }}
        logoAreaSize={QR_CODE_LOGO_SIZE + 8}
        logo={<ItwIcon width={QR_CODE_LOGO_SIZE} height={QR_CODE_LOGO_SIZE} />}
      />
    );
  };

  return (
    <IOScrollView>
      <ItwBrandedBox
        variant={showStatusContent ? "error" : "default"}
        backgroundVariant={"gradient"}
      >
        <View style={styles.logoContainer}>
          <ItWalletLogo width={134} height={28} />
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

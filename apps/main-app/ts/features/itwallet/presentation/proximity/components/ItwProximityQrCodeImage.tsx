import {
  Body,
  Icon,
  IOButton,
  IOColors,
  IOSkeleton,
  IOVisualCostants,
  useIOTheme
} from "@io-app/design-system";
import { useFocusEffect } from "@react-navigation/native";
import I18n from "i18next";
import { useCallback } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import QRCode, { ShapeOptions } from "react-native-qrcode-skia";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import ItwIcon from "../../../../../../img/features/itWallet/brand/itw_icon.svg";
import { useDebugInfo } from "../../../../../hooks/useDebugInfo";
import { useIOSelector } from "../../../../../store/hooks";
import { ITW_BRANDED_BOX_PADDING } from "../../../common/components/ItwBrandedBox";
import {
  trackItwProximityQrCode,
  trackItwProximityQrCodeLoadingRetry
} from "../analytics";
import { ItwProximityQrCode as ItwProximityQrCodeTracking } from "../analytics/types";
import { ItwProximityMachineContext } from "../machine/provider";
import { selectFailure, selectQRCodeString } from "../machine/selectors";
import { shouldShowExpiredProximityCredentialsBannerSelector } from "../store/selectors/credentials";

const QR_CODE_LOGO_SIZE = 52;
const QR_CODE_FADE_DURATION = 200;

const QR_CODE_SHAPE_OPTIONS: ShapeOptions = {
  shape: "circle",
  eyePatternShape: "rounded",
  eyePatternGap: 0,
  gap: 0
};
const QR_CODE_LOGO = (
  <ItwIcon height={QR_CODE_LOGO_SIZE} width={QR_CODE_LOGO_SIZE} />
);

/**
 * For the QR Code size, we start from the window width and subtract the
 * horizontal padding.
 */
const WINDOW_WIDTH = Dimensions.get("window").width;

/**
 * The total size is the window width minus the horizontal screen padding and
 * the branded box padding.
 */
const QR_CODE_SIZE =
  WINDOW_WIDTH -
  IOVisualCostants.appMarginDefault * 2 - // Subtracting the horizontal screen padding (both sides)
  ITW_BRANDED_BOX_PADDING * 2; // Subtracting the branded box padding (both sides)

type Props = {
  source?: ItwProximityQrCodeTracking["source"];
};

export const ItwProximityQrCodeImage = ({ source }: Props) => {
  const theme = useIOTheme();
  const machineRef = ItwProximityMachineContext.useActorRef();

  const qrCodeString =
    ItwProximityMachineContext.useSelector(selectQRCodeString);
  const failure = ItwProximityMachineContext.useSelector(selectFailure);
  const shouldShowExpiredBanner = useIOSelector(
    shouldShowExpiredProximityCredentialsBannerSelector
  );

  useDebugInfo({
    qrCodeString
  });

  useFocusEffect(
    useCallback(() => {
      const qrCodeStatus = shouldShowExpiredBanner
        ? "PID_expired"
        : failure
          ? "generation_failed"
          : "valid";

      if (source) {
        trackItwProximityQrCode({ source, qr_code_status: qrCodeStatus });
      }
    }, [source, shouldShowExpiredBanner, failure])
  );

  const handleRetry = () => {
    trackItwProximityQrCodeLoadingRetry();
    machineRef.send({ type: "retry" });
  };

  if (failure !== undefined) {
    return (
      <StatusBox
        action={
          <View style={styles.retryActionContainer}>
            <IOButton
              label={I18n.t("global.buttons.retry")}
              onPress={handleRetry}
              variant="link"
            />
          </View>
        }
        description={I18n.t(
          "features.itWallet.presentation.proximity.engagement.qrCode.error"
        )}
        iconName="warningFilled"
      />
    );
  }

  return (
    <View style={styles.qrCodeSlot}>
      {qrCodeString ? (
        <Animated.View
          accessibilityLabel={I18n.t(
            "features.itWallet.presentation.proximity.engagement.qrCode.accessibilityLabel"
          )}
          accessibilityRole="image"
          accessible={true}
          entering={FadeIn.duration(QR_CODE_FADE_DURATION)}
        >
          <QRCode
            color={theme["textBody-default"]}
            errorCorrectionLevel="H"
            logo={QR_CODE_LOGO}
            logoAreaBorderRadius={8}
            logoAreaSize={88}
            shapeOptions={QR_CODE_SHAPE_OPTIONS}
            size={QR_CODE_SIZE}
            value={qrCodeString}
          />
        </Animated.View>
      ) : (
        <Animated.View
          key="skeleton"
          exiting={FadeOut.duration(QR_CODE_FADE_DURATION)}
          style={StyleSheet.absoluteFill}
        >
          <IOSkeleton radius={16} shape="square" size={QR_CODE_SIZE} />
        </Animated.View>
      )}
    </View>
  );
};

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

const styles = StyleSheet.create({
  qrCodeSlot: {
    width: QR_CODE_SIZE,
    height: QR_CODE_SIZE
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

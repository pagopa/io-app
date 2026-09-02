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
import { memo, startTransition, useCallback, useEffect, useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import QRCode, { type ShapeOptions } from "react-native-qrcode-skia";
import Animated, { FadeIn } from "react-native-reanimated";

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
const QR_CODE_LOGO_AREA_SIZE = 88;
const QR_CODE_LOGO_AREA_RADIUS = 8;
const QR_CODE_ERROR_CORRECTION_LEVEL = "H";

/**
 * Module-level so react-native-qrcode-skia's path memo is not reset
 * by a new object/element identity on every parent render.
 */
const QR_SHAPE_OPTIONS: ShapeOptions = {
  shape: "circle",
  eyePatternShape: "rounded",
  eyePatternGap: 0,
  gap: 0
};

const QR_CODE_LOGO = (
  <ItwIcon height={QR_CODE_LOGO_SIZE} width={QR_CODE_LOGO_SIZE} />
);

/**
 * For the QR Code size, we start from the window width and subtract the horizontal padding.
 */
const WINDOW_WIDTH = Dimensions.get("window").width;

/**
 * The total size is the window width minus the horizontal screen padding and the branded box padding.
 */
const QR_CODE_SIZE =
  WINDOW_WIDTH -
  IOVisualCostants.appMarginDefault * 2 - // Subtracting the horizontal screen padding (both sides)
  ITW_BRANDED_BOX_PADDING * 2; // Subtracting the branded box padding (both sides)

type SkiaQrCodeProps = {
  color: string;
  value: string;
};

/**
 * Isolated so parent re-renders (machine, debug overlay) do not recreate
 * react-native-qrcode-skia's SVG path.
 */
const ProximitySkiaQrCode = memo(({ color, value }: SkiaQrCodeProps) => (
  <QRCode
    color={color}
    errorCorrectionLevel={QR_CODE_ERROR_CORRECTION_LEVEL}
    logo={QR_CODE_LOGO}
    logoAreaBorderRadius={QR_CODE_LOGO_AREA_RADIUS}
    logoAreaSize={QR_CODE_LOGO_AREA_SIZE}
    shapeOptions={QR_SHAPE_OPTIONS}
    size={QR_CODE_SIZE}
    value={value}
  />
));

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

  const [shouldRenderQr, setShouldRenderQr] = useState(false);

  useEffect(() => {
    if (!qrCodeString) {
      setShouldRenderQr(false);
      return;
    }
    // Keep the skeleton on screen for this paint, then mount QRCode on the
    // next frame so path generation does not hitch the string-arrival commit.
    const frame = requestAnimationFrame(() => {
      startTransition(() => {
        setShouldRenderQr(true);
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [qrCodeString]);

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

  const qrColor = theme["textBody-default"];

  return (
    <View
      accessibilityLabel={
        qrCodeString
          ? I18n.t(
              "features.itWallet.presentation.proximity.engagement.qrCode.accessibilityLabel"
            )
          : undefined
      }
      accessibilityRole={qrCodeString ? "image" : undefined}
      accessible={!!qrCodeString}
      style={styles.qrSlot}
      testID="itwProximityQrSlotTestID"
    >
      {shouldRenderQr && qrCodeString ? (
        <Animated.View entering={FadeIn.duration(300)}>
          <ProximitySkiaQrCode color={qrColor} value={qrCodeString} />
        </Animated.View>
      ) : (
        <IOSkeleton radius={16} shape="square" size={QR_CODE_SIZE} />
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
  qrSlot: {
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

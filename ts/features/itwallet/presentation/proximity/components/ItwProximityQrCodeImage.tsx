import {
  Body,
  Icon,
  IOButton,
  IOColors,
  IOSkeleton,
  IOVisualCostants,
  useIOTheme
} from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import I18n from "i18next";
import { useCallback, useMemo } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import QRCode from "react-native-qrcode-skia";
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
import { shouldBlockProximityQrCodeSelector } from "../store/selectors/credentials";

const QR_CODE_LOGO_SIZE = 52;

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

type Props = {
  source?: ItwProximityQrCodeTracking["source"];
};

export const ItwProximityQrCodeImage = ({ source }: Props) => {
  const theme = useIOTheme();
  const machineRef = ItwProximityMachineContext.useActorRef();

  const qrCodeString =
    ItwProximityMachineContext.useSelector(selectQRCodeString);
  const failure = ItwProximityMachineContext.useSelector(selectFailure);
  const shouldBlock = useIOSelector(shouldBlockProximityQrCodeSelector);

  useDebugInfo({
    qrCodeString
  });

  const qrCodeStatus = useMemo(() => {
    if (shouldBlock) {
      return "PID_expired";
    }
    if (failure) {
      return "generation_failed";
    }
    return "valid";
  }, [shouldBlock, failure]);

  useFocusEffect(
    useCallback(() => {
      if (source) {
        trackItwProximityQrCode({ source, qr_code_status: qrCodeStatus });
      }
    }, [source, qrCodeStatus])
  );

  const handleRetry = () => {
    trackItwProximityQrCodeLoadingRetry();
    machineRef.send({ type: "retry" });
  };

  if (failure !== undefined) {
    return (
      <StatusBox
        iconName="warningFilled"
        description={I18n.t(
          "features.itWallet.presentation.proximity.engagement.qrCode.error"
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

  if (shouldBlock) {
    return (
      <StatusBox
        iconName="qrCode"
        description={I18n.t(
          "features.itWallet.presentation.proximity.engagement.invalidBanner.content"
        )}
      />
    );
  }

  if (!qrCodeString) {
    return <IOSkeleton shape="square" size={QR_CODE_SIZE} radius={16} />;
  }

  return (
    <Animated.View entering={FadeIn.duration(200)}>
      <QRCode
        color={theme["textBody-default"]}
        value={qrCodeString}
        size={QR_CODE_SIZE}
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
    </Animated.View>
  );
};

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

const styles = StyleSheet.create({
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

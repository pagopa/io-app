/* eslint-disable @typescript-eslint/ban-ts-comment */
import { View, Dimensions, StyleSheet } from "react-native";
import QRCode from "react-native-qrcode-svg";
import {
  Body,
  Icon,
  IOButton,
  IOColors,
  IOVisualCostants
} from "@pagopa/io-app-design-system";
import { memo } from "react";
import I18n from "../../../../../i18n";

const QR_WIDTH =
  Dimensions.get("window").width - IOVisualCostants.appMarginDefault * 2;

type Props = {
  qrCodeString?: string;
  isQRCodeGenerationError?: boolean;
  isLoading?: boolean;
  onRetry: () => void;
};

export const ItwEngagementQRCode = memo(
  ({ qrCodeString, isQRCodeGenerationError, isLoading, onRetry }: Props) => {
    if (isQRCodeGenerationError) {
      return (
        <View style={styles.retryBox}>
          <Icon name="warningFilled" />
          <Body style={{ textAlign: "center" }}>
            {I18n.t(
              "features.itWallet.presentation.proximity.mdl.bottomSheet.error.message"
            )}
          </Body>
          <View style={{ marginTop: isLoading ? -4 : 0 }}>
            {/* @ts-ignore */}
            <IOButton
              accessibilityRole="button"
              label={I18n.t(
                "features.itWallet.presentation.proximity.mdl.bottomSheet.error.action"
              )}
              variant="link"
              loading={isLoading}
              onPress={onRetry}
            />
          </View>
        </View>
      );
    }

    return <QRCode value={qrCodeString} size={QR_WIDTH} ecl="Q" />;
  }
);

const styles = StyleSheet.create({
  retryBox: {
    aspectRatio: 1,
    width: QR_WIDTH,
    backgroundColor: IOColors["grey-50"],
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16
  }
});

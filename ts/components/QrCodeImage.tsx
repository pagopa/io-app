import {
  IOColors,
  IOSkeleton,
  IOSpacingScale
} from "@pagopa/io-app-design-system";
import { memo, useMemo } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import QRCode, { QRCodeProps } from "react-native-qrcode-svg";

export type QrCodeImageProps = {
  // Value to decode and present using a QR Code
  // If undefined, a placeholder is shown
  value?: string;
  // Relative or absolute size of the QRCode image
  size?: number | `${number}%`;
  // Optional background color for the QR Code image
  backgroundColor?: string;
  // Optional correction level for the QR Code image
  correctionLevel?: QRCodeProps["ecl"];
  // Accessibility
  accessibilityLabel?: string;
  // Callback to handle the error if the QR Code generation fails
  onError?: (error: Error) => void;
};

const defaultAccessibilityLabel = "QR Code";
const boxPadding: IOSpacingScale = 8;

/**
 * This components renders a QR Code which resolves in the provided value
 */
const QrCodeImage = ({
  value,
  size = 200,
  backgroundColor,
  correctionLevel = "H",
  accessibilityLabel = defaultAccessibilityLabel,
  onError
}: QrCodeImageProps) => {
  const { width } = useWindowDimensions();

  const realSize = useMemo<number>(() => {
    const padding = boxPadding * 2;
    if (typeof size === "number") {
      return size - padding;
    }

    return (parseFloat(size) / 100.0) * width - padding;
  }, [size, width]);

  return value ? (
    <View
      accessible={true}
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
      style={styles.whiteFrame}
    >
      <QRCode
        value={value}
        size={realSize}
        ecl={correctionLevel}
        backgroundColor={backgroundColor}
        onError={onError}
      />
    </View>
  ) : (
    <IOSkeleton shape="square" size={realSize} radius={16} />
  );
};

const styles = StyleSheet.create({
  whiteFrame: {
    // Enforing white to allow the QR code to be scanned with dark mode
    backgroundColor: IOColors.white,
    padding: boxPadding,
    borderRadius: 8
  }
});

const MemoizedQrCodeImage = memo(QrCodeImage);
export { MemoizedQrCodeImage as QrCodeImage };

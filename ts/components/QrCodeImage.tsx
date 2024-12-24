import React from "react";
import { useWindowDimensions, View } from "react-native";
import QRCode, { QRCodeProps } from "react-native-qrcode-svg";
import Placeholder from "rn-placeholder";

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
  const realSize = React.useMemo<number>(() => {
    if (typeof size === "number") {
      return size;
    }

    return (parseFloat(size) / 100.0) * width;
  }, [size, width]);

  return value ? (
    <View
      accessible={true}
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
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
    <Placeholder.Box
      height={realSize}
      width={realSize}
      animate="fade"
      radius={16}
    />
  );
};

const MemoizedQrCodeImage = React.memo(QrCodeImage);
export { MemoizedQrCodeImage as QrCodeImage };

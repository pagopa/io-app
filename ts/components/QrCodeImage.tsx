import { IOColors, IOSkeleton } from "@pagopa/io-app-design-system";
import { memo, useMemo } from "react";
import { useWindowDimensions, View } from "react-native";
import QRCode, { QRCodeProps } from "react-native-qrcode-svg";

export type QrCodeImageProps = {
  // Accessibility
  accessibilityLabel?: string;
  // Optional color of the background
  backgroundColor?: string;
  // Optional color of the cell
  color?: string;
  // Optional correction level for the QR Code image
  correctionLevel?: QRCodeProps["ecl"];
  // If true, the QR code will be rendered with inverted colors
  inverted?: boolean;
  // Callback to handle the error if the QR Code generation fails
  onError?: (error: Error) => void;
  // Relative or absolute size of the QRCode image
  size?: `${number}%` | number;
  // Value to decode and present using a QR Code
  // If undefined, a placeholder is shown
  value?: string;
};

const defaultAccessibilityLabel = "QR Code";

/**
 * This components renders a QR Code which resolves in the provided value
 */
const QrCodeImage = ({
  value,
  size = 200,
  color = IOColors.black,
  backgroundColor = IOColors.white,
  inverted = false,
  correctionLevel = "H",
  accessibilityLabel = defaultAccessibilityLabel,
  onError
}: QrCodeImageProps) => {
  const { width } = useWindowDimensions();

  const realSize = useMemo<number>(() => {
    if (typeof size === "number") {
      return size;
    }

    return (parseFloat(size) / 100.0) * width;
  }, [size, width]);

  const colors = [color, backgroundColor];

  return value ? (
    <View
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="image"
      accessible={true}
    >
      <QRCode
        backgroundColor={colors[inverted ? 0 : 1]}
        color={colors[inverted ? 1 : 0]}
        ecl={correctionLevel}
        onError={onError}
        size={realSize}
        value={value}
      />
    </View>
  ) : (
    <IOSkeleton radius={16} shape="square" size={realSize} />
  );
};

const MemoizedQrCodeImage = memo(QrCodeImage);
export { MemoizedQrCodeImage as QrCodeImage };

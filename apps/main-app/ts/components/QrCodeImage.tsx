import { IOColors, IOSkeleton } from "@pagopa/io-app-design-system";
import { memo, useMemo } from "react";
import { useWindowDimensions, View } from "react-native";
import QRCode, { QRCodeProps } from "react-native-qrcode-svg";

export type QrCodeImageProps = {
  // Value to decode and present using a QR Code
  // If undefined, a placeholder is shown
  value?: string;
  // Relative or absolute size of the QRCode image
  size?: number | `${number}%`;
  // Optional color of the cell
  color?: string;
  // Optional color of the background
  backgroundColor?: string;
  // If true, the QR code will be rendered with inverted colors
  inverted?: boolean;
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
      accessible={true}
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
    >
      <QRCode
        value={value}
        size={realSize}
        ecl={correctionLevel}
        color={colors[inverted ? 1 : 0]}
        backgroundColor={colors[inverted ? 0 : 1]}
        onError={onError}
      />
    </View>
  ) : (
    <IOSkeleton shape="square" size={realSize} radius={16} />
  );
};

const MemoizedQrCodeImage = memo(QrCodeImage);
export { MemoizedQrCodeImage as QrCodeImage };

import React from "react";
import { ImageSourcePropType, useWindowDimensions } from "react-native";
import Placeholder from "rn-placeholder";
import RNQRGenerator from "rn-qr-generator";
import { AnimatedImage } from "./AnimatedImage";

export type QrCodeImageProps = {
  // Value to decode and present using a QR Code
  value: string;
  // Relative or absolute size of the QRCode image
  size?: number | `${number}%`;
  // Optional background color for the QR Code image
  backgroundColor?: string;
  // Accessibility
  accessibilityLabel?: string;
};

const defaultAccessibilityLabel = "QR Code";

/**
 * This components renders a QR Code which resolves in the provided value
 */
export const QrCodeImage = ({
  value,
  size = 200,
  backgroundColor,
  accessibilityLabel = defaultAccessibilityLabel
}: QrCodeImageProps) => {
  const [source, setSource] = React.useState<ImageSourcePropType>();
  const { width } = useWindowDimensions();
  const realSize = React.useMemo<number>(() => {
    if (typeof size === "number") {
      return size;
    }

    return (parseFloat(size) / 100.0) * width;
  }, [size, width]);

  React.useEffect(() => {
    RNQRGenerator.generate({
      value,
      height: realSize,
      width: realSize,
      backgroundColor,
      correctionLevel: "H"
    })
      .then(result => setSource(result))
      .catch(_ => undefined);
  }, [value, realSize, backgroundColor]);

  return source ? (
    <AnimatedImage
      source={source}
      accessible={true}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="image"
    />
  ) : (
    <Placeholder.Box
      height={realSize}
      width={realSize}
      animate="fade"
      radius={16}
    />
  );
};

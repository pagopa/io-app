import React from "react";
import { ImageSourcePropType, useWindowDimensions } from "react-native";
import Placeholder from "rn-placeholder";
import RNQRGenerator, { QRCodeGenerateOptions } from "rn-qr-generator";
import { AnimatedImage } from "./AnimatedImage";

export type QrCodeImageProps = {
  // Value to decode and present using a QR Code
  value: string;
  // Relative or absolute size of the QRCode image
  size?: number | `${number}%`;
  // Optional background color for the QR Code image
  backgroundColor?: string;
  // Optional correction level for the QR Code image
  correctionLevel?: QRCodeGenerateOptions["correctionLevel"];
};

/**
 * This components renders a QR Code which resolves in the provided value
 */
export const QrCodeImage = ({
  value,
  size = 200,
  backgroundColor,
  correctionLevel = "H"
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
      correctionLevel
    })
      .then(result => setSource(result))
      .catch(_ => undefined);
  }, [value, realSize, backgroundColor, correctionLevel]);

  return source ? (
    <AnimatedImage source={source} />
  ) : (
    <Placeholder.Box
      height={realSize}
      width={realSize}
      animate="fade"
      radius={16}
    />
  );
};

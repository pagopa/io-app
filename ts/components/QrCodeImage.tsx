import React from "react";
import { ImageSourcePropType } from "react-native";
import Placeholder from "rn-placeholder";
import RNQRGenerator from "rn-qr-generator";
import { AnimatedImage } from "./AnimatedImage";

export type QrCodeImageProps = {
  value: string;
  size?: number;
  backgroundColor?: string;
};

/**
 * This components renders a QR Code which resolves in the provided value
 */
export const QrCodeImage = ({
  value,
  size = 200,
  backgroundColor
}: QrCodeImageProps) => {
  const [source, setSource] = React.useState<ImageSourcePropType>();

  React.useEffect(() => {
    RNQRGenerator.generate({
      value,
      height: size,
      width: size,
      backgroundColor,
      correctionLevel: "H"
    })
      .then(result => setSource(result))
      .catch(_ => undefined);
  }, [value, size, backgroundColor]);

  return source ? (
    <AnimatedImage source={source} />
  ) : (
    <Placeholder.Box height={size} width={size} animate="fade" radius={16} />
  );
};

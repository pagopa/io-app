import {
  BlendColor,
  Size,
  Image as SkiaImage,
  useImage
} from "@shopify/react-native-skia";
import { memo } from "react";
import { CredentialCardConfig } from "./config";

type CardOverlayProps = Required<Pick<CredentialCardConfig, "overlay">> &
  Pick<CredentialCardConfig, "overlayBlend"> &
  Size;

export const SkiaCardOverlay = memo((props: CardOverlayProps) => {
  const image = useImage(props.overlay);

  return (
    <SkiaImage
      image={image}
      fit="cover"
      x={0}
      y={0}
      width={props.width}
      height={props.height}
      opacity={1}
      blendMode={props.overlayBlend ? "softLight" : undefined}
    />
  );
});

type CardCornerOverlayProps = Pick<CredentialCardConfig, "color"> & Size;

const CARD_CORNER_OVERLAY = require("../../../../../../img/features/itWallet/cards/overlay/card_corner.png");

export const SkiaCardCornerOverlay = memo(
  ({ width, height, color }: CardCornerOverlayProps) => {
    const image = useImage(CARD_CORNER_OVERLAY);

    return (
      <SkiaImage
        image={image}
        fit="fill"
        x={0}
        y={0}
        width={width}
        height={height}
      >
        <BlendColor color={color} mode="srcIn" />
      </SkiaImage>
    );
  }
);

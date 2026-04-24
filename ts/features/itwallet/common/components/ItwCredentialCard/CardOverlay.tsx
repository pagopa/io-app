import {
  BlendColor,
  Size,
  Image as SkiaImage,
  useImage
} from "@shopify/react-native-skia";
import { CredentialCardConfig } from "./config";

type CardOverlayProps = Required<Pick<CredentialCardConfig, "overlay">> &
  Pick<CredentialCardConfig, "overlayBlend"> &
  Size;

export const SkiaCardOverlay = (props: CardOverlayProps) => {
  const image = useImage(props.overlay);

  return (
    <SkiaImage
      image={image}
      fit="cover"
      x={0}
      y={0}
      width={props.width}
      height={props.height}
      blendMode={props.overlayBlend ? "softLight" : undefined}
    />
  );
};

type CardCornerOverlayProps = Pick<CredentialCardConfig, "color"> & Size;

export const SkiaCardCornerOverlay = ({
  width,
  height,
  color
}: CardCornerOverlayProps) => {
  const image = useImage(
    require("../../../../../../img/features/itWallet/cards/overlay/card_corner.png")
  );

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
};

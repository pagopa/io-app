import {
  BlendColor,
  Size,
  Image as SkiaImage
} from "@shopify/react-native-skia";
import { memo, useEffect } from "react";
import { Easing, useSharedValue, withTiming } from "react-native-reanimated";
import { CARD_CORNER_OVERLAY } from "../../utils/assets";
import { useCachedImage } from "../../utils/imageCache";
import { CredentialCardConfig } from "./config";

type CardOverlayProps = Required<Pick<CredentialCardConfig, "overlay">> &
  Pick<CredentialCardConfig, "overlayBlend"> &
  Size;

export const SkiaCardOverlay = memo((props: CardOverlayProps) => {
  const image = useCachedImage(props.overlay);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (image) {
      opacity.set(
        withTiming(1, { duration: 200, easing: Easing.out(Easing.ease) })
      );
    }
  }, [image, opacity]);

  return (
    <SkiaImage
      image={image}
      fit="cover"
      x={0}
      y={0}
      width={props.width}
      height={props.height}
      opacity={opacity}
      blendMode={props.overlayBlend ? "softLight" : undefined}
    />
  );
});

type CardCornerOverlayProps = Pick<CredentialCardConfig, "color"> & Size;

export const SkiaCardCornerOverlay = memo(
  ({ width, height, color }: CardCornerOverlayProps) => {
    const image = useCachedImage(CARD_CORNER_OVERLAY);
    const opacity = useSharedValue(0);

    useEffect(() => {
      if (image) {
        opacity.set(
          withTiming(1, { duration: 200, easing: Easing.out(Easing.ease) })
        );
      }
    }, [image, opacity]);

    return (
      <SkiaImage
        image={image}
        fit="fill"
        x={0}
        y={0}
        width={width}
        height={height}
        opacity={opacity}
      >
        <BlendColor color={color} mode="srcIn" />
      </SkiaImage>
    );
  }
);

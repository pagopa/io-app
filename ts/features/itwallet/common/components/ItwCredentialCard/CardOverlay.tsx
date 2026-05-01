import {
  BlendColor,
  DataSourceParam,
  Rect,
  Size,
  Image as SkiaImage,
  ImageShader as SkiaImageShader
} from "@shopify/react-native-skia";
import { memo, useEffect } from "react";
import { Easing, useSharedValue, withTiming } from "react-native-reanimated";
import { useCachedImage } from "../../utils/imageCache";
import { CredentialCardConfig } from "./config";

/**
 * Corner overlay image applied on all credentials that does not have fixed
 * background/ovarlays
 */
export const CREDENTIAL_CARD_CORNER_OVERLAY = require("../../../../../../img/features/itWallet/cards/overlay/card_corner.png");

type CardOverlayProps = { src: DataSourceParam } & Size;

export const SkiaCardOverlay = memo(
  ({ src, height, width }: CardOverlayProps) => {
    const image = useCachedImage(src);
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
        width={width}
        height={height}
        opacity={opacity}
      />
    );
  }
);

export const SkiaCardPatternOverlay = memo(
  ({ src, height, width }: CardOverlayProps) => {
    const image = useCachedImage(src);
    const opacity = useSharedValue(0);

    useEffect(() => {
      if (image) {
        opacity.set(
          withTiming(1, { duration: 200, easing: Easing.out(Easing.ease) })
        );
      }
    }, [image, opacity]);

    return (
      <Rect
        x={0}
        y={0}
        width={width}
        height={height}
        opacity={opacity}
        blendMode={"softLight"}
      >
        <SkiaImageShader
          image={image}
          fit={"contain"}
          tx={"repeat"}
          ty={"repeat"}
          rect={{ x: 0, y: 0, width: 20, height: 20 }}
        />
      </Rect>
    );
  }
);

type CardCornerOverlayProps = Pick<CredentialCardConfig, "color"> & Size;

export const SkiaCardCornerOverlay = memo(
  ({ width, height, color }: CardCornerOverlayProps) => {
    const image = useCachedImage(CREDENTIAL_CARD_CORNER_OVERLAY);
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

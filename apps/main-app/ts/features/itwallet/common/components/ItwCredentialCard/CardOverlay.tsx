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

type CardOverlayProps = Size & { src: DataSourceParam };

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
        fit="cover"
        height={height}
        image={image}
        opacity={opacity}
        width={width}
        x={0}
        y={0}
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
        blendMode={"softLight"}
        height={height}
        opacity={opacity}
        width={width}
        x={0}
        y={0}
      >
        <SkiaImageShader
          fit={"contain"}
          image={image}
          rect={{ x: 0, y: 0, width: 20, height: 20 }}
          tx={"repeat"}
          ty={"repeat"}
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
        fit="fill"
        height={height}
        image={image}
        opacity={opacity}
        width={width}
        x={0}
        y={0}
      >
        <BlendColor color={color} mode="srcIn" />
      </SkiaImage>
    );
  }
);

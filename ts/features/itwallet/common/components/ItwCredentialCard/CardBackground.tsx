import { IOColors } from "@pagopa/io-app-design-system";
import {
  BlendColor,
  Canvas,
  LinearGradient,
  RoundedRect,
  Size,
  Image as SkiaImage,
  useImage,
  vec
} from "@shopify/react-native-skia";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from "react-native-reanimated";
import { CredentialType } from "../../utils/itwMocksUtils";
import { CredentialCardConfig } from "./config";
import { CredentialCardSkiaBackground } from "./CredentialCardBackground";
import { CardColorScheme } from "./types";

type Props = Pick<
  CredentialCardConfig,
  "background" | "color" | "overlay" | "overlayBlend" | "showCornerOverlay"
>;

export const CardBackground = ({
  background,
  color,
  overlay,
  overlayBlend,
  showCornerOverlay
}: Props) => {
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });

  return (
    <View
      style={[
        StyleSheet.absoluteFillObject,
        { backgroundColor: IOColors.white }
      ]}
      onLayout={event => {
        setSize({
          width: event.nativeEvent.layout.width,
          height: event.nativeEvent.layout.height
        });
      }}
    >
      <Canvas style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <CredentialCardSkiaBackground
          bg={background}
          width={size.width}
          height={size.height}
        />
        {showCornerOverlay && size.width > 0 && size.height > 0 && (
          <SkiaCardCornerOverlay color={color} {...size} />
        )}
        {overlay && size.width > 0 && size.height > 0 && (
          <SkiaCardOverlay
            overlay={overlay}
            overlayBlend={overlayBlend}
            {...size}
          />
        )}
      </Canvas>
    </View>
  );
};

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

const legacyCredentialCardBackgrounds: { [type: string]: number } = {
  [CredentialType.EUROPEAN_DISABILITY_CARD]: require("../../../../../../img/features/itWallet/cards/dc.png"),
  [CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD]: require("../../../../../../img/features/itWallet/cards/ts.png"),
  [CredentialType.DRIVING_LICENSE]: require("../../../../../../img/features/itWallet/cards/mdl.png")
};

const legacyCredentialGradientColors: { [type: string]: Array<string> } = {
  [CredentialType.EDUCATION_DEGREE]: ["#F2F1CE", "#ECECEC"],
  [CredentialType.EDUCATION_ENROLLMENT]: ["#E0F2CE", "#ECECEC"],
  [CredentialType.RESIDENCY]: ["#F2E4CE", "#ECECEC"],
  [CredentialType.EDUCATION_DIPLOMA]: ["#F2F1CE", "#ECECEC"],
  [CredentialType.EDUCATION_ATTENDANCE]: ["#F2F1CE", "#ECECEC"]
};

type LegacyProps = {
  credentialType: string;
  colorScheme: CardColorScheme;
};

/**
 * @deprecated Only used for the older Documenti su IO, will be removed in the future
 */
export const LegacyCardBackground = ({
  credentialType,
  colorScheme
}: LegacyProps) => {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const image = useImage(legacyCredentialCardBackgrounds[credentialType]);
  const loadingOverlayOpacity = useSharedValue(1);

  const loadingOverlayOpacityTransition = useAnimatedStyle(() => ({
    opacity: withTiming(loadingOverlayOpacity.value, {
      duration: 200,
      easing: Easing.ease
    })
  }));

  useEffect(() => {
    if (image && size.width > 0 && size.height > 0) {
      // eslint-disable-next-line functional/immutable-data
      loadingOverlayOpacity.value = 0;
    }
  }, [image, loadingOverlayOpacity, size]);

  const gradientColors = legacyCredentialGradientColors[credentialType] || [
    IOColors["grey-100"],
    IOColors["grey-200"]
  ];

  return (
    <View
      style={[
        StyleSheet.absoluteFillObject,
        { backgroundColor: IOColors.white }
      ]}
      onLayout={event => {
        setSize({
          width: event.nativeEvent.layout.width,
          height: event.nativeEvent.layout.height
        });
      }}
    >
      <Animated.View
        style={[
          loadingOverlayOpacityTransition,
          StyleSheet.absoluteFillObject,
          { backgroundColor: IOColors["grey-100"] }
        ]}
      />
      <Canvas style={{ flex: 1 }}>
        {image ? (
          <SkiaImage
            image={image}
            fit="fill"
            width={size.width}
            height={size.height}
            opacity={colorScheme === "default" ? 1 : 0.4}
          >
            {colorScheme === "greyscale" && (
              <BlendColor color="white" mode="color" />
            )}
          </SkiaImage>
        ) : (
          <RoundedRect
            x={0}
            y={0}
            width={size.width}
            height={size.height}
            r={16}
          >
            <LinearGradient
              start={vec(0, 0)}
              end={vec(size.width, size.height)}
              colors={gradientColors}
            />
          </RoundedRect>
        )}
      </Canvas>
    </View>
  );
};

import { IOColors } from "@pagopa/io-app-design-system";
import {
  BlendColor,
  Canvas,
  Image,
  LinearGradient,
  RoundedRect,
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
import { CardColorScheme } from "./types";

type ItwCredentialCardBackgroundProps = {
  colorScheme: CardColorScheme;
  credentialType: string;
};

export const CardBackground = ({
  credentialType,
  colorScheme
}: ItwCredentialCardBackgroundProps) => {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const image = useImage(credentialCardBackgrounds[credentialType]);
  const loadingOverlayOpacity = useSharedValue(1);

  const loadingOverlayOpacityTransition = useAnimatedStyle(() => ({
    opacity: withTiming(loadingOverlayOpacity.value, {
      duration: 200,
      easing: Easing.ease
    })
  }));

  useEffect(() => {
    // Set loading ended only if we have an image and a size defined
    if (image && size.width > 0 && size.height > 0) {
      // eslint-disable-next-line functional/immutable-data
      loadingOverlayOpacity.value = 0;
    }
  }, [image, loadingOverlayOpacity, size]);

  return (
    <View
      onLayout={event => {
        setSize({
          width: event.nativeEvent.layout.width,
          height: event.nativeEvent.layout.height
        });
      }}
      style={[
        StyleSheet.absoluteFillObject,
        { backgroundColor: IOColors.white }
      ]}
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
          <Image
            fit="fill"
            height={size.height}
            image={image}
            opacity={colorScheme === "default" ? 1 : 0.4}
            width={size.width}
          >
            {colorScheme === "greyscale" && (
              <BlendColor color="white" mode="color" />
            )}
          </Image>
        ) : (
          <RoundedRect
            height={size.height}
            r={16}
            width={size.width}
            x={0}
            y={0}
          >
            <LinearGradient
              colors={
                credentialGradientColors[credentialType] ?? [
                  IOColors["grey-100"],
                  IOColors["grey-200"]
                ]
              }
              end={vec(size.width, size.height)}
              start={vec(0, 0)}
            />
          </RoundedRect>
        )}
      </Canvas>
    </View>
  );
};

const credentialCardBackgrounds: Record<string, string> = {
  [CredentialType.EUROPEAN_DISABILITY_CARD]: require("../../../../../../img/features/itWallet/cards/dc.png"),
  [CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD]: require("../../../../../../img/features/itWallet/cards/ts.png"),
  [CredentialType.DRIVING_LICENSE]: require("../../../../../../img/features/itWallet/cards/mdl.png")
};

export const credentialGradientColors: Record<string, Array<string>> = {
  [CredentialType.EDUCATION_DEGREE]: ["#F2F1CE", "#ECECEC"],
  [CredentialType.EDUCATION_ENROLLMENT]: ["#E0F2CE", "#ECECEC"],
  [CredentialType.RESIDENCY]: ["#F2E4CE", "#ECECEC"]
};

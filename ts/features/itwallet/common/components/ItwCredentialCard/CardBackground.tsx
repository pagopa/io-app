import { IOColors } from "@pagopa/io-app-design-system";
import {
  BlendColor,
  Canvas,
  Image,
  useImage
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
  credentialType: string;
  colorScheme: CardColorScheme;
};

export const CardBackground = ({
  credentialType,
  colorScheme
}: ItwCredentialCardBackgroundProps) => {
  const [size, setSize] = useState({ width: 400, height: 250 });
  const image = useImage(credentialCardBackgrounds[credentialType]);
  const opacity = useSharedValue(1);

  const opacityTransition = useAnimatedStyle(() => ({
    opacity: withTiming(opacity.value, {
      duration: 200,
      easing: Easing.ease
    })
  }));

  useEffect(() => {
    if (image) {
      // eslint-disable-next-line functional/immutable-data
      opacity.value = 0;
    }
  }, [image, opacity]);

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
      <Canvas style={{ flex: 1 }}>
        <Image
          image={image}
          fit="fill"
          width={size.width}
          height={size.height}
          opacity={colorScheme === "default" ? 1 : 0.4}
        >
          {colorScheme === "greyscale" && (
            <BlendColor color="white" mode="color" />
          )}
        </Image>
      </Canvas>
      <Animated.View
        style={[
          opacityTransition,
          StyleSheet.absoluteFillObject,
          { backgroundColor: IOColors["grey-100"] }
        ]}
      />
    </View>
  );
};

const credentialCardBackgrounds: {
  [type: string]: string;
} = {
  [CredentialType.EUROPEAN_DISABILITY_CARD]: require("../../../../../../img/features/itWallet/cards/dc.png"),
  [CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD]: require("../../../../../../img/features/itWallet/cards/ts.png"),
  [CredentialType.DRIVING_LICENSE]: require("../../../../../../img/features/itWallet/cards/mdl.png")
};

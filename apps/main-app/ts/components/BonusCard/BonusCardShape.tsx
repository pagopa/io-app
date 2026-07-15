import { IOColors, useIOTheme } from "@io-app/design-system";
import { ColorValue, StyleSheet, View } from "react-native";
import { Circle, ClipPath, Defs, Path, Rect, Svg } from "react-native-svg";

const CIRCLE_MASK_SIZE = 32;

type Props = {
  backgroundColor: ColorValue;
  mode: "draw-on-top" | "mask";
};

const BonusCardShape = ({ mode, backgroundColor }: Props) => {
  const theme = useIOTheme();

  switch (mode) {
    case "draw-on-top": {
      return (
        <View style={styles.container}>
          <Svg height="100%" width="100%">
            <Circle
              cx="0"
              cy="76%"
              fill={IOColors[theme["appBackground-primary"]]}
              r={CIRCLE_MASK_SIZE / 2}
            />
            <Circle
              cx="100%"
              cy="76%"
              fill={IOColors[theme["appBackground-primary"]]}
              r={CIRCLE_MASK_SIZE / 2}
            />
          </Svg>
          <Svg
            height="24"
            style={{
              position: "absolute",
              top: 0,
              left: 0
            }}
            width="24"
          >
            <Path
              d="M 0 24 A 24 24, 0, 0, 1, 24 0 L 0 0 Z"
              fill={IOColors[theme["appBackground-primary"]]}
            />
          </Svg>
          <Svg
            height="24"
            style={{
              position: "absolute",
              top: 0,
              right: 0
            }}
            width="24"
          >
            <Path
              d="M 0 0 A 24 24, 0, 0, 1, 24 24 L 24 0 Z"
              fill={IOColors[theme["appBackground-primary"]]}
            />
          </Svg>
          <Svg
            height="24"
            style={{
              position: "absolute",
              bottom: 0,
              right: 0
            }}
            width="24"
          >
            <Path
              d="M 24 0 A 24 24, 0, 0, 1, 0 24 L 24 24 Z"
              fill={IOColors[theme["appBackground-primary"]]}
            />
          </Svg>
          <Svg
            height="24"
            style={{
              position: "absolute",
              bottom: 0,
              left: 0
            }}
            width="24"
          >
            <Path
              d="M 24 24 A 24 24, 0, 0, 1, 0 0 L 0 24 Z"
              fill={IOColors[theme["appBackground-primary"]]}
            />
          </Svg>
        </View>
      );
    }
    case "mask": {
      return (
        <View style={styles.container}>
          <Svg height="100%" width="100%">
            <Defs>
              <ClipPath id="clip">
                <Circle cx="0" cy="76%" r={CIRCLE_MASK_SIZE / 2} />
                <Circle cx="100%" cy="76%" r={CIRCLE_MASK_SIZE / 2} />
                <Rect height="100%" width="100%" />
              </ClipPath>
            </Defs>
            <Rect
              clipPath="url(#clip)"
              fill={backgroundColor}
              height="100%"
              rx={24}
              ry={24}
              width="100%"
            />
          </Svg>
        </View>
      );
    }
  }
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0
  }
});

export { BonusCardShape };

import { IOColors } from "@pagopa/io-app-design-system";
import {
  Canvas,
  Circle,
  Group,
  LinearGradient,
  vec,
  Path
} from "@shopify/react-native-skia";
import { memo } from "react";
import { StyleSheet } from "react-native";

const CHECK_PATH = "M5.05493 7.95293L7.05154 9.86062L10.9449 6.14062";
const COLORS = [
  "#0B3EE3",
  "#436FFF",
  "#1E53FF",
  "#0B3EE3",
  "#2A5CFF",
  "#0B3EE3"
];
const SIZE = 16;

export const ItwCardValidityCheckMark = memo(() => {
  const center = vec(SIZE / 2, SIZE / 2);
  const radius = SIZE / 2;

  return (
    <Canvas style={styles.box}>
      <Group>
        <Circle cx={center.x} cy={center.y} r={radius}>
          <LinearGradient
            start={vec(0, SIZE)}
            end={vec(SIZE, 0)}
            colors={COLORS}
          />
        </Circle>
        <Path
          path={CHECK_PATH}
          color={IOColors["turquoise-150"]}
          strokeWidth={1}
          style="stroke"
          strokeJoin="round"
          strokeCap="round"
        />
      </Group>
    </Canvas>
  );
});

const styles = StyleSheet.create({
  box: {
    width: SIZE,
    height: SIZE
  }
});

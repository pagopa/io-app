import { View } from "native-base";
import * as React from "react";

import { styles } from "./Pinpad.style";

interface PlaceholderProps {
  color: string;
}

export const Bullet: React.SFC<PlaceholderProps> = ({ color }) => (
  <View style={styles.placeholder}>
    <View style={[styles.placeholderBullet, { backgroundColor: color }]} />
  </View>
);

export const Baseline: React.SFC<PlaceholderProps> = ({ color }) => (
  <View
    style={[
      styles.placeholder,
      styles.placeholderBaseline,
      { borderBottomColor: color }
    ]}
  />
);

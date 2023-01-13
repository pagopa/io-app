import * as React from "react";
import { View, StyleSheet, Text } from "react-native";
import {
  Spacer,
  SpacerOrientation
} from "../../../components/core/spacer/Spacer";
import { IOColors } from "../../../components/core/variables/IOColors";
import type { IOSpacer } from "../../../components/core/variables/IOSpacing";

const styles = StyleSheet.create({
  spacerWrapper: {
    backgroundColor: IOColors.greyLight
  },
  componentLabel: {
    fontSize: 9,
    color: IOColors.bluegrey
  }
});

type DSSpacerViewerBoxProps = {
  size: IOSpacer;
  orientation?: SpacerOrientation;
};

export const DSSpacerViewerBox = ({
  size,
  orientation = "vertical"
}: DSSpacerViewerBoxProps) => (
  <View
    style={
      orientation === "horizontal"
        ? { flexDirection: "row", marginRight: 16 }
        : { flexDirection: "column", marginBottom: 20 }
    }
  >
    <View
      style={[
        styles.spacerWrapper,
        orientation === "horizontal" ? { height: 75 } : {}
      ]}
    >
      <Spacer size={size} orientation={orientation} />
    </View>
    {size && (
      <View
        style={
          orientation === "horizontal"
            ? { flexDirection: "column", marginLeft: 4 }
            : { flexDirection: "row", marginTop: 4 }
        }
      >
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={styles.componentLabel}
        >
          {size}
        </Text>
      </View>
    )}
  </View>
);

import * as React from "react";
import { View, StyleSheet, Text } from "react-native";
import {
  VSpacer,
  HSpacer,
  SpacerOrientation
} from "../../../components/core/spacer/Spacer";
import { IOColors } from "../../../components/core/variables/IOColors";
import type { IOSpacer } from "../../../components/core/variables/IOSpacing";

const styles = StyleSheet.create({
  spacerWrapper: {
    backgroundColor: IOColors["grey-100"]
  },
  componentLabel: {
    fontSize: 9,
    color: IOColors["grey-700"]
  }
});

type DSSpacerViewerBoxProps = {
  size: IOSpacer;
  orientation?: SpacerOrientation;
};

type DSSpacerLabelProps = {
  value: IOSpacer;
};

const DSSpacerLabel = ({ value }: DSSpacerLabelProps) => (
  <Text numberOfLines={1} ellipsizeMode="tail" style={styles.componentLabel}>
    {value}
  </Text>
);

export const DSSpacerViewerBox = ({
  size,
  orientation = "vertical"
}: DSSpacerViewerBoxProps) => (
  <>
    {orientation === "vertical" ? (
      <View style={{ flexDirection: "column" }}>
        <View style={styles.spacerWrapper}>
          <VSpacer size={size} />
        </View>
        {size && (
          <View style={{ flexDirection: "row", marginTop: 4 }}>
            <DSSpacerLabel value={size} />
          </View>
        )}
      </View>
    ) : (
      <View style={{ flexDirection: "row" }}>
        <View style={[styles.spacerWrapper, { height: 75 }]}>
          <HSpacer size={size} />
        </View>
        {size && (
          <View style={{ flexDirection: "column", marginLeft: 4 }}>
            <DSSpacerLabel value={size} />
          </View>
        )}
      </View>
    )}
  </>
);

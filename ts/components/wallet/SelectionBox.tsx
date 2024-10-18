import React from "react";
import { View, StyleSheet } from "react-native";
import { H6, IOColors, LabelSmall } from "@pagopa/io-app-design-system";
import TouchableDefaultOpacity from "../TouchableDefaultOpacity";

type Props = {
  logo?: React.ReactNode;
  mainText: string;
  subText: string;
  ctaText?: string;
  onPress?: () => void;
  accessibilityLabel?: string;
};

const styles = StyleSheet.create({
  selectionBox: {
    borderWidth: 1,
    borderColor: IOColors.bluegreyLight,
    borderRadius: 8,
    padding: 16,
    flexDirection: "row",
    alignItems: "center"
  },

  selectionBoxIcon: {
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: "auto",
    paddingRight: 16
  },

  selectionBoxContent: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "100%"
  },

  selectionBoxTrail: {
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: "auto",
    paddingLeft: 16
  }
});

/**
 * A bordered and rounded box made up by three columns:
 * - The first one containing an icon
 * - The second one with a title and a subtitle
 * - The third one containing a CTA
 */
export const SelectionBox = (props: Props) => (
  <TouchableDefaultOpacity
    disabled={!props.onPress}
    onPress={props.onPress}
    accessibilityLabel={props.accessibilityLabel}
    accessible={props.accessibilityLabel !== undefined}
  >
    <View style={styles.selectionBox}>
      {props.logo && <View style={styles.selectionBoxIcon}>{props.logo}</View>}

      <View style={styles.selectionBoxContent}>
        <H6 numberOfLines={1}>{props.mainText}</H6>
        <LabelSmall numberOfLines={1} color="bluegrey" weight="Regular">
          {props.subText}
        </LabelSmall>
      </View>

      {props.ctaText && (
        <View style={styles.selectionBoxTrail}>
          <H6 color="blue" weight="Semibold">
            {props.ctaText}
          </H6>
        </View>
      )}
    </View>
  </TouchableDefaultOpacity>
);

import React from "react";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import { H4 } from "../core/typography/H4";
import { LabelSmall } from "../core/typography/LabelSmall";
import { IOColors } from "../core/variables/IOColors";

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
    paddingRight: 24
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
    paddingLeft: 24
  }
});

/**
 * A bordered and rounded box made up by three columns:
 * - The first one containing an icon
 * - The second one with a title and a subtitle
 * - The third one containing a CTA
 */
export const SelectionBox = (props: Props) => (
  <TouchableOpacity
    disabled={!props.onPress}
    onPress={props.onPress}
    accessibilityLabel={props.accessibilityLabel}
    accessible={props.accessibilityLabel !== undefined}
  >
    <View style={styles.selectionBox}>
      {props.logo && <View style={styles.selectionBoxIcon}>{props.logo}</View>}

      <View style={styles.selectionBoxContent}>
        <H4 numberOfLines={1}>{props.mainText}</H4>
        <LabelSmall numberOfLines={1} color="bluegrey" weight="Regular">
          {props.subText}
        </LabelSmall>
      </View>

      {props.ctaText && (
        <View style={styles.selectionBoxTrail}>
          <H4 color="blue" weight="SemiBold">
            {props.ctaText}
          </H4>
        </View>
      )}
    </View>
  </TouchableOpacity>
);

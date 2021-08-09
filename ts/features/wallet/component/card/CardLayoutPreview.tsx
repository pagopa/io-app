import { View } from "native-base";
import * as React from "react";
import { AccessibilityProps, Platform, StyleSheet } from "react-native";
import TouchableDefaultOpacity from "../../../../components/TouchableDefaultOpacity";
import variables from "../../../../theme/variables";

type Props = {
  left: React.ReactNode;
  right: React.ReactNode;
  onPress?: () => void;
} & AccessibilityProps;

const styles = StyleSheet.create({
  card: {
    // iOS and Android card shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
    elevation: -7,
    zIndex: -7,
    backgroundColor: variables.brandGray,
    borderRadius: 8,
    marginLeft: 0,
    marginRight: 0
  },
  cardInner: {
    paddingBottom: 16,
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 18
  },
  row: {
    flexDirection: "row"
  },
  spaced: {
    justifyContent: "space-between"
  },

  rotatedCard: {
    shadowColor: "#000",
    marginBottom: -30,
    flex: 1,
    shadowRadius: 10,
    shadowOpacity: 0.15,
    transform: [{ perspective: 1200 }, { rotateX: "-20deg" }, { scaleX: 0.99 }],
    height: 95
  },
  shadowBox: {
    marginBottom: -15,
    borderRadius: 8,
    borderTopWidth: 8,
    borderTopColor: "rgba(0,0,0,0.1)",
    height: 15
  }
});

/**
 * A preview card layout that generalizes a card preview for a payment method layout.
 * Can be used to render a generic wallet preview card.
 * @param props
 * @constructor
 */
export const CardLayoutPreview: React.FunctionComponent<Props> = props => (
  <>
    {/* In order to render the shadow on android */}
    {Platform.OS === "android" && <View style={styles.shadowBox} />}
    <TouchableDefaultOpacity
      {...props}
      accessible={true}
      accessibilityRole={"button"}
      style={styles.rotatedCard}
      testID={"cardPreview"}
    >
      <View style={[styles.card]}>
        <View style={[styles.cardInner]}>
          <View style={[styles.row, styles.spaced]}>
            {props.left}
            {props.right}
          </View>
          <View spacer={true} />
        </View>
      </View>
    </TouchableDefaultOpacity>
  </>
);

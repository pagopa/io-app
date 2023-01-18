import * as React from "react";
import { View, Platform, StyleSheet } from "react-native";
import { widthPercentageToDP } from "react-native-responsive-screen";
import customVariables from "../../../../theme/variables";
import { TestID } from "../../../../types/WithTestID";
import {
  IOColors,
  hexToRgba
} from "../../../../components/core/variables/IOColors";

type Props = {
  topLeftCorner: React.ReactNode;
  bottomLeftCorner: React.ReactNode;
  bottomRightCorner: React.ReactNode;
  accessibilityLabel?: string;
} & TestID;

const opaqueBorderColor = hexToRgba(IOColors.black, 0.1);

const styles = StyleSheet.create({
  cardBox: {
    height: 192,
    width: widthPercentageToDP("90%"),
    maxWidth: 343,
    paddingHorizontal: customVariables.contentPadding,
    paddingTop: 20,
    paddingBottom: 22,
    flexDirection: "column",
    justifyContent: "space-between",
    backgroundColor: IOColors.greyUltraLight,
    borderRadius: 8,
    shadowColor: IOColors.black,
    shadowOffset: {
      width: 0,
      height: 3
    },
    shadowOpacity: 0.18,
    shadowRadius: 4.65,
    zIndex: 7,
    elevation: 7
  },
  shadowBox: {
    marginBottom: -13,
    borderRadius: 8,
    borderTopWidth: 10,
    borderTopColor: opaqueBorderColor,
    height: 15,
    width: widthPercentageToDP("90%"),
    maxWidth: 343
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end"
  }
});

/**
 * The base component that represents a full bancomat card
 * @param props
 * @constructor
 */
const BaseCardComponent: React.FunctionComponent<Props> = (props: Props) => (
  <>
    {Platform.OS === "android" && <View style={styles.shadowBox} />}
    <View
      style={styles.cardBox}
      testID={props.testID}
      accessibilityLabel={props.accessibilityLabel}
      accessible={props.accessibilityLabel !== undefined}
    >
      <View>{props.topLeftCorner}</View>
      <View style={styles.bottomRow}>
        {props.bottomLeftCorner}
        {props.bottomRightCorner}
      </View>
    </View>
  </>
);

export default BaseCardComponent;

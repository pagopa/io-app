import { View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { H4 } from "../../../../components/core/typography/H4";
import { H5 } from "../../../../components/core/typography/H5";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import { TestID } from "../../../../types/WithTestID";

type Props = {
  title: string;
  description: string;
  rightElement: React.ReactNode;
} & TestID;

const styles = StyleSheet.create({
  row: {
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between"
  },
  left: {
    ...IOStyles.flex,
    paddingRight: 8
  }
});

/**
 * The base layout for the Payment feature list items, used to compose the different functionalities
 * @param props
 * @constructor
 */
export const BasePaymentFeatureListItem = (
  props: Props
): React.ReactElement => (
  <View style={styles.row} testID={props.testID}>
    <View style={styles.left}>
      <H4 weight={"SemiBold"} color={"bluegreyDark"}>
        {props.title}
      </H4>
      <H5 weight={"Regular"} color={"bluegrey"}>
        {props.description}
      </H5>
    </View>
    {props.rightElement}
  </View>
);

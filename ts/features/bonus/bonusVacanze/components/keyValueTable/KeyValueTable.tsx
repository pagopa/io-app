import React from "react";
import { View, StyleProp, StyleSheet, TextStyle } from "react-native";
import { VSpacer } from "../../../../../components/core/spacer/Spacer";
import { Body } from "../../../../../components/core/typography/Body";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";

type Props = {
  // flex proportion of left column
  leftFlex: number;
  // flex proportion of right column
  rightFlex: number;
  rows: ReadonlyArray<KeyValueRow>;
};

export type KeyValueRow = {
  key: KeyValueEntry;
  value: KeyValueEntry;
};

export type KeyValueEntry = {
  text: string;
  style?: StyleProp<TextStyle>;
};

type ColumnWidthStyle = {
  left: StyleProp<TextStyle>;
  right: StyleProp<TextStyle>;
};

const styles = StyleSheet.create({
  right: {
    textAlign: "right"
  }
});

export const keyValueTableStyle = styles;

const row = (kvRow: KeyValueRow, columnWidthStyle: ColumnWidthStyle) => (
  <View
    style={IOStyles.rowSpaceBetween}
    key={kvRow.key.text + kvRow.value.text}
    accessible={true}
  >
    <VSpacer size={8} />
    <Body style={[kvRow.key.style, columnWidthStyle.left]}>
      {kvRow.key.text}
    </Body>
    <Body style={[kvRow.value.style, styles.right, columnWidthStyle.right]}>
      {kvRow.value.text}
    </Body>
  </View>
);

/**
 * A common component used to have a base layout for table with rows composed by a key/value couple.
 * All the common layout behaviour for all the table are unified here, for example the padding and flex settings.
 * @param props
 * @constructor
 */
export const KeyValueTable: React.FunctionComponent<Props> = props => {
  const columnWidthStyle = {
    left: {
      flex: props.leftFlex
    },
    right: {
      flex: props.rightFlex
    }
  };

  return <View>{props.rows.map(r => row(r, columnWidthStyle))}</View>;
};

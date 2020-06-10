import { Text, View } from "native-base";
import React from "react";
import { StyleProp, StyleSheet, TextStyle } from "react-native";
import themeVariables from "../../../../theme/variables";

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
    textAlign: "right",
    alignSelf: "flex-end"
  },
  baseRow: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  row: {
    paddingLeft:
      themeVariables.contentPadding + themeVariables.contentPadding / 2,
    paddingRight: themeVariables.contentPadding,
    paddingTop: themeVariables.spacerSmallHeight
  },
  header: {
    paddingLeft: themeVariables.contentPadding,
    paddingRight: themeVariables.contentPadding
  }
});

export const keyValueTableStyle = styles;

const row = (kvrow: KeyValueRow, columnWidthStyle: ColumnWidthStyle) => (
  <View
    style={[styles.row, styles.baseRow]}
    key={kvrow.key.text + kvrow.value.text}
  >
    <Text style={[kvrow.key.style, columnWidthStyle.left]}>
      {kvrow.key.text}
    </Text>
    <Text style={[kvrow.value.style, styles.right, columnWidthStyle.right]}>
      {kvrow.value.text}
    </Text>
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

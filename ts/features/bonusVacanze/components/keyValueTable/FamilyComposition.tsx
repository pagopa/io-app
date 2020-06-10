import { Text, View } from "native-base";
import React from "react";
import { StyleSheet } from "react-native";
import { FamilyMembers } from "../../../../../definitions/bonus_vacanze/FamilyMembers";
import themeVariables from "../../../../theme/variables";

type Props = {
  familyMembers: FamilyMembers;
};

const styles = StyleSheet.create({
  left: {
    flex: 1
  },
  right: {
    flex: 1,
    textAlign: "right",
    alignSelf: "flex-end",
    fontWeight: "bold"
  },
  baseRow: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  titleRow: {
    paddingLeft: themeVariables.contentPadding,
    paddingRight: themeVariables.contentPadding
  },
  row: {
    paddingLeft:
      themeVariables.contentPadding + themeVariables.contentPadding / 2,
    paddingRight: themeVariables.contentPadding,
    paddingTop: themeVariables.spacerSmallHeight
  }
});

const header = (title: string) => (
  <Text style={styles.titleRow} bold={true}>
    {title}
  </Text>
);

const row = (key: string, value: string) => (
  <View style={[styles.row, styles.baseRow]} key={key + value}>
    <Text style={styles.left}>{key}</Text>
    <Text style={styles.right}>{value}</Text>
  </View>
);

/**
 * This component display a table containing the family composition.
 * For each family member are displayed the name, surname and fiscal code.
 * @param props
 * @constructor
 */
export const FamilyComposition: React.FunctionComponent<Props> = props => {
  const title = "Chi può riscuotere il bonus:";

  return (
    <View>
      {header(title)}
      {props.familyMembers.map(fm =>
        row(`${fm.name} ${fm.surname}`, fm.fiscal_code)
      )}
    </View>
  );
};

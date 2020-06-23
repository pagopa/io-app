import { Text, View } from "native-base";
import React from "react";
import { StyleSheet } from "react-native";
import { FamilyMembers } from "../../../../../definitions/bonus_vacanze/FamilyMembers";
import I18n from "../../../../i18n";
import themeVariables from "../../../../theme/variables";
import {
  KeyValueRow,
  KeyValueTable,
  keyValueTableStyle
} from "./KeyValueTable";

type Props = {
  familyMembers: FamilyMembers;
};

const styles = StyleSheet.create({
  bold: {
    fontWeight: themeVariables.headerBodyFontWeight
  }
});

const header = (title: string) => (
  <Text style={[keyValueTableStyle.baseRow]} bold={true}>
    {title}
  </Text>
);

const getRow = (k: string, v: string): KeyValueRow => ({
  key: {
    text: k
  },
  value: {
    text: v,
    style: styles.bold
  }
});

/**
 * This component display a table containing the family composition.
 * For each family member are displayed the name, surname and fiscal code.
 * @param props
 * @constructor
 */
export const FamilyComposition: React.FunctionComponent<Props> = props => {
  const title = I18n.t("bonus.bonusVacanze.family.title");

  return (
    <View>
      {header(title)}
      <KeyValueTable
        leftFlex={1}
        rightFlex={1}
        rows={props.familyMembers.map(fm =>
          getRow(`${fm.name} ${fm.surname}`, fm.fiscal_code)
        )}
      />
    </View>
  );
};

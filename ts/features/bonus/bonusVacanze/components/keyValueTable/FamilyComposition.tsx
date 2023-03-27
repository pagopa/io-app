import { Text as NBText } from "native-base";
import React from "react";
import { View, Platform, StyleSheet } from "react-native";
import { FamilyMembers } from "../../../../../../definitions/bonus_vacanze/FamilyMembers";
import I18n from "../../../../../i18n";
import { makeFontStyleObject } from "../../../../../theme/fonts";
import themeVariables from "../../../../../theme/variables";
import {
  KeyValueRow,
  KeyValueTable,
  keyValueTableStyle
} from "./KeyValueTable";

type Props = {
  familyMembers: FamilyMembers;
};

const styles = StyleSheet.create({
  left: {
    paddingRight: themeVariables.spacerWidth
  },
  right: {
    fontWeight: "600",
    letterSpacing: 0.5,
    ...makeFontStyleObject(Platform.select, undefined, undefined, "RobotoMono")
  }
});

const header = (title: string) => (
  <NBText style={keyValueTableStyle.baseRow} bold={true}>
    {title}
  </NBText>
);

const getRow = (k: string, v: string): KeyValueRow => ({
  key: {
    text: k,
    style: styles.left
  },
  value: {
    text: v,
    style: styles.right
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
        rightFlex={0}
        rows={props.familyMembers.map(fm =>
          getRow(`${fm.name} ${fm.surname}`, fm.fiscal_code)
        )}
      />
    </View>
  );
};

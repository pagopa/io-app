import React, { FC } from "react";
import { StyleSheet } from "react-native";
import { View } from "native-base";
import I18n from "../../../i18n";
import { RawCheckBox } from "../selection/RawCheckBox";
import { Label } from "../typography/Label";
import { IOStyles } from "../variables/IOStyles";
import Accordion from "../../ui/Accordion";

export enum CheckboxIDs {
  sendScreenshot = "sendScreenshot",
  sendPersonalInfo = "sendPersonalInfo"
}

type Props = {
  target: CheckboxIDs;
  isChecked?: boolean;
  onToggle: () => void;
};

const styles = StyleSheet.create({
  checkBoxContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-evenly"
  }
});

type CheckboxLabelMap = {
  [key in CheckboxIDs]: {
    cta: string;
    accordion?: {
      title: string;
      content: string;
    };
  };
};

const CheckboxLabelKeys: CheckboxLabelMap = {
  sendScreenshot: {
    cta: I18n.t("contextualHelp.sendScreenshot.cta")
  },
  sendPersonalInfo: {
    cta: I18n.t("contextualHelp.sendPersonalInfo.cta"),
    accordion: {
      title: I18n.t("contextualHelp.sendPersonalInfo.informativeTitle"),
      content: I18n.t("contextualHelp.sendPersonalInfo.informativeDescription")
    }
  }
};

/**
 * Component useful to display a checkbox block
 * @param props
 */
const CheckBoxFormItem: FC<Props> = ({
  target,
  isChecked,
  onToggle
}: Props) => (
  <View style={styles.checkBoxContainer}>
    <RawCheckBox checked={isChecked} onPress={onToggle} />
    <View hspacer />
    <View style={IOStyles.flex}>
      <Label color={"bluegrey"} weight={"Regular"} onPress={onToggle}>
        {CheckboxLabelKeys[target].cta}
      </Label>
      {"accordion" in CheckboxLabelKeys[target] && (
        <Accordion
          title={CheckboxLabelKeys[target].accordion?.title || ""}
          content={CheckboxLabelKeys[target].accordion?.content || ""}
        />
      )}
    </View>
  </View>
);

export default CheckBoxFormItem;

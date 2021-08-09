import { View } from "native-base";
import React from "react";
import { StyleSheet } from "react-native";

import I18n from "../../i18n";
import { RawCheckBox } from "../core/selection/checkbox/RawCheckBox";

import { IOStyles } from "../core/variables/IOStyles";
import { Label } from "../core/typography/Label";
import Accordion from "../ui/Accordion";

/**
 * Checkboxes we need as of now
 */
export enum CheckboxIDs {
  sendScreenshot = "sendScreenshot",
  sendPersonalInfo = "sendPersonalInfo"
}

type CheckboxLabelMap = {
  [key in CheckboxIDs]: {
    cta: string;
    accordion?: {
      title: string;
      content: string;
    };
  };
};

const checkboxStyle = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-evenly"
  }
});

type Props = {
  target: CheckboxIDs;
  isChecked?: boolean;
  onToggle: () => void;
};

const checkboxLabelMapFactory = (): CheckboxLabelMap => ({
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
});

/**
 * Checkbox+Label+Optional Accordion component
 */
const CheckboxFormEntry: React.FC<Props> = ({
  target,
  isChecked,
  onToggle
}) => {
  const checkboxLabelKeys = checkboxLabelMapFactory();
  const accordion = checkboxLabelKeys[target].accordion;

  return (
    <View style={checkboxStyle.container}>
      <RawCheckBox checked={isChecked} onPress={onToggle} />
      <View hspacer />
      <View style={IOStyles.flex}>
        <Label
          testID="ContextualHelpCheckboxFormEntryLabel"
          color={"bluegrey"}
          weight={"Regular"}
          onPress={onToggle}
        >
          {checkboxLabelKeys[target].cta}
        </Label>
        {accordion && (
          <Accordion title={accordion.title} content={accordion.content} />
        )}
      </View>
    </View>
  );
};

export default CheckboxFormEntry;

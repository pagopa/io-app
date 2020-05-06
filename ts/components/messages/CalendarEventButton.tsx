import { Text } from "native-base";
import React, { ComponentProps } from "react";
import { Dimensions, StyleSheet } from "react-native";

import I18n from "../../i18n";
import customVariables from "../../theme/variables";
import ButtonDefaultOpacity from "../ButtonDefaultOpacity";
import IconFont from "../ui/IconFont";

type Props = {
  isEventInDeviceCalendar: boolean;
  small?: boolean;
  disabled?: boolean;
  onPress: ComponentProps<typeof ButtonDefaultOpacity>["onPress"];
};

const baseStyles = StyleSheet.create({
  button: {
    flex: 5,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 0,
    paddingBottom: 0,
    height: 40
  },

  icon: {
    lineHeight: 24
  },

  text: {
    paddingRight: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    fontSize: 14,
    lineHeight: 20
  }
});

const validStyles = StyleSheet.create({
  button: {
    backgroundColor: customVariables.colorWhite,
    borderWidth: 1,
    borderColor: customVariables.brandPrimary
  },

  icon: {
    color: customVariables.brandPrimary
  },

  text: {
    color: customVariables.brandPrimary
  }
});

const smallStyles = StyleSheet.create({
  button: {
    height: 32
  },

  icon: {},

  text: {}
});

const disabledStyles = StyleSheet.create({
  button: {
    backgroundColor: "#b5b5b5",
    borderWidth: 0
  },

  icon: {
    color: customVariables.colorWhite
  },

  text: {
    color: customVariables.colorWhite
  }
});

const screenWidth = Dimensions.get("window").width;
const minScreenWidth = 320;
// On small devices use short label
const reminderText = I18n.t(
  screenWidth <= minScreenWidth
    ? "messages.cta.reminderShort"
    : "messages.cta.reminder"
);

class CalendarEventButton extends React.PureComponent<Props> {
  public render() {
    const { isEventInDeviceCalendar, small, disabled, onPress } = this.props;
    const iconName = isEventInDeviceCalendar ? "io-tick-big" : "io-plus";
    return (
      <ButtonDefaultOpacity
        disabled={disabled}
        onPress={onPress}
        style={[
          baseStyles.button,
          validStyles.button,
          small && smallStyles.button,
          disabled && disabledStyles.button
        ]}
      >
        <IconFont
          name={iconName}
          style={[
            baseStyles.icon,
            validStyles.icon,
            small && smallStyles.icon,
            disabled && disabledStyles.icon
          ]}
        />

        <Text
          style={[
            baseStyles.text,
            validStyles.text,
            small && smallStyles.text,
            disabled && disabledStyles.text
          ]}
        >
          {reminderText}
        </Text>
      </ButtonDefaultOpacity>
    );
  }
}

export default CalendarEventButton;

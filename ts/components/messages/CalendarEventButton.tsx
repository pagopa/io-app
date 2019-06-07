import { Button, Text } from "native-base";
import { connectStyle } from "native-base-shoutem-theme";
import mapPropsToStyleNames from "native-base/src/utils/mapPropsToStyleNames";
import React, { ComponentProps } from "react";

import I18n from "../../i18n";
import IconFont from "../ui/IconFont";

type Props = {
  isEventInDeviceCalendar: boolean;
  small?: boolean;
  disabled?: boolean;
  onPress: ComponentProps<typeof Button>["onPress"];
};

class CalendarEventButton extends React.PureComponent<Props> {
  public render() {
    const { isEventInDeviceCalendar, small, onPress } = this.props;

    const buttonIcon = isEventInDeviceCalendar ? (
      <IconFont name={"io-tick-big"} />
    ) : (
      <IconFont name={"io-plus"} />
    );

    return (
      <Button onPress={onPress}>
        {buttonIcon}
        <Text>{I18n.t("messages.cta.reminderShort")}</Text>
      </Button>
    );
  }
}

export default connectStyle(
  "UIComponent.CalendarEventButton",
  {},
  mapPropsToStyleNames
)(CalendarEventButton);

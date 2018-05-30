import * as React from "react";

import moment from "moment";
import { Icon, Left, ListItem, Right, Text } from "native-base";
import { connectStyle } from "native-base-shoutem-theme";
import mapPropsToStyleNames from "native-base/src/Utils/mapPropsToStyleNames";
import I18n from "../i18n";

export type OwnProps = {
  sender: string;
  subject: string;
  key: string;
  date: string;
};

export type Props = OwnProps;

/**
 * Implements a component that show a message in the MessagesScreen List
 */
class MessageComponent extends React.Component<Props> {
  public formatDate(date: string): string {
    moment.locales();
    const dateStringToNumber = +date;
    const messageDate = moment(new Date(dateStringToNumber * 1000)).format();
    if (
      moment(messageDate, "YYYYMMDDh")
        .fromNow()
        .includes("hours ago") === true ||
      moment(messageDate, "YYYYMMDDh")
        .fromNow()
        .includes("hour ago") === true ||
      moment(messageDate, "YYYYMMDDh")
        .fromNow()
        .includes("minutes ago") === true ||
      moment(messageDate, "YYYYMMDDh")
        .fromNow()
        .includes("minute ago") === true
    ) {
      return moment(messageDate).format("H.mm");
    } else if (
      moment(messageDate, "YYYYMMDDh")
        .fromNow()
        .includes("a day ago") === true
    ) {
      return I18n.t("messages.yesterday");
    } else if (
      moment(messageDate, "YYYYMMDDh")
        .fromNow()
        .includes("year") === true ||
      moment(messageDate, "YYYYMMDDh")
        .fromNow()
        .includes("years") === true
    ) {
      return moment(messageDate).format("D/MM/YY");
    } else {
      return moment(messageDate).format("D/MM");
    }
  }

  public render() {
    const { subject, sender, date, key } = this.props;
    return (
      <ListItem key={key}>
        <Left>
          <Text leftAlign={true} bold={true}>
            {sender}
          </Text>
          <Text leftAlign={true}>{subject}</Text>
        </Left>
        <Right>
          <Text dateFormat={true}>{this.formatDate(date)}</Text>
          <Icon rightArrow={true} name="chevron-right" />
        </Right>
      </ListItem>
    );
  }
}

const StyledMessageComponent = connectStyle(
  "NativeBase.MessageComponent",
  {},
  mapPropsToStyleNames
)(MessageComponent);
export default StyledMessageComponent;

import * as React from "react";

import { Icon, Left, ListItem, Right, Text } from "native-base";
import { connectStyle } from "native-base-shoutem-theme";
import mapPropsToStyleNames from "native-base/src/Utils/mapPropsToStyleNames";

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
    const messageDate = new Date(date * 1000);
    const nowDate = new Date();
    const nowYear = nowDate.getFullYear();
    const nowDateD = nowDate.getDate();
    const months: ReadonlyArray<string> = [
      "01",
      "02",
      "03",
      "04",
      "05",
      "06",
      "07",
      "08",
      "09",
      "10",
      "11",
      "12"
    ];
    const nowDateM = months[nowDate.getUTCMonth()];
    const year = messageDate.getFullYear();
    const day = messageDate.getDate();
    const month = months[messageDate.getUTCMonth()];
    const hour = messageDate.getHours();
    const min = messageDate.getMinutes();

    if (nowYear === year && nowDateM === month && nowDateD === day) {
      if (min < 9) {
        return `${hour - 2}.0${min}`;
      } else {
        return `${hour - 2}.${min}`;
      }
    } else {
      if (nowYear === year && nowDateM === month && nowDateD - 1 === day) {
        return "ieri";
      } else {
        return `${day}/${month}`;
      }
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

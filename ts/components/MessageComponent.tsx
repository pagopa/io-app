import * as React from "react";

import { Icon, Left, ListItem, Right, Text } from "native-base";
import { connectStyle } from "native-base-shoutem-theme";
import mapPropsToStyleNames from "native-base/src/Utils/mapPropsToStyleNames";
import { ServicesState } from "../store/reducers/entities/services";
import { convertDateToDistance } from "../utils/convertDateToDistance";

export type OwnProps = Readonly<{
  sender: string;
  subject: string;
  key: string;
  date: string;
  services: ServicesState;
}>;

export type Props = OwnProps;

/**
 * Implements a component that show a message in the MessagesScreen List
 */
class MessageComponent extends React.Component<Props> {
  public getSenderName(senderId: string, services: ServicesState): string {
    return services.byId[senderId].organization_name;
  }

  public render() {
    const { subject, sender, date, key, services } = this.props;
    return (
      <ListItem key={key}>
        <Left>
          <Text leftAlign={true} boldSender={true}>
            {this.getSenderName(sender, services)}
          </Text>
          <Text leftAlign={true}>{subject}</Text>
        </Left>
        <Right>
          <Text dateFormat={true}>{convertDateToDistance(date)}</Text>
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

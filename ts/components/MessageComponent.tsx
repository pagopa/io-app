import * as React from "react";

import { format } from "date-fns";
import distanceInWordsToNow from "date-fns/distance_in_words_to_now";
import { Icon, Left, ListItem, Right, Text } from "native-base";
import { connectStyle } from "native-base-shoutem-theme";
//import mapPropsToStyleNames from "native-base/src/Utils/mapPropsToStyleNames";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import ROUTES from "../navigation/routes";
import I18n from "../i18n";
import { ServicesState } from "../store/reducers/entities/services";

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
  // Convert the distance from now to date in : H.mm, yesterday, D/MM/YY and DD/MM
  public convertDateToDistance(date: string): string {
    const distance = distanceInWordsToNow(new Date(date));
    // 0h < distance < 23h
    if (
      distance.includes("hours") === true ||
      distance.includes("hour") === true ||
      distance.includes("minutes ") === true ||
      distance.includes("minute") === true ||
      distance.includes("seconds") === true
    ) {
      return format(new Date(date), "H.mm");
    } // 24h < distance < 47h
    else if (distance.includes("1 day") === true) {
      return I18n.t("messages.yesterday");
    } // distance > current year
    else if (
      distance.includes("year") === true ||
      distance.includes("years") === true
    ) {
      return format(new Date(date), "D/MM/YY");
    } // distance > 48h
    else {
      return format(new Date(date), "DD/MM");
    }
  }

  public getSenderName(senderId: string, services: ServicesState): string {
    return services.byId[senderId].organization_name;
  }

  public render() {
    const { subject, sender, date, key, services } = this.props;
    const { navigate } = this.props.navigation;
    return (
      <ListItem
        key={key}
        onPress={(): boolean =>{
          console.log("dfhdshoi");
          navigate(ROUTES.MESSAGE_DETAILS, {
            message: subject
          })
        }
        }
      >
        <Left>
          <Text leftAlign={true} boldSender={true}>
            {this.getSenderName(sender, services)}
          </Text>
          <Text leftAlign={true}>{subject}</Text>
        </Left>
        <Right>
          <Text dateFormat={true}>{this.convertDateToDistance(date)}</Text>
          <Icon rightArrow={true} name="chevron-right" />
        </Right>
      </ListItem>
    );
  }
}

const StyledMessageComponent = connectStyle(
  "NativeBase.MessageComponent",
  {}
)(MessageComponent);
export default StyledMessageComponent;

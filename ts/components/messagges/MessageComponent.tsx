import * as React from "react";

import { Icon, Left, ListItem, Right, Text } from "native-base";
import { connectStyle } from "native-base-shoutem-theme";
import mapPropsToStyleNames from "native-base/src/utils/mapPropsToStyleNames";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import ROUTES from "../../navigation/routes";
import { convertDateToWordDistance } from "../../utils/convertDateToWordDistance";

export type OwnProps = Readonly<{
  date: Date;
  key: string;
  markdown: string;
  navigation: NavigationScreenProp<NavigationState>;
  service: string;
  serviceOrganizationName: string;
  subject: string;
}>;

export type Props = OwnProps;

/**
 * Implements a component that show a message in the MessagesScreen List
 */
class MessageComponent extends React.Component<Props> {
  public render() {
    const { navigate } = this.props.navigation;
    const {
      subject,
      markdown,
      serviceOrganizationName,
      date,
      key,
      service
    } = this.props;
    return (
      <ListItem
        key={key}
        onPress={() => {
          navigate(ROUTES.MESSAGE_DETAILS, {
            details: {
              date,
              markdown,
              service,
              serviceOrganizationName,
              subject
            }
          });
        }}
      >
        <Left>
          <Text leftAlign={true} alternativeBold={true}>
            {serviceOrganizationName}
          </Text>
          <Text leftAlign={true}>{subject}</Text>
        </Left>
        <Right>
          <Text formatDate={true}>{convertDateToWordDistance(date)}</Text>
          <Icon name="chevron-right" />
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

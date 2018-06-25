import * as React from "react";

import { Icon, Left, ListItem, Right, Text } from "native-base";
import { connectStyle } from "native-base-shoutem-theme";
import mapPropsToStyleNames from "native-base/src/utils/mapPropsToStyleNames";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import ROUTES from "../../navigation/routes";
import { convertDateToWordDistance } from "../../utils/convertDateToWordDistance";

export type OwnProps = Readonly<{
  createdAt: Date;
  id: string;
  markdown: string;
  navigation: NavigationScreenProp<NavigationState>;
  serviceName: string;
  serviceOrganizationName: string;
  serviceDepartmentName: string;
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
      serviceOrganizationName,
      serviceDepartmentName,
      createdAt,
      serviceName,
      markdown,
      id
    } = this.props;
    return (
      <ListItem
        key={id}
        onPress={() => {
          navigate(ROUTES.MESSAGE_DETAILS, {
            details: {
              createdAt,
              markdown,
              serviceName,
              serviceDepartmentName,
              serviceOrganizationName,
              subject
            }
          });
        }}
      >
        <Left>
          <Text leftAlign={true} alternativeBold={true}>
            {`${serviceOrganizationName} -  ${serviceDepartmentName}`}
          </Text>
          <Text leftAlign={true}>{subject}</Text>
        </Left>
        <Right>
          <Text formatDate={true}>{convertDateToWordDistance(createdAt)}</Text>
          <Icon name="chevron-right" />
        </Right>
      </ListItem>
    );
  }
}

const StyledMessageComponent = connectStyle(
  "UIComponent.MessageComponent",
  {},
  mapPropsToStyleNames
)(MessageComponent);
export default StyledMessageComponent;

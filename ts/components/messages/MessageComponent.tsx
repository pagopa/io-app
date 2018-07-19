import pick from "lodash/pick";
import { Icon, Left, ListItem, Right, Text } from "native-base";
import { connectStyle } from "native-base-shoutem-theme";
import mapPropsToStyleNames from "native-base/src/utils/mapPropsToStyleNames";
import * as React from "react";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";

import I18n from "../../i18n";
import ROUTES from "../../navigation/routes";
import {
  messageDetailsByIdSelector,
  MessageDetailsByIdState
} from "../../store/reducers/entities/messages/messagesById";
import { GlobalState } from "../../store/reducers/types";
import { convertDateToWordDistance } from "../../utils/convertDateToWordDistance";

export type OwnProps = MessageDetailsByIdState &
  Readonly<{
    navigation: NavigationScreenProp<NavigationState>;
  }>;

export type Props = OwnProps;

/**
 * Implements a component that show a message in the MessagesScreen List
 */
class MessageComponent extends React.Component<Props> {
  private handleOnPress = () => {
    const params = {
      details: pick(this.props, [
        "createdAt",
        "id",
        "markdown",
        "paymentData",
        "serviceDepartmentName",
        "serviceName",
        "serviceOrganizationName",
        "subject"
      ])
    };

    this.props.navigation.navigate(ROUTES.MESSAGE_DETAILS, params);
  };

  public render() {
    const {
      id,
      serviceOrganizationName,
      serviceDepartmentName,
      subject,
      createdAt
    } = this.props;

    return (
      <ListItem key={id} onPress={this.handleOnPress}>
        <Left>
          <Text leftAlign={true} alternativeBold={true}>
            {`${serviceOrganizationName} -  ${serviceDepartmentName}`}
          </Text>
          <Text leftAlign={true}>{subject}</Text>
        </Left>
        <Right>
          <Text formatDate={true}>
            {convertDateToWordDistance(
              new Date(createdAt),
              I18n.t("messages.yesterday")
            )}
          </Text>
          <Icon name="chevron-right" />
        </Right>
      </ListItem>
    );
  }
}

const mapStateToProps = (state: GlobalState, { id }: Props) => {
  const messageDetails = messageDetailsByIdSelector(id)(state);

  return messageDetails || {};
};

const connectedMessageComponent = connect(mapStateToProps)(MessageComponent);

const StyledMessageComponent = connectStyle(
  "UIComponent.MessageComponent",
  {},
  mapPropsToStyleNames
)(connectedMessageComponent);
export default StyledMessageComponent;

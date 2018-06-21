import * as React from "react";

import { Left, ListItem, Right, Text } from "native-base";
import { connectStyle } from "native-base-shoutem-theme";
import mapPropsToStyleNames from "native-base/src/utils/mapPropsToStyleNames";
import IconFont from "../components/ui/IconFont";
import { convertDateToWordDistance } from "../utils/convertDateToWordDistance";

export type OwnProps = Readonly<{
  serviceOrganizationName: string;
  serviceDepartmentName: string;
  subject: string;
  id: string;
  created_at: string;
}>;

export type Props = OwnProps;

/**
 * Implements a component that show a message in the MessagesScreen List
 */
class MessageComponent extends React.Component<Props> {
  public render() {
    const {
      subject,
      serviceOrganizationName,
      serviceDepartmentName,
      created_at,
      id
    } = this.props;
    return (
      <ListItem key={id}>
        <Left>
          <Text leftAlign={true} alternativeBold={true}>
            {serviceOrganizationName + " - " + serviceDepartmentName}
          </Text>
          <Text leftAlign={true}>{subject}</Text>
        </Left>
        <Right>
          <Text formatDate={true}>
            {convertDateToWordDistance(new Date(created_at))}
          </Text>
          <IconFont name="io-right" />
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

import * as React from "react";

import { Icon, Text, View } from "native-base";
import { connectStyle } from "native-base-shoutem-theme";
import mapPropsToStyleNames from "native-base/src/utils/mapPropsToStyleNames";
import { TouchableOpacity } from "react-native";
import I18n from "../../i18n";
import MessageDetailsInfoComponent from "./MessageDetailsInfoComponent";

export type OwnProps = Readonly<{
  serviceOrganizationName: string;
  serviceDepartmentName: string;
  service: string;
  key: string;
  date: Date;
  markdown: string;
}>;

type State = Readonly<{
  isMessageDetailsInfoVisible: boolean;
}>;

export type Props = OwnProps;

/**
 * Implements a component that show the message details
 */
class MessageDetailsComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { isMessageDetailsInfoVisible: false };
  }
  public handleDetailsInfoClick = (isVisible: boolean) => {
    this.setState({ isMessageDetailsInfoVisible: !isVisible });
  };
  public renderDetailsInfoLink = () => {
    if (!this.state.isMessageDetailsInfoVisible) {
      return (
        <React.Fragment>
          <Text link={true}>
            {I18n.t("messageDetails.detailsLink.showLabel")}
          </Text>
          <Icon name="chevron-right" />
        </React.Fragment>
      );
    } else {
      return (
        <React.Fragment>
          <Text link={true}>
            {I18n.t("messageDetails.detailsLink.hideLabel")}
          </Text>
          <Icon name="cross" />
        </React.Fragment>
      );
    }
  };
  public render() {
    const {
      markdown,
      date,
      serviceOrganizationName,
      serviceDepartmentName,
      service
    } = this.props;
    return (
      <View>
        <TouchableOpacity
          onPress={() =>
            this.handleDetailsInfoClick(this.state.isMessageDetailsInfoVisible)
          }
        >
          <View>{this.renderDetailsInfoLink()}</View>
        </TouchableOpacity>
        {this.state.isMessageDetailsInfoVisible && (
          <MessageDetailsInfoComponent
            date={date}
            service={service}
            serviceDepartmentName={serviceDepartmentName}
            serviceOrganizationName={serviceOrganizationName}
          />
        )}
        <Text>{markdown}</Text>
      </View>
    );
  }
}

const StyledMessageDetailsComponent = connectStyle(
  "UIComponent.MessageDetailsComponent",
  {},
  mapPropsToStyleNames
)(MessageDetailsComponent);
export default StyledMessageDetailsComponent;

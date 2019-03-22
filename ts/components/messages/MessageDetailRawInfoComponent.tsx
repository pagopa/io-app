import * as pot from "italia-ts-commons/lib/pot";
import { Text, View } from "native-base";
import * as React from "react";
import {
  StyleSheet,
  TouchableHighlight,
  TouchableWithoutFeedback
} from "react-native";

import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import I18n from "../../i18n";
import variables from "../../theme/variables";
import { MessageWithContentPO } from "../../types/MessageWithContentPO";
import IconFont from "../ui/IconFont";
import { format } from "../../utils/dates";

type OwnProps = {
  message: MessageWithContentPO;
  service: pot.Pot<ServicePublic, Error>;
  onServiceLinkPress?: () => void;
};

type Props = OwnProps;

type State = {
  isOpen: boolean;
};

const styles = StyleSheet.create({
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 5,
    paddingBottom: 5
  },

  rawInfoContainer: {
    borderLeftWidth: 2,
    borderLeftColor: variables.brandLightGray,
    paddingLeft: 10
  }
});

class MessageDetailRawInfoComponent extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      isOpen: false
    };
  }

  private toggleRawInfo = () => {
    this.setState(prevState => ({ isOpen: !prevState.isOpen }));
  };

  public render() {
    const isOpen = this.state.isOpen;
    const { message, service, onServiceLinkPress } = this.props;

    if (isOpen) {
      return (
        <View>
          <TouchableWithoutFeedback onPress={this.toggleRawInfo}>
            <View style={styles.toggleContainer}>
              <Text link={true}>
                {I18n.t("messageDetails.rawInfoLink.hideLabel")}
              </Text>
              <IconFont name="io-close" color={variables.textLinkColor} />
            </View>
          </TouchableWithoutFeedback>
          <View style={styles.rawInfoContainer}>
            <Text>
              <Text bold={true}>
                {`${I18n.t("messageDetails.rawInfoLabels.createdAt")}: `}
              </Text>
              {format(message.created_at, "dddd D MMMM YYYY")}
            </Text>
            {pot.isSome(service) && (
              <React.Fragment>
                <Text>
                  <Text bold={true}>{`${I18n.t(
                    "messageDetails.rawInfoLabels.organizationName"
                  )}: `}</Text>
                  {service.value.organization_name}
                </Text>

                <Text>
                  <Text bold={true}>{`${I18n.t(
                    "messageDetails.rawInfoLabels.departmentName"
                  )}: `}</Text>
                  {service.value.department_name}
                </Text>

                <Text link={true} onPress={onServiceLinkPress}>
                  <Text bold={true}>{`${I18n.t(
                    "messageDetails.rawInfoLabels.serviceName"
                  )}: `}</Text>
                  {service.value.service_name}
                </Text>

                <Text>
                  <Text bold={true}>ID: </Text>
                  {message.id}
                </Text>
              </React.Fragment>
            )}
          </View>
        </View>
      );
    }

    return (
      <View>
        <TouchableHighlight onPress={this.toggleRawInfo}>
          <View style={styles.toggleContainer}>
            <Text link={true}>
              {I18n.t("messageDetails.rawInfoLink.showLabel")}
            </Text>
            <IconFont name="io-right" color={variables.textLinkColor} />
          </View>
        </TouchableHighlight>
      </View>
    );
  }
}

export default MessageDetailRawInfoComponent;

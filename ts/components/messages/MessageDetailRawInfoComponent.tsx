import { Text, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { format } from "../../utils/dates";

import { CreatedMessageWithContent } from "../../../definitions/backend/CreatedMessageWithContent";
import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import I18n from "../../i18n";
import variables from "../../theme/variables";
import TouchableWithoutOpacity from "../TouchableWithoutOpacity";
import IconFont from "../ui/IconFont";

type OwnProps = {
  message: CreatedMessageWithContent;
  service?: ServicePublic;
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
  },

  linkStyle: {
    color: variables.brandPrimary,
    fontWeight: "bold"
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
          <TouchableWithoutOpacity onPress={this.toggleRawInfo}>
            <View style={styles.toggleContainer}>
              <Text style={styles.linkStyle}>
                {I18n.t("messageDetails.rawInfoLink.hideLabel")}
              </Text>
              <IconFont name="io-close" color={variables.textLinkColor} />
            </View>
          </TouchableWithoutOpacity>
          <View style={styles.rawInfoContainer}>
            <Text>
              <Text bold={true}>
                {`${I18n.t("messageDetails.rawInfoLabels.createdAt")}: `}
              </Text>
              {format(message.created_at, "dddd D MMMM YYYY")}
            </Text>
            {service && (
              <React.Fragment>
                <Text>
                  <Text bold={true}>{`${I18n.t(
                    "messageDetails.rawInfoLabels.organizationName"
                  )}: `}</Text>
                  {service.organization_name}
                </Text>

                <Text>
                  <Text bold={true}>{`${I18n.t(
                    "messageDetails.rawInfoLabels.departmentName"
                  )}: `}</Text>
                  {service.department_name}
                </Text>
                <TouchableWithoutOpacity onPress={onServiceLinkPress}>
                  <Text style={styles.linkStyle}>
                    {`${I18n.t("messageDetails.rawInfoLabels.serviceName")}: `}
                  </Text>
                </TouchableWithoutOpacity>

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
        <TouchableWithoutOpacity onPress={this.toggleRawInfo}>
          <View style={styles.toggleContainer}>
            <Text style={styles.linkStyle}>
              {I18n.t("messageDetails.rawInfoLink.showLabel")}
            </Text>
            <IconFont name="io-right" color={variables.textLinkColor} />
          </View>
        </TouchableWithoutOpacity>
      </View>
    );
  }
}

export default MessageDetailRawInfoComponent;

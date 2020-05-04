import I18n from "i18n-js";
import * as pot from "italia-ts-commons/lib/pot";
import { Text, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { CreatedMessageWithContent } from "../../../definitions/backend/CreatedMessageWithContent";
import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import { ServiceMetadataState } from "../../store/reducers/content";
import { PaymentByRptIdState } from "../../store/reducers/entities/payments";
import customVariables from "../../theme/variables";
import { format, formatDateAsLocal } from "../../utils/dates";
import { handleItemOnPress } from "../../utils/url";
import CopyButtonComponent from "../CopyButtonComponent";
import BlockButtons, { BlockButtonProps } from "../ui/BlockButtons";

const styles = StyleSheet.create({
  container: {
    backgroundColor: customVariables.brandGray,
    padding: customVariables.contentPadding
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between"
  },

  flex: {
    flex: 1
  }
});

type Props = Readonly<{
  message: CreatedMessageWithContent;
  serviceDetail: pot.Pot<ServicePublic, Error>;
  serviceMetadata?: ServiceMetadataState;
  paymentsByRptId?: PaymentByRptIdState;
  goToServiceDetail?: () => void;
}>;

/**
 * A component to render a summary of data about the message and the related service.
 * If data are available, the user can start a call or send and email to the service
 */
class MessageDetailData extends React.PureComponent<Props> {
  private dateFormat = formatDateAsLocal(
    this.props.message.created_at,
    true,
    true
  );
  private date = format(this.props.message.created_at, this.dateFormat);
  private time = format(this.props.message.created_at, "hh:mm");

  private organizationName = pot.getOrElse(
    pot.map(this.props.serviceDetail, s => s.organization_name),
    undefined
  );

  private serviceDetail = pot.getOrElse(
    pot.map(this.props.serviceDetail, s => s),
    undefined
  );

  private serviceName = pot.getOrElse(
    pot.map(this.props.serviceDetail, s => s.service_name),
    undefined
  );

  private messageId = this.props.message.id;

  private metadata =
    this.props.serviceMetadata &&
    pot.isSome(this.props.serviceMetadata) &&
    this.props.serviceMetadata.value
      ? this.props.serviceMetadata.value
      : undefined;

  private callService = () => {
    if (this.metadata && this.metadata.phone) {
      handleItemOnPress(`tel:${this.metadata.phone}`);
    }
  };

  private sendEmailToService = () => {
    if (this.metadata && this.metadata.email) {
      handleItemOnPress(`mailto:${this.metadata.email}`);
    }
  };

  private renderButtons = () => {
    if (!this.metadata) {
      return undefined;
    }

    const callButton: BlockButtonProps = {
      bordered: true,
      white: true,
      title: I18n.t("messageDetails.call"),
      onPress: this.callService
    };

    const emailButton: BlockButtonProps = {
      bordered: true,
      white: true,
      title: I18n.t("messageDetails.write"),
      iconName: "io-envelope",
      onPress: this.sendEmailToService
    };

    if (!this.metadata.phone || !this.metadata.email) {
      return (
        <BlockButtons
          type={"SingleButton"}
          leftButton={this.metadata.phone ? callButton : emailButton}
        />
      );
    }

    return (
      <BlockButtons
        type={"TwoButtonsInlineHalf"}
        leftButton={callButton}
        rightButton={emailButton}
      />
    );
  };

  public render() {
    return (
      <View style={styles.container}>
        <Text>
          {I18n.t("messageDetails.dateSending")}
          <Text bold={true}>{` ${this.date} - ${this.time}`}</Text>
        </Text>

        {this.organizationName && (
          <Text>
            {I18n.t("messageDetails.sender")}
            <Text bold={true}>{` ${this.organizationName}`}</Text>
          </Text>
        )}

        {this.serviceName &&
          this.serviceDetail && (
            <Text>
              {`${I18n.t("messageDetails.service")} `}
              <Text
                bold={true}
                link={this.serviceDetail !== undefined}
                onPress={this.props.goToServiceDetail}
              >
                {this.serviceName}
              </Text>
            </Text>
          )}

        <View spacer={true} />

        <Text bold={true}>{I18n.t("messageDetails.question")}</Text>
        <Text>{I18n.t("messageDetails.answer")}</Text>

        <View spacer={true} />

        <React.Fragment>
          <View style={styles.row}>
            <Text style={styles.flex}>{`${I18n.t("messageDetails.id")} ${
              this.messageId
            }`}</Text>
            <CopyButtonComponent textToCopy={this.messageId} />
          </View>
          <View spacer={true} />
        </React.Fragment>
        {this.renderButtons()}
      </View>
    );
  }
}

export default MessageDetailData;

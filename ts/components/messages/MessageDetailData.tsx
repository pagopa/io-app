import { fromNullable, none, Option, some } from "fp-ts/lib/Option";
import I18n from "i18n-js";
import { Text as NBText, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import { PaymentByRptIdState } from "../../store/reducers/entities/payments";
import customVariables from "../../theme/variables";
import CopyButtonComponent from "../CopyButtonComponent";
import { Link } from "../core/typography/Link";
import EmailCallCTA from "../screens/EmailCallCTA";
import { CreatedMessageWithContentAndAttachments } from "../../../definitions/backend/CreatedMessageWithContentAndAttachments";
import { convertDateTimeToWordDistance } from "../../utils/convertDateToWordDistance";
import { ServiceMetadata } from "../../../definitions/backend/ServiceMetadata";
import { IOColors } from "../core/variables/IOColors";

const styles = StyleSheet.create({
  container: {
    backgroundColor: IOColors.greyUltraLight,
    padding: customVariables.contentPadding
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  flex: {
    flex: 1,
    alignSelf: "center"
  },
  service: {
    display: "flex",
    flexDirection: "row"
  }
});

type Props = Readonly<{
  message: CreatedMessageWithContentAndAttachments;
  serviceDetail: Option<ServicePublic>;
  serviceMetadata?: ServiceMetadata;
  paymentsByRptId?: PaymentByRptIdState;
  goToServiceDetail?: () => void;
}>;

type MessageData = {
  service_detail: Option<ServicePublic>;
  organization_name: Option<string>;
  service_name: Option<string>;
  metadata: Option<ServiceMetadata>;
};

/**
 * A component to render a summary of data about the message and the related service.
 * If data are available, the user can start a call or send and email to the service
 */
class MessageDetailData extends React.PureComponent<Props> {
  get data(): MessageData {
    const serviceDetail = this.props.serviceDetail;
    const metadata = fromNullable(this.props.serviceMetadata);
    return {
      service_detail: serviceDetail,
      organization_name: serviceDetail.map(s => s.organization_name),
      service_name: serviceDetail.map(s => s.service_name),
      metadata: metadata.fold(none, m =>
        fromNullable(m).fold(none, mm => some(mm))
      )
    };
  }

  get hasEmailOrPhone(): boolean {
    return this.data.metadata.fold(
      false,
      m => m.phone !== undefined || m.email !== undefined
    );
  }

  private renderButtons = () => {
    if (!this.hasEmailOrPhone) {
      return undefined;
    }
    const phone = this.data.metadata.fold(undefined, m => m.phone);
    const email = this.data.metadata.fold(undefined, m => m.email);

    return <EmailCallCTA phone={phone} email={email} />;
  };

  public render() {
    const textToCopy: string = this.props.serviceDetail
      .map(({ service_name }) => `${service_name} - ${this.props.message.id}`)
      .getOrElse(this.props.message.id);

    return (
      <View style={styles.container}>
        <NBText>
          {I18n.t("messageDetails.dateSending")}
          <NBText bold={true}>{` ${convertDateTimeToWordDistance(
            this.props.message.created_at
          )}`}</NBText>
        </NBText>

        {this.data.organization_name.isSome() && (
          <NBText>
            {I18n.t("messageDetails.sender")}
            <NBText
              bold={true}
            >{` ${this.data.organization_name.value}`}</NBText>
          </NBText>
        )}

        {this.data.service_name.isSome() && this.data.service_detail.isSome() && (
          <View style={styles.service}>
            <NBText>
              {`${I18n.t("messageDetails.service")} `}
              <Link weight={"Bold"} onPress={this.props.goToServiceDetail}>
                {this.data.service_detail.value.service_name}
              </Link>
            </NBText>
          </View>
        )}
        {this.hasEmailOrPhone && (
          <React.Fragment>
            <View spacer={true} />

            <NBText bold={true}>{I18n.t("messageDetails.question")}</NBText>
            <View spacer={true} xsmall={true} />
            <NBText>{I18n.t("messageDetails.answer")}</NBText>

            <View spacer={true} />

            <React.Fragment>
              <View style={styles.row}>
                <NBText style={styles.flex}>{`${I18n.t("messageDetails.id")} ${
                  this.props.message.id
                }`}</NBText>
                <CopyButtonComponent textToCopy={textToCopy} />
              </View>
              <View spacer={true} />
            </React.Fragment>
            {this.renderButtons()}
            <View spacer={true} small={true} />
          </React.Fragment>
        )}
      </View>
    );
  }
}

export default MessageDetailData;

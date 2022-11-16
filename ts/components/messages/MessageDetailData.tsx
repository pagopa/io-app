import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import I18n from "i18n-js";
import { Text as NBText, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { CreatedMessageWithContentAndAttachments } from "../../../definitions/backend/CreatedMessageWithContentAndAttachments";
import { ServiceMetadata } from "../../../definitions/backend/ServiceMetadata";
import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import { PaymentByRptIdState } from "../../store/reducers/entities/payments";
import customVariables from "../../theme/variables";
import { convertDateTimeToWordDistance } from "../../utils/convertDateToWordDistance";
import CopyButtonComponent from "../CopyButtonComponent";
import { Link } from "../core/typography/Link";
import { IOColors } from "../core/variables/IOColors";
import EmailCallCTA from "../screens/EmailCallCTA";

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
  serviceDetail: O.Option<ServicePublic>;
  serviceMetadata?: ServiceMetadata;
  paymentsByRptId?: PaymentByRptIdState;
  goToServiceDetail?: () => void;
}>;

type MessageData = {
  service_detail: O.Option<ServicePublic>;
  organization_name: O.Option<string>;
  service_name: O.Option<string>;
  metadata: O.Option<ServiceMetadata>;
};

/**
 * A component to render a summary of data about the message and the related service.
 * If data are available, the user can start a call or send and email to the service
 */
class MessageDetailData extends React.PureComponent<Props> {
  get data(): MessageData {
    const serviceDetail = this.props.serviceDetail;
    const metadata = O.fromNullable(this.props.serviceMetadata);
    return {
      service_detail: serviceDetail,
      organization_name: pipe(
        serviceDetail,
        O.map(s => s.organization_name)
      ),
      service_name: pipe(
        serviceDetail,
        O.map(s => s.service_name)
      ),
      metadata: pipe(
        metadata,
        O.chain(m => O.fromNullable(m))
      )
    };
  }

  get hasEmailOrPhone(): boolean {
    return pipe(
      this.data.metadata,
      O.fold(
        () => false,
        m => m.phone !== undefined || m.email !== undefined
      )
    );
  }

  private renderButtons = () => {
    if (!this.hasEmailOrPhone) {
      return undefined;
    }
    const phone = pipe(
      this.data.metadata,
      O.map(m => m.phone),
      O.toUndefined
    );
    const email = pipe(
      this.data.metadata,
      O.map(m => m.email),
      O.toUndefined
    );

    return <EmailCallCTA phone={phone} email={email} />;
  };

  public render() {
    const textToCopy: string = pipe(
      this.props.serviceDetail,
      O.map(({ service_name }) => `${service_name} - ${this.props.message.id}`),
      O.getOrElse(() => this.props.message.id)
    );

    return (
      <View style={styles.container}>
        <NBText>
          {I18n.t("messageDetails.dateSending")}
          <NBText bold={true}>{` ${convertDateTimeToWordDistance(
            this.props.message.created_at
          )}`}</NBText>
        </NBText>

        {O.isSome(this.data.organization_name) && (
          <NBText>
            {I18n.t("messageDetails.sender")}
            <NBText
              bold={true}
            >{` ${this.data.organization_name.value}`}</NBText>
          </NBText>
        )}

        {O.isSome(this.data.service_name) &&
          O.isSome(this.data.service_detail) && (
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

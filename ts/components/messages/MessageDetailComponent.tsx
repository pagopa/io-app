import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { Content, Text as NBText, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import DeviceInfo from "react-native-device-info";
import { CreatedMessageWithContentAndAttachments } from "../../../definitions/backend/CreatedMessageWithContentAndAttachments";
import { ServiceMetadata } from "../../../definitions/backend/ServiceMetadata";
import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import I18n from "../../i18n";
import { PaymentByRptIdState } from "../../store/reducers/entities/payments";
import variables from "../../theme/variables";
import {
  cleanMarkdownFromCTAs,
  paymentExpirationInfo
} from "../../utils/messages";
import { logosForService } from "../../utils/services";
import { H1 } from "../core/typography/H1";
import OrganizationHeader from "../OrganizationHeader";
import MedicalPrescriptionAttachments from "./MedicalPrescriptionAttachments";
import MedicalPrescriptionDueDateBar from "./MedicalPrescriptionDueDateBar";
import MedicalPrescriptionIdentifiersComponent from "./MedicalPrescriptionIdentifiersComponent";
import MessageDetailCTABar from "./MessageDetailCTABar";
import MessageDetailData from "./MessageDetailData";
import MessageDueDateBar from "./MessageDueDateBar";
import MessageMarkdown from "./MessageMarkdown";

type Props = Readonly<{
  message: CreatedMessageWithContentAndAttachments;
  paymentsByRptId: PaymentByRptIdState;
  serviceDetail?: ServicePublic;
  serviceMetadata?: ServiceMetadata;
  onServiceLinkPress?: () => void;
}>;

type State = Readonly<{
  isContentLoadCompleted: boolean;
}>;

const styles = StyleSheet.create({
  padded: {
    paddingHorizontal: variables.contentPadding
  },
  webview: {
    marginLeft: variables.contentPadding,
    marginRight: variables.contentPadding
  }
});

/**
 * A component to render the message detail. It has 2 main styles: traditional message and medical prescription
 */
export default class MessageDetailComponent extends React.PureComponent<
  Props,
  State
> {
  constructor(props: Props) {
    super(props);
    this.state = { isContentLoadCompleted: false };
  }

  private onMarkdownLoadEnd = () => {
    this.setState({ isContentLoadCompleted: true });
  };

  get maybeMedicalData() {
    return O.fromNullable(this.props.message.content.prescription_data);
  }

  get attachments() {
    return O.fromNullable(this.props.message.content.attachments);
  }

  get paymentExpirationInfo() {
    return paymentExpirationInfo(this.props.message);
  }

  get service(): O.Option<ServicePublic> {
    const { serviceDetail } = this.props;
    return O.fromNullable(serviceDetail);
  }

  get payment() {
    const { message, paymentsByRptId } = this.props;
    const payment_data = message.content.payment_data;
    return paymentsByRptId[
      `${payment_data?.payee.fiscal_code}${payment_data?.notice_number}`
    ];
  }

  private getTitle = () =>
    pipe(
      this.maybeMedicalData,
      O.fold(
        () => <H1>{this.props.message.content.subject}</H1>,
        _ => (
          <React.Fragment>
            <H1>{I18n.t("messages.medical.prescription")}</H1>
            <NBText>{I18n.t("messages.medical.memo")}</NBText>
          </React.Fragment>
        )
      )
    );

  public render() {
    const { message, serviceDetail, serviceMetadata, onServiceLinkPress } =
      this.props;
    const { maybeMedicalData, service, payment } = this;

    return (
      <React.Fragment>
        <Content noPadded={true}>
          {/** Header */}
          <View style={styles.padded}>
            <View spacer={true} />
            {O.isSome(service) && (
              <React.Fragment>
                <OrganizationHeader
                  serviceName={service.value.service_name}
                  organizationName={service.value.organization_name}
                  logoURLs={logosForService(service.value)}
                />
                <View spacer={true} large={true} />
              </React.Fragment>
            )}
            {/* Subject */}
            {this.getTitle()}
            <View spacer={true} />
          </View>

          {pipe(
            maybeMedicalData,
            O.fold(
              () => undefined,
              md => (
                <MedicalPrescriptionIdentifiersComponent
                  prescriptionData={md}
                />
              )
            )
          )}

          {pipe(
            this.maybeMedicalData,
            O.fold(
              () => <MessageDueDateBar message={message} payment={payment} />,
              _ => <MedicalPrescriptionDueDateBar message={message} />
            )
          )}

          <MessageMarkdown
            webViewStyle={styles.webview}
            onLoadEnd={this.onMarkdownLoadEnd}
          >
            {cleanMarkdownFromCTAs(message.content.markdown)}
          </MessageMarkdown>

          <View spacer={true} large={true} />
          {O.isSome(this.attachments) && this.state.isContentLoadCompleted && (
            <React.Fragment>
              <MedicalPrescriptionAttachments
                prescriptionData={O.toUndefined(this.maybeMedicalData)}
                attachments={this.attachments.value}
                organizationName={pipe(
                  this.service,
                  O.map(s => s.organization_name),
                  O.toUndefined
                )}
              />
              <View spacer={true} large={true} />
            </React.Fragment>
          )}

          {this.state.isContentLoadCompleted && (
            <React.Fragment>
              <MessageDetailData
                message={message}
                serviceDetail={O.fromNullable(serviceDetail)}
                serviceMetadata={serviceMetadata}
                goToServiceDetail={onServiceLinkPress}
              />
            </React.Fragment>
          )}
        </Content>
        {DeviceInfo.hasNotch() && (
          <React.Fragment>
            <View spacer={true} large={true} />
            <View spacer={true} small={true} />
          </React.Fragment>
        )}
        {pipe(
          this.maybeMedicalData,
          O.fold(
            () => (
              <MessageDetailCTABar
                message={message}
                service={O.toUndefined(service)}
                payment={this.payment}
              />
            ),
            _ => undefined
          )
        )}
      </React.Fragment>
    );
  }
}

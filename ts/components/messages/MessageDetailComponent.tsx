import { fromNullable } from "fp-ts/lib/Option";
import { Content, H3, Text, View } from "native-base";
import DeviceInfo from "react-native-device-info";
import * as React from "react";
import { ImageURISource, StyleSheet } from "react-native";
import { CreatedMessageWithContentAndAttachments } from "../../../definitions/backend/CreatedMessageWithContentAndAttachments";
import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import I18n from "../../i18n";
import { PaymentByRptIdState } from "../../store/reducers/entities/payments";
import variables from "../../theme/variables";
import {
  cleanMarkdownFromCTAs,
  paymentExpirationInfo
} from "../../utils/messages";
import { logosForService } from "../../utils/services";
import OrganizationHeader from "../OrganizationHeader";

import MedicalPrescriptionAttachments from "./MedicalPrescriptionAttachments";
import MedicalPrescriptionDueDateBar from "./MedicalPrescriptionDueDateBar";
import MedicalPrescriptionIdentifiersComponent from "./MedicalPrescriptionIdentifiersComponent";
import MessageDetailCTABar from "./MessageDetailCTABar";
import MessageDetailData from "./MessageDetailData";
import MessageDueDateBar from "./MessageDueDateBar";
import MessageMarkdown from "./MessageMarkdown";

export type ServiceDataForUI = {
  id: string;
  name: string;
  organizationName: string;
  organizationFiscalCode: string;
  email?: string;
  phone?: string;
  logoURLs: ReadonlyArray<ImageURISource>;
};

type Props = Readonly<{
  message: CreatedMessageWithContentAndAttachments;
  paymentsByRptId: PaymentByRptIdState;
  service?: ServicePublic;
  onServiceLinkPress?: () => void;
}>;

type State = Readonly<{
  isContentLoadCompleted: boolean;
}>;

const styles = StyleSheet.create({
  padded: {
    paddingHorizontal: variables.contentPadding
  },
  serviceContainer: {
    marginBottom: variables.contentPadding
  },
  subjectContainer: {
    marginBottom: variables.spacerSmallHeight
  },
  ctaBarContainer: {
    backgroundColor: variables.brandGray,
    padding: variables.contentPadding,
    marginBottom: variables.contentPadding
  },
  webview: {
    marginLeft: variables.contentPadding,
    marginRight: variables.contentPadding
  },
  messageIDContainer: {
    width: "100%",
    alignContent: "space-between",
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap"
  },
  messageIDLabelContainer: {
    flex: 1,
    height: variables.lineHeightBase,
    marginBottom: 5
  },
  messageIDBtnContainer: {
    flex: 0,
    marginBottom: 5,
    height: variables.lineHeightBase
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
    return fromNullable(this.props.message.content.prescription_data);
  }

  get attachments() {
    return fromNullable(this.props.message.content.attachments);
  }

  get paymentExpirationInfo() {
    return paymentExpirationInfo(this.props.message);
  }

  get payment() {
    const { message, paymentsByRptId } = this.props;
    const payment_data = message.content.payment_data;
    return paymentsByRptId[
      `${payment_data?.payee.fiscal_code}${payment_data?.notice_number}`
    ];
  }

  private getTitle = () =>
    this.maybeMedicalData.fold(
      <H3>{this.props.message.content.subject}</H3>,
      _ => (
        <React.Fragment>
          <H3>{I18n.t("messages.medical.prescription")}</H3>
          <Text>{I18n.t("messages.medical.memo")}</Text>
        </React.Fragment>
      )
    );

  public render() {
    const { message, service, onServiceLinkPress } = this.props;
    const { maybeMedicalData, payment } = this;

    const serviceDataForUI = service
      ? {
          id: service.service_id,
          name: service.service_name,
          organizationName: service.organization_name,
          organizationFiscalCode: service.organization_fiscal_code,
          email: service.service_metadata?.email,
          phone: service.service_metadata?.phone,
          logoURLs: logosForService(service)
        }
      : undefined;

    return (
      <React.Fragment>
        <Content noPadded={true}>
          {/** Header */}
          <View style={styles.padded}>
            <View spacer={true} />
            {serviceDataForUI !== undefined && (
              <React.Fragment>
                <OrganizationHeader
                  serviceName={serviceDataForUI.name}
                  organizationName={serviceDataForUI.organizationName}
                  logoURLs={serviceDataForUI.logoURLs}
                />
                <View spacer={true} large={true} />
              </React.Fragment>
            )}
            {/* Subject */}
            {this.getTitle()}
            <View spacer={true} />
          </View>

          {maybeMedicalData.fold(undefined, md => (
            <MedicalPrescriptionIdentifiersComponent prescriptionData={md} />
          ))}

          {this.maybeMedicalData.fold(
            <MessageDueDateBar message={message} payment={payment} />,
            _ => (
              <MedicalPrescriptionDueDateBar message={message} />
            )
          )}

          <MessageMarkdown
            webViewStyle={styles.webview}
            onLoadEnd={this.onMarkdownLoadEnd}
          >
            {cleanMarkdownFromCTAs(message.content.markdown)}
          </MessageMarkdown>

          <View spacer={true} large={true} />
          {this.attachments.isSome() && this.state.isContentLoadCompleted && (
            <React.Fragment>
              <MedicalPrescriptionAttachments
                prescriptionData={this.maybeMedicalData.toUndefined()}
                attachments={this.attachments.value}
                organizationName={service?.organization_name}
              />
              <View spacer={true} large={true} />
            </React.Fragment>
          )}

          {this.state.isContentLoadCompleted && (
            <React.Fragment>
              <MessageDetailData
                goToServiceDetail={onServiceLinkPress}
                messageCreatedAt={message.created_at}
                messageId={message.id}
                organizationName={serviceDataForUI?.organizationName}
                serviceEmail={serviceDataForUI?.email}
                serviceName={serviceDataForUI?.name}
                servicePhone={serviceDataForUI?.phone}
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
        {this.maybeMedicalData.fold(
          <MessageDetailCTABar
            message={message}
            service={service}
            payment={this.payment}
          />,
          _ => undefined
        )}
      </React.Fragment>
    );
  }
}

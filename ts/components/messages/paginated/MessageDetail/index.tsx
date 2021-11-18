import { Content, H3, Text, View } from "native-base";
import DeviceInfo from "react-native-device-info";
import * as React from "react";
import { StyleSheet } from "react-native";

import { ServicePublicService_metadata } from "../../../../../definitions/backend/ServicePublic";
import I18n from "../../../../i18n";
import variables from "../../../../theme/variables";
import {
  cleanMarkdownFromCTAs,
  MessagePaymentExpirationInfo
} from "../../../../utils/messages";
import {
  UIMessage,
  UIMessageDetails
} from "../../../../store/reducers/entities/messages/types";
import { OrganizationFiscalCode } from "../../../../../definitions/backend/OrganizationFiscalCode";
import { getExpireStatus } from "../../../../utils/dates";
import { logosForService } from "../../../../utils/services";
import OrganizationHeader from "../../../OrganizationHeader";
import MedicalPrescriptionIdentifiersComponent from "../../MedicalPrescriptionIdentifiersComponent";
import MessageMarkdown from "../../MessageMarkdown";

import MessageContent from "./Content";
import MedicalPrescriptionAttachments from "./MedicalPrescriptionAttachments";
import MedicalPrescriptionDueDateBar from "./MedicalPrescriptionDueDateBar";
import DueDateBar from "./DueDateBar";
import CTABar from "./CTABar";

type Props = Readonly<{
  hasPaidBadge: boolean;
  message: UIMessage;
  messageDetails: UIMessageDetails;
  navigateToWalletHome: () => void;
  onServiceLinkPress?: () => void;
  organizationFiscalCode?: OrganizationFiscalCode;
  serviceMetadata?: ServicePublicService_metadata;
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

  onMarkdownLoadEnd = () => {
    this.setState({ isContentLoadCompleted: true });
  };

  get paymentExpirationInfo(): MessagePaymentExpirationInfo {
    const { paymentData, dueDate } = this.props.messageDetails;
    if (paymentData && dueDate) {
      const expireStatus = getExpireStatus(dueDate);
      return {
        kind: paymentData.invalidAfterDueDate ? "EXPIRABLE" : "UNEXPIRABLE",
        expireStatus,
        dueDate
      };
    }
    return {
      kind: "UNEXPIRABLE"
    };
  }

  render() {
    const {
      hasPaidBadge,
      message,
      messageDetails,
      navigateToWalletHome,
      onServiceLinkPress,
      organizationFiscalCode,
      serviceMetadata
    } = this.props;
    const { isContentLoadCompleted } = this.state;
    const { paymentExpirationInfo } = this;
    const { prescriptionData, dueDate, markdown, attachments, paymentData } =
      messageDetails;

    const dummyServiceData = {
      organization_name:
        message.organizationName || I18n.t("messages.errorLoading.senderInfo"),
      service_name:
        message.serviceName || I18n.t("messages.errorLoading.serviceInfo"),
      organization_fiscal_code:
        organizationFiscalCode || I18n.t("messages.errorLoading.senderInfo"),
      service_id: message.serviceId
    };

    return (
      <>
        <Content noPadded={true}>
          <View style={styles.padded}>
            <View spacer={true} />
            <OrganizationHeader
              serviceName={dummyServiceData.service_name}
              organizationName={dummyServiceData.organization_name}
              logoURLs={logosForService(dummyServiceData)}
            />
            <View spacer={true} large={true} />

            {prescriptionData ? (
              <React.Fragment>
                <H3>{I18n.t("messages.medical.prescription")}</H3>
                <Text>{I18n.t("messages.medical.memo")}</Text>
              </React.Fragment>
            ) : (
              <H3>{message.title}</H3>
            )}
            <View spacer={true} />
          </View>

          {prescriptionData && (
            <MedicalPrescriptionIdentifiersComponent
              prescriptionData={prescriptionData}
            />
          )}

          {prescriptionData === undefined && dueDate !== undefined && (
            <DueDateBar
              dueDate={dueDate}
              expirationInfo={paymentExpirationInfo}
              isPaid={hasPaidBadge}
              onGoToWallet={navigateToWalletHome}
            />
          )}
          {prescriptionData !== undefined && dueDate !== undefined && (
            <MedicalPrescriptionDueDateBar
              dueDate={dueDate}
              paymentExpirationInfo={paymentExpirationInfo}
            />
          )}

          <MessageMarkdown
            webViewStyle={styles.webview}
            onLoadEnd={this.onMarkdownLoadEnd}
          >
            {cleanMarkdownFromCTAs(markdown)}
          </MessageMarkdown>

          <View spacer={true} large={true} />
          {attachments && isContentLoadCompleted && (
            <React.Fragment>
              <MedicalPrescriptionAttachments
                prescriptionData={prescriptionData}
                attachments={attachments}
                organizationName={message.organizationName}
              />
              <View spacer={true} large={true} />
            </React.Fragment>
          )}

          {isContentLoadCompleted && (
            <MessageContent
              message={message}
              serviceContacts={{
                phone: serviceMetadata?.phone,
                email: serviceMetadata?.email
              }}
              goToServiceDetail={onServiceLinkPress}
            />
          )}
        </Content>

        {DeviceInfo.hasNotch() && (
          <React.Fragment>
            <View spacer={true} large={true} />
            <View spacer={true} small={true} />
          </React.Fragment>
        )}

        {prescriptionData === undefined && (
          <CTABar
            dueDate={dueDate}
            expirationInfo={paymentExpirationInfo}
            isPaid={hasPaidBadge}
            markdown={markdown}
            messageId={message.id}
            paymentData={paymentData}
            serviceId={message.serviceId}
            serviceMetadata={serviceMetadata}
          />
        )}
      </>
    );
  }
}

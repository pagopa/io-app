import { Content as NBContent, View as NBView } from "native-base";
import * as React from "react";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import DeviceInfo from "react-native-device-info";
import { OrganizationFiscalCode } from "../../../../../definitions/backend/OrganizationFiscalCode";

import { ServicePublicService_metadata } from "../../../../../definitions/backend/ServicePublic";
import {
  UIMessage,
  UIMessageDetails
} from "../../../../store/reducers/entities/messages/types";
import { UIService } from "../../../../store/reducers/entities/services/types";
import variables from "../../../../theme/variables";
import { getExpireStatus } from "../../../../utils/dates";
import {
  cleanMarkdownFromCTAs,
  MessagePaymentExpirationInfo
} from "../../../../utils/messages";
import OrganizationHeader from "../../../OrganizationHeader";

import MedicalPrescriptionIdentifiersComponent from "../../MedicalPrescriptionIdentifiersComponent";
import MessageMarkdown from "../../MessageMarkdown";
import MessageContent from "./Content";
import CtaBar from "./CtaBar";
import DueDateBar from "./DueDateBar";
import MedicalPrescriptionAttachments from "./MedicalPrescriptionAttachments";
import MedicalPrescriptionDueDateBar from "./MedicalPrescriptionDueDateBar";
import { MessageTitle } from "./MessageTitle";

const styles = StyleSheet.create({
  padded: {
    paddingHorizontal: variables.contentPadding
  },
  webview: {
    marginLeft: variables.contentPadding,
    marginRight: variables.contentPadding
  }
});

type Props = Readonly<{
  hasPaidBadge: boolean;
  message: UIMessage;
  messageDetails: UIMessageDetails;
  navigateToWalletHome: () => void;
  onServiceLinkPress?: () => void;
  organizationFiscalCode?: OrganizationFiscalCode;
  serviceMetadata?: ServicePublicService_metadata;
  service?: UIService;
}>;

const OrganizationTitle = ({ name, organizationName, logoURLs }: UIService) => (
  <OrganizationHeader
    serviceName={name}
    organizationName={organizationName}
    logoURLs={logoURLs}
  />
);

const getPaymentExpirationInfo = (
  messageDetails: UIMessageDetails
): MessagePaymentExpirationInfo => {
  const { paymentData, dueDate } = messageDetails;
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
};

/**
 * Render a single message with all of its details
 */
const MessageDetailsComponent = ({
  hasPaidBadge,
  message,
  messageDetails,
  navigateToWalletHome,
  onServiceLinkPress,
  service,
  serviceMetadata
}: Props) => {
  const [isContentLoadCompleted, setIsContentLoadCompleted] = useState(false);
  const { attachments, dueDate, markdown, prescriptionData } = messageDetails;
  const paymentExpirationInfo = getPaymentExpirationInfo(messageDetails);

  return (
    <>
      <NBContent noPadded={true}>
        <View style={styles.padded}>
          <NBView spacer={true} />

          {service && <OrganizationTitle {...service} />}

          <NBView spacer={true} large={true} />

          <MessageTitle
            title={message.title}
            prescriptionData={prescriptionData}
          />

          <NBView spacer={true} />
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
            messageDetails={messageDetails}
            paymentExpirationInfo={paymentExpirationInfo}
          />
        )}

        <MessageMarkdown
          webViewStyle={styles.webview}
          onLoadEnd={() => {
            setIsContentLoadCompleted(true);
          }}
        >
          {cleanMarkdownFromCTAs(markdown)}
        </MessageMarkdown>

        <NBView spacer={true} large={true} />

        {attachments && isContentLoadCompleted && (
          <>
            <MedicalPrescriptionAttachments
              prescriptionData={prescriptionData}
              attachments={attachments}
              organizationName={message.organizationName}
            />
            <NBView spacer={true} large={true} />
          </>
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
      </NBContent>

      <>
        {DeviceInfo.hasNotch() && (
          <React.Fragment>
            <NBView spacer={true} large={true} />
            <NBView spacer={true} small={true} />
          </React.Fragment>
        )}

        {prescriptionData === undefined && (
          <CtaBar
            expirationInfo={paymentExpirationInfo}
            isPaid={hasPaidBadge}
            messageDetails={messageDetails}
            service={service}
            serviceMetadata={serviceMetadata}
          />
        )}
      </>
    </>
  );
};

export default MessageDetailsComponent;

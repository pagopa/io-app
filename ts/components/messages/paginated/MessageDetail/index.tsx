import { Content as NBContent, View as NBView } from "native-base";
import * as React from "react";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import DeviceInfo from "react-native-device-info";
import { OrganizationFiscalCode } from "../../../../../definitions/backend/OrganizationFiscalCode";

import { ServiceMetadata } from "../../../../../definitions/backend/ServiceMetadata";
import variables from "../../../../theme/variables";
import {
  UIMessage,
  UIMessageDetails
} from "../../../../store/reducers/entities/messages/types";
import { UIService } from "../../../../store/reducers/entities/services/types";
import { getExpireStatus } from "../../../../utils/dates";
import {
  cleanMarkdownFromCTAs,
  MessagePaymentExpirationInfo
} from "../../../../utils/messages";
import OrganizationHeader from "../../../OrganizationHeader";
import MessageMarkdown from "../../MessageMarkdown";
import CtaBar from "./common/CtaBar";
import { HeaderDueDateBar } from "./common/HeaderDueDateBar";
import { MessageTitle } from "./common/MessageTitle";
import MessageContent from "./Content";
import MedicalPrescriptionAttachments from "./MedicalPrescriptionAttachments";

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
  onServiceLinkPress?: () => void;
  organizationFiscalCode?: OrganizationFiscalCode;
  serviceMetadata?: ServiceMetadata;
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
  onServiceLinkPress,
  service,
  serviceMetadata
}: Props) => {
  const [isContentLoadCompleted, setIsContentLoadCompleted] = useState(false);
  const { attachments, dueDate, markdown, prescriptionData } = messageDetails;
  const paymentExpirationInfo = getPaymentExpirationInfo(messageDetails);
  const isPrescription = prescriptionData !== undefined;

  return (
    <>
      <NBContent noPadded={true}>
        <View style={styles.padded}>
          <NBView spacer={true} />

          {service && <OrganizationTitle {...service} />}

          <NBView spacer={true} large={true} />

          <MessageTitle title={message.title} isPrescription={isPrescription} />

          <NBView spacer={true} />
        </View>

        <HeaderDueDateBar
          hasPaidBadge={hasPaidBadge}
          messageDetails={messageDetails}
          paymentExpirationInfo={paymentExpirationInfo}
          dueDate={dueDate}
          prescriptionData={prescriptionData}
        />

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

        <CtaBar
          isPrescription={isPrescription}
          expirationInfo={paymentExpirationInfo}
          isPaid={hasPaidBadge}
          messageDetails={messageDetails}
          service={service}
          serviceMetadata={serviceMetadata}
        />
      </>
    </>
  );
};

export default MessageDetailsComponent;

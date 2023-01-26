import { Content as NBContent } from "native-base";
import * as React from "react";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import DeviceInfo from "react-native-device-info";
import { OrganizationFiscalCode } from "../../../../definitions/backend/OrganizationFiscalCode";

import { ServiceMetadata } from "../../../../definitions/backend/ServiceMetadata";
import {
  UIMessage,
  UIMessageDetails
} from "../../../store/reducers/entities/messages/types";
import { UIService } from "../../../store/reducers/entities/services/types";
import variables from "../../../theme/variables";
import { cleanMarkdownFromCTAs } from "../../../utils/messages";
import { VSpacer } from "../../core/spacer/Spacer";
import OrganizationHeader from "../../OrganizationHeader";
import CtaBar from "./common/CtaBar";
import { HeaderDueDateBar } from "./common/HeaderDueDateBar";
import { MessageTitle } from "./common/MessageTitle";
import MessageContent from "./Content";
import MedicalPrescriptionAttachments from "./MedicalPrescriptionAttachments";
import MessageMarkdown from "./MessageMarkdown";

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
  const { attachments, markdown, prescriptionData } = messageDetails;
  const isPrescription = prescriptionData !== undefined;

  return (
    <>
      <NBContent noPadded={true}>
        <View style={styles.padded}>
          <VSpacer size={16} />

          {service && <OrganizationTitle {...service} />}

          <VSpacer size={24} />

          <MessageTitle title={message.title} isPrescription={isPrescription} />

          <VSpacer size={16} />
        </View>

        <HeaderDueDateBar
          hasPaidBadge={hasPaidBadge}
          messageDetails={messageDetails}
        />

        <MessageMarkdown
          webViewStyle={styles.webview}
          onLoadEnd={() => {
            setIsContentLoadCompleted(true);
          }}
        >
          {cleanMarkdownFromCTAs(markdown)}
        </MessageMarkdown>

        <VSpacer size={24} />

        {attachments && isContentLoadCompleted && (
          <>
            <MedicalPrescriptionAttachments
              prescriptionData={prescriptionData}
              attachments={attachments}
              organizationName={message.organizationName}
            />
            <VSpacer size={24} />
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
            <VSpacer size={24} />
            <VSpacer size={8} />
          </React.Fragment>
        )}

        <CtaBar
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

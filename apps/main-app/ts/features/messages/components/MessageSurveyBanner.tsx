import { Banner, VSpacer } from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import i18next from "i18next";

import { ServiceId } from "../../../../definitions/services/ServiceId";
import { useIOSelector } from "../../../store/hooks";
import { messageSurveyBannerUriSelector } from "../../../store/reducers/backendStatus/remoteConfig";
import { isTestEnv } from "../../../utils/environment";
import { openWebUrl } from "../../../utils/url";
import { PNMessage } from "../../pn/store/types/types";
import { serviceDetailsByIdSelector } from "../../services/details/store/selectors";
import { messageDetailsByIdSelector } from "../store/reducers/detailsById";
import { hasAttachmentsSelector } from "../store/reducers/thirdPartyById";
import { UIMessage, UIMessageDetails } from "../types";

const MessageKind = {
  STANDARD: "STANDARD",
  PAYMENT: "PAYMENT",
  SEND: "SEND",
  REMOTE_CONTENT: "REMOTE_CONTENT",
  ATTACHMENT: "ATTACHMENT"
} as const;

type MessageKind = (typeof MessageKind)[keyof typeof MessageKind];

type QualtricsParameters = {
  messageType: MessageKind;
  organizationFiscalCode: string;
  sendingDate: string;
  serviceId: ServiceId;
};

export const StandardMessageSurveyBanner = ({
  message
}: {
  message: UIMessage;
}) => {
  const messageDetailsPot = useIOSelector(state =>
    messageDetailsByIdSelector(state, message.id)
  );
  const hasAttachments = useIOSelector(state =>
    hasAttachmentsSelector(state, message.id)
  );
  const messageDetails = pot.toUndefined(messageDetailsPot);

  if (messageDetails === undefined) {
    return null;
  }

  return (
    <MessageSurveyBanner
      messageType={messageKindFromStandardMessage(
        message,
        messageDetails,
        hasAttachments
      )}
      organizationFiscalCode={message.organizationFiscalCode}
      sendingDate={message.createdAt.toISOString()}
      serviceId={message.serviceId}
    />
  );
};

export const SendMessageSurveyBanner = ({
  message,
  serviceId
}: {
  message: PNMessage;
  serviceId: ServiceId;
}) => {
  const serviceDetails = useIOSelector(state =>
    serviceDetailsByIdSelector(state, serviceId)
  );
  const organizationFiscalCode = serviceDetails?.organization.fiscal_code;

  if (organizationFiscalCode === undefined) {
    return null;
  }

  return (
    <MessageSurveyBanner
      messageType={MessageKind.SEND}
      organizationFiscalCode={organizationFiscalCode}
      sendingDate={message.created_at.toISOString()}
      serviceId={serviceId}
    />
  );
};

const MessageSurveyBanner = (props: QualtricsParameters) => {
  const qualtricsUri = useIOSelector(messageSurveyBannerUriSelector);

  if (qualtricsUri === undefined) {
    return null;
  }

  const url = encodeQualtricsParameters(qualtricsUri, props);

  return (
    <>
      <VSpacer size={16} />
      <Banner
        action={i18next.t("messageDetails.surveyBanner.action")}
        color="neutral"
        content={i18next.t("messageDetails.surveyBanner.content")}
        onPress={() => openWebUrl(url)}
        pictogramName="feedback"
        testID="message-survey-banner"
      />
    </>
  );
};

// ------------------------------ UTILS ----------------------------

const messageKindFromStandardMessage = (
  message: UIMessage,
  messageDetails: UIMessageDetails,
  hasAttachments: boolean
): MessageKind => {
  if (messageDetails.hasRemoteContent) {
    return MessageKind.REMOTE_CONTENT;
  }
  if (hasAttachments) {
    return MessageKind.ATTACHMENT;
  }
  if (
    message.category.tag === "PAYMENT" ||
    messageDetails.paymentData !== undefined
  ) {
    return MessageKind.PAYMENT;
  }

  return MessageKind.STANDARD;
};

const encodeQualtricsParameters = (
  qualtricsUrl: string,
  params: QualtricsParameters
): string => {
  const parametersBase64Url = Buffer.from(
    JSON.stringify(params),
    "utf8"
  ).toString("base64url");

  return `${qualtricsUrl}?Q_EED=${parametersBase64Url}`;
};

export const testable = isTestEnv
  ? {
      MessageKind,
      messageKindFromStandardMessage,
      encodeQualtricsParameters,
      MessageSurveyBanner
    }
  : undefined;

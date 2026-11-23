import { ServiceId } from "@io-app/api-types/generated/definitions/services/ServiceId";
import { Banner, VSpacer } from "@io-app/design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import I18n from "i18next";

import { useIOSelector } from "../../../store/hooks";
import { messageSurveyBannerUriSelector } from "../../../store/reducers/backendStatus/remoteConfig";
import { isTestEnv } from "../../../utils/environment";
import { openWebUrl } from "../../../utils/url";
import { PNMessage } from "../../pn/store/types/types";
import {
  SendOpeningSource,
  SendUserType
} from "../../pushNotifications/analytics";
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
  firstTimeOpening: "no" | "unknown" | "yes";
  messageType: MessageKind;
  organizationFiscalCode: string;
  sendingDate: string;
  sendOpeningSource?: "aar" | "message";
  sendUserType?: "delegato" | "destinatario";
  serviceId: ServiceId;
};

export const StandardMessageSurveyBanner = ({
  firstTimeOpening,
  message
}: {
  firstTimeOpening: boolean;
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
      firstTimeOpening={firstTimeOpening ? "yes" : "no"}
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

const optionalBooleanToYesNoUnknown = (flag?: boolean) => {
  switch (flag) {
    case true:
      return "yes";
    case false:
      return "no";
    default:
      return "unknown";
  }
};

export const SendMessageSurveyBanner = ({
  firstTimeOpening,
  message,
  sendOpeningSource,
  sendUserType,
  serviceId
}: {
  firstTimeOpening: boolean | undefined;
  message: PNMessage;
  sendOpeningSource: SendOpeningSource;
  sendUserType: SendUserType;
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
      firstTimeOpening={optionalBooleanToYesNoUnknown(firstTimeOpening)}
      messageType={MessageKind.SEND}
      organizationFiscalCode={organizationFiscalCode}
      sendingDate={message.created_at.toISOString()}
      sendOpeningSource={sendOpeningSource === "aar" ? "aar" : "message"}
      sendUserType={sendUserType === "mandatory" ? "delegato" : "destinatario"}
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
        action={I18n.t("messageDetails.surveyBanner.action")}
        color="neutral"
        content={I18n.t("messageDetails.surveyBanner.content")}
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
  // Serialize with an explicit, stable key order so the encoded payload does
  // not depend on the caller's prop/object key insertion order.
  const orderedParams = {
    organizationFiscalCode: params.organizationFiscalCode,
    serviceId: params.serviceId,
    sendingDate: params.sendingDate,
    messageType: params.messageType,
    first_time_opening: params.firstTimeOpening,
    opening_source: params.sendOpeningSource,
    send_user: params.sendUserType
  };
  const parametersBase64Url = Buffer.from(
    JSON.stringify(orderedParams),
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

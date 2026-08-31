/* eslint-disable @typescript-eslint/no-misused-promises */
import { HasPreconditionEnum } from "@io-app/api-types/generated/definitions/communication/HasPrecondition";
import { PartyConfigurationFaultPaymentProblemJson as PaymentInfoUnavailableResponse } from "@io-app/api-types/generated/definitions/communication/PartyConfigurationFaultPaymentProblemJson";
import { PaymentFaultV2Enum } from "@io-app/api-types/generated/definitions/communication/PaymentFaultV2";
import { PaymentInfoBadGatewayResponse } from "@io-app/api-types/generated/definitions/communication/PaymentInfoBadGatewayResponse";
import { PaymentInfoConflictResponse } from "@io-app/api-types/generated/definitions/communication/PaymentInfoConflictResponse";
import { PaymentInfoNotFoundResponse } from "@io-app/api-types/generated/definitions/communication/PaymentInfoNotFoundResponse";
import { PaymentInfoResponse } from "@io-app/api-types/generated/definitions/communication/PaymentInfoResponse";
import { ThirdPartyMessagePrecondition } from "@io-app/api-types/generated/definitions/communication/ThirdPartyMessagePrecondition";
import { ThirdPartyMessageWithContent } from "@io-app/api-types/generated/definitions/communication/ThirdPartyMessageWithContent";
import { NotificationAttachmentDownloadMetadataResponse } from "@io-app/api-types/generated/definitions/pn/NotificationAttachmentDownloadMetadataResponse";
import { ThirdPartyMessage } from "@io-app/api-types/generated/definitions/pn/ThirdPartyMessage";
import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import { Request, Response, Router } from "express";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import _ from "lodash";

import { ioDevServerConfig } from "../../../config";
import { lollipopMiddleware } from "../../../middleware/lollipopMiddleware";
import { getProblemJson } from "../../../payloads/error";
import { addHandler } from "../../../payloads/response";
import { PaymentsDatabase } from "../../../persistence/payments";
import { GetMessagesParameters } from "../../../types/parameters";
import {
  isProcessedPayment,
  ProcessablePayment,
  ProcessedPayment
} from "../../../types/PaymentStatus";
import {
  handleLeftEitherIfNeeded,
  unknownToString
} from "../../../utils/error";
import { sendFileFromRootPath } from "../../../utils/file";
import { serverUrl } from "../../../utils/server";
import {
  addApiCommunicationV1Prefix,
  addApiV1Prefix
} from "../../../utils/strings";
import { RouteHandler } from "../../../utils/types";
import {
  httpStatusCodeFromDetailV2Enum,
  payloadFromDetailV2Enum
} from "../../payments/types/failure";
import {
  generateNotificationDisclaimerPath,
  generateNotificationPath
} from "../../pn/routers/notificationsRouter";
import { sendServiceId } from "../../pn/services/dataService";
import MessagesDB from "../persistence/messagesDatabase";
import {
  defaultContentType,
  getThirdPartyMessagePrecondition
} from "../persistence/messagesPayload";
import MessagesService from "../services/messagesService";

export const messageRouter = Router();
const configResponse = ioDevServerConfig.messages.response;

const messageNotFoundError = "message not found";

const handleGetMessages: RouteHandler = (req, res) => {
  if (configResponse.getMessagesResponseCode !== 200) {
    res.sendStatus(configResponse.getMessagesResponseCode);
    return;
  }
  const paginatedQuery = GetMessagesParameters.decode({
    // default pageSize = 100
    pageSize: req.query.page_size ?? "100",
    // default enrichResultData = false
    enrichResultData: (req.query.enrich_result_data ?? false) === "true",
    maximumId: req.query.maximum_id,
    minimumId: req.query.minimum_id,
    getArchived: (req.query.archived ?? false) === "true"
  });
  if (E.isLeft(paginatedQuery)) {
    // bad request
    res.sendStatus(400);
    return;
  }

  const params = paginatedQuery.right;
  const orderedList =
    pipe(
      paginatedQuery,
      E.map(p => p.getArchived),
      E.getOrElseW(() => false)
    ) === true
      ? MessagesDB.findAllArchived()
      : MessagesDB.findAllInbox();

  // eslint-disable-next-line functional/no-let, no-undef-init
  let indexes:
    | undefined
    | { backward: boolean; endIndex: number; startIndex: number } = undefined;
  try {
    indexes = MessagesService.computeGetMessagesQueryIndexes(
      params,
      orderedList
    );
  } catch (e) {
    return res.sendStatus(400).json(getProblemJson(400, `${e}`));
  }

  // either not enough parameters or out-of-bound
  if (indexes === undefined) {
    return res.json({ items: [] });
  }

  const enrichResultData = params.enrichResultData ?? true;
  const slice = _.slice(orderedList, indexes.startIndex, indexes.endIndex);
  const items = MessagesService.getPublicMessages(
    slice,
    enrichResultData,
    false,
    ioDevServerConfig
  );

  // the API doesn't return 'next' for previous page
  if (indexes.backward) {
    return res.json({
      items,
      prev: orderedList[indexes.startIndex]?.id
    });
  }

  return res.json({
    items,
    prev: orderedList[indexes.startIndex]?.id,
    next: orderedList[indexes.endIndex]
      ? slice[slice.length - 1]?.id
      : undefined
  });
};

const handleGetMessage: RouteHandler = (req, res) => {
  if (configResponse.getMessageResponseCode !== 200) {
    res.sendStatus(configResponse.getMessagesResponseCode);
    return;
  }
  // retrieve the messageIndex from id
  const message = MessagesDB.getMessageById(req.params.id);
  if (message == null) {
    res.status(404).json(getProblemJson(404, messageNotFoundError));
    return;
  }
  const response = MessagesService.getPublicMessages(
    [message],
    req.query.public_message === "true",
    true,
    ioDevServerConfig
  )[0];
  res.json(response);
};

const handlePutMessageStatus: RouteHandler = (req, res) => {
  if (configResponse.getMessageResponseCode !== 200) {
    res.sendStatus(configResponse.getMessagesResponseCode);
    return;
  }
  const { change_type, is_archived, is_read } = req.body;
  if (is_archived === undefined && is_read === undefined) {
    return res.status(400).json(getProblemJson(400, "Invalid payload"));
  }
  // eslint-disable-next-line functional/no-let
  let result = false;

  switch (change_type) {
    case "archiving":
      if (is_archived === true) {
        result = MessagesDB.archive(req.params.id);
      }
      if (is_archived === false) {
        result = MessagesDB.unarchive(req.params.id);
      }
      break;
    case "bulk":
      if (is_archived === true) {
        result = MessagesDB.archive(req.params.id);
      }
      if (is_archived === false) {
        result = MessagesDB.unarchive(req.params.id);
      }
      if (is_read) {
        result = MessagesDB.setReadMessage(req.params.id);
      }
      break;
    case "reading":
      // note: is_read can only be set to true
      if (is_read) {
        result = MessagesDB.setReadMessage(req.params.id);
      }
      break;
    default:
      return res.status(400).json(getProblemJson(400, "Invalid payload"));
  }

  if (result) {
    return res.status(200).json({ message: "ok" });
  }
  return res.status(404).json({ message: "ok" });
};

const handleGetThirdPartyMessage = lollipopMiddleware(async (req, res) => {
  if (configResponse.getThirdPartyMessageResponseCode !== 200) {
    res.sendStatus(configResponse.getThirdPartyMessageResponseCode);
    return;
  }
  const message = MessagesDB.getMessageById(req.params.id);
  if (message == null) {
    res.status(404).json(getProblemJson(404, messageNotFoundError));
    return;
  }
  if (message.sender_service_id === sendServiceId) {
    const sendMessageId = message.content.third_party_data?.id;
    if (sendMessageId == null) {
      res
        .status(500)
        .json(
          getProblemJson(
            500,
            "Missing id",
            `The Third Party Message does not contain an id property for the SEND Notification (id: ${sendMessageId})`
          )
        );
      return;
    }
    const sendNotificationUrl = `${serverUrl}${generateNotificationPath(
      sendMessageId
    )}`;
    try {
      const sendNotificationResponse = await fetch(sendNotificationUrl, {
        headers: {
          ...MessagesService.lollipopClientHeadersFromHeaders(req.headers),
          ...MessagesService.generateFakeLollipopServerHeaders(
            ioDevServerConfig.profile.attrs.fiscal_code
          ),
          ...MessagesService.sendAPIKeyHeader(),
          ...MessagesService.sendTaxIdHeader(
            ioDevServerConfig.profile.attrs.fiscal_code
          ),
          ...MessagesService.sendDefaultIOSourceHeader()
        }
      });
      if (sendNotificationResponse.status !== 200) {
        throw Error(
          `Expected 200 HTTP Status code from SEND (received ${sendNotificationResponse.status})`
        );
      }

      const sendThirdPartyMessageJSON = await sendNotificationResponse.json();
      const sendThidPartyMessageEither = ThirdPartyMessage.decode(
        sendThirdPartyMessageJSON
      );
      if (E.isLeft(sendThidPartyMessageEither)) {
        throw Error(
          `Invalid SEND response data structure (${readableReport(
            sendThidPartyMessageEither.left
          )})`
        );
      }

      const thirdPartyMessageWithContentEither =
        ThirdPartyMessageWithContent.decode({
          ...message,
          third_party_message: sendThidPartyMessageEither.right
        });
      if (E.isLeft(thirdPartyMessageWithContentEither)) {
        throw Error(readableReport(thirdPartyMessageWithContentEither.left));
      }
      res.status(200).json(thirdPartyMessageWithContentEither.right);
    } catch (e) {
      const errorMessage = unknownToString(e);
      res
        .status(500)
        .json(
          getProblemJson(
            500,
            "Notification unexpected error",
            `Unexpected error while contacting SEND notification endpoint (iun: ${sendMessageId} reason: ${errorMessage})`
          )
        );
    }
  } else {
    const thirdPartyMessageEither =
      ThirdPartyMessageWithContent.decode(message);
    if (E.isLeft(thirdPartyMessageEither)) {
      res
        .status(500)
        .json(
          getProblemJson(
            500,
            "Format failure",
            "The Third Party Message was found but its schema is not valid"
          )
        );
      return;
    }
    res.json(thirdPartyMessageEither.right);
  }
});

const handleGetThirdPartyMessageAttachment = lollipopMiddleware(
  async (req, res) => {
    const messageId = req.params.messageId;
    const attachmentUrl = req.params[0];
    const message = MessagesDB.getMessageById(messageId);
    if (message == null) {
      res
        .status(400)
        .json(
          getProblemJson(
            400,
            "Message not found",
            `Unable to found message with id (${messageId})`
          )
        );
      return;
    }
    if (message.sender_service_id === sendServiceId) {
      const attachmentUrlPath = req.params[0];
      const attachmentUrl =
        MessagesService.appendAttachmentIdxToAttachmentUrlIfNeeded(
          attachmentUrlPath,
          req.query
        );
      await handleSENDAttachment(attachmentUrl, req, res);
    } else {
      const attachmentEither = MessagesService.verifyAttachment(
        message,
        attachmentUrl
      );
      if (handleLeftEitherIfNeeded(attachmentEither, res)) {
        return;
      }
      const attachment = attachmentEither.right;
      const contentType = attachment.content_type ?? defaultContentType;
      const resWithHeaders = res.setHeader("Content-Type", contentType);
      sendFileFromRootPath(attachment.url, resWithHeaders);
    }
  }
);

const handleGetThirdPartyMessagePrecondition = lollipopMiddleware(
  async (req, res) => {
    const ioMessageId = req.params.id;
    const ioMessage = MessagesDB.getMessageById(ioMessageId);
    if (ioMessage == null) {
      res.status(404).json(getProblemJson(404, messageNotFoundError));
      return;
    }

    const hasPreconditionsValue =
      ioMessage.content.third_party_data?.has_precondition ??
      HasPreconditionEnum.NEVER;
    const messageHasNoPreconditions =
      hasPreconditionsValue === HasPreconditionEnum.NEVER;
    if (messageHasNoPreconditions) {
      res
        .status(400)
        .json(
          getProblemJson(
            400,
            "Bad request",
            `There are no preconditions for Message with id ${ioMessageId}`
          )
        );
      return;
    }

    const isSendService = ioMessage.sender_service_id === sendServiceId;
    if (isSendService) {
      const thirdPartyMessageId = ioMessage.content.third_party_data?.id;
      if (thirdPartyMessageId == null) {
        res
          .status(500)
          .json(
            getProblemJson(
              500,
              "Internal Server Error",
              `Third Party Message ID is not set for Message with id ${ioMessageId}`
            )
          );
        return;
      }
      const sendNotificationUrl = `${serverUrl}${generateNotificationDisclaimerPath(
        thirdPartyMessageId
      )}`;
      try {
        const sendNotificationPreconditionResponse = await fetch(
          sendNotificationUrl,
          {
            headers: {
              ...MessagesService.lollipopClientHeadersFromHeaders(req.headers),
              ...MessagesService.generateFakeLollipopServerHeaders(
                ioDevServerConfig.profile.attrs.fiscal_code
              ),
              ...MessagesService.sendAPIKeyHeader(),
              ...MessagesService.sendTaxIdHeader(
                ioDevServerConfig.profile.attrs.fiscal_code
              ),
              ...MessagesService.sendDefaultIOSourceHeader()
            }
          }
        );
        if (sendNotificationPreconditionResponse.status !== 200) {
          throw Error(
            `Expected 200 HTTP Status code from SEND (received ${sendNotificationPreconditionResponse.status})`
          );
        }

        const sendPreconditionContentJSON =
          await sendNotificationPreconditionResponse.json();
        const sendThirdPartyMessagePreconditionEither =
          ThirdPartyMessagePrecondition.decode(sendPreconditionContentJSON);
        if (E.isLeft(sendThirdPartyMessagePreconditionEither)) {
          throw Error(
            `Invalid SEND response data structure (${readableReport(
              sendThirdPartyMessagePreconditionEither.left
            )})`
          );
        }
        res.status(200).json(sendThirdPartyMessagePreconditionEither.right);
      } catch (e) {
        const errorMessage = unknownToString(e);
        res
          .status(500)
          .json(
            getProblemJson(
              500,
              "Precondition unexpected error",
              `Unexpected error while contacting SEND notification endpoint (iun: ${thirdPartyMessageId} reason: ${errorMessage})`
            )
          );
      }
    } else {
      const thirdPartyMessagePreconditions = getThirdPartyMessagePrecondition();
      res.status(200).json(thirdPartyMessagePreconditions);
    }
  }
);

const handleGetPaymentInfo: RouteHandler = (req, res) => {
  const rptId = req.params.rptId;
  const maybePaymentStatus = PaymentsDatabase.getPaymentStatus(rptId);
  if (O.isNone(maybePaymentStatus)) {
    const fakeProcessedPayment: ProcessedPayment = {
      status: {
        detail_v2: PaymentFaultV2Enum.PAA_PAGAMENTO_SCONOSCIUTO
      },
      type: "processed"
    };
    const [statusCode, payload] =
      processedPaymentToStatusCodeAndPayload(fakeProcessedPayment);
    res.status(statusCode).json(payload);
    return;
  }

  const isTest = req.query.test;
  if (isTest == null) {
    // This is not the real backend behavior, but it is here in
    // order to make sure that the request is properly formatted
    res
      .status(400)
      .json(getProblemJson(400, "Missing 'isTest' query parameter"));
    return;
  }

  const paymentStatus = maybePaymentStatus.value;
  if (isProcessedPayment(paymentStatus)) {
    const [statusCode, payload] =
      processedPaymentToStatusCodeAndPayload(paymentStatus);
    res.status(statusCode).json(payload);
  } else {
    const [statusCode, payload] =
      processablePaymentToStatusCodeAndPayload(paymentStatus);
    res.status(statusCode).json(payload);
  }
};

const handleCreateMessage: RouteHandler = (_, res) =>
  pipe(MessagesService.createMessage(), MessagesDB.addNewMessage, newMessage =>
    res.status(201).json(newMessage)
  );

const processablePaymentToStatusCodeAndPayload = (
  payment: ProcessablePayment
): [number, PaymentInfoResponse | string] => [200, payment.data];

const processedPaymentToStatusCodeAndPayload = (
  payment: ProcessedPayment
): [number, ReturnType<typeof payloadFromDetailV2Enum> | string] => {
  const detailV2Enum = payment.status.detail_v2;
  const statusCode = httpStatusCodeFromDetailV2Enum(detailV2Enum);
  const payload = payloadFromDetailV2Enum(detailV2Enum);
  // eCommerce API has been mapped by IO-Backend so we must make
  // sure that type conversion is correct by validating the
  // different types that maps the same instance's content
  if (statusCode === 404) {
    const paymentInfoNotFoundResponseEither =
      PaymentInfoNotFoundResponse.decode(payload);
    if (E.isLeft(paymentInfoNotFoundResponseEither)) {
      return [500, readableReport(paymentInfoNotFoundResponseEither.left)];
    }
  } else if (statusCode === 409) {
    const paymentInfoConflictResponse =
      PaymentInfoConflictResponse.decode(payload);
    if (E.isLeft(paymentInfoConflictResponse)) {
      return [500, readableReport(paymentInfoConflictResponse.left)];
    }
  } else if (statusCode === 502) {
    const paymentInfoBadGatewayResponse =
      PaymentInfoBadGatewayResponse.decode(payload);
    if (E.isLeft(paymentInfoBadGatewayResponse)) {
      return [500, readableReport(paymentInfoBadGatewayResponse.left)];
    }
  } else if (statusCode === 503) {
    const paymentInfoUnavailableResponse =
      PaymentInfoUnavailableResponse.decode(payload);
    if (E.isLeft(paymentInfoUnavailableResponse)) {
      return [500, readableReport(paymentInfoUnavailableResponse.left)];
    }
  } else if (statusCode === 400 || statusCode === 401) {
    // eCommerce 400 and 401 status codes are mapped to 500 on IOBackend,
    // since 401 is a FastLogin error and 400 is a server-to-server error
    return [500, payload];
  }
  return [statusCode, payload];
};

const handleSENDAttachment = async (
  attachmentUrl: string,
  req: Request,
  res: Response
) => {
  const sendAttachmentEndpointEither =
    MessagesService.checkAndBuildSENDAttachmentEndpoint(attachmentUrl);
  if (handleLeftEitherIfNeeded(sendAttachmentEndpointEither, res)) {
    return;
  }
  const sendAttachmentUrl = `${serverUrl}${sendAttachmentEndpointEither.right}`;
  try {
    const sendAttachmentUrlResponse = await fetch(sendAttachmentUrl, {
      headers: {
        ...MessagesService.lollipopClientHeadersFromHeaders(req.headers),
        ...MessagesService.generateFakeLollipopServerHeaders(
          ioDevServerConfig.profile.attrs.fiscal_code
        ),
        ...MessagesService.sendAPIKeyHeader(),
        ...MessagesService.sendTaxIdHeader(
          ioDevServerConfig.profile.attrs.fiscal_code
        ),
        ...MessagesService.sendDefaultIOSourceHeader()
      }
    });
    if (sendAttachmentUrlResponse.status !== 200) {
      throw Error(
        `Expected 200 HTTP Status code from SEND (received ${sendAttachmentUrlResponse.status})`
      );
    }

    const sendAttachmentContentJSON = await sendAttachmentUrlResponse.json();
    const sendAttachmentMetadataEither =
      NotificationAttachmentDownloadMetadataResponse.decode(
        sendAttachmentContentJSON
      );
    if (E.isLeft(sendAttachmentMetadataEither)) {
      throw Error(
        `Invalid SEND response data structure (${readableReport(
          sendAttachmentMetadataEither.left
        )})`
      );
    }

    const sendAttachmentMetadata = sendAttachmentMetadataEither.right;
    const retryAfter = sendAttachmentMetadata.retryAfter;
    if (retryAfter != null) {
      res.setHeader("retry-after", retryAfter).status(503).json({});
      return;
    }

    const url = sendAttachmentMetadata.url;
    if (url == null) {
      throw Error(
        `Invalid SEND response data. Both 'retryAfter' and 'url' were not set`
      );
    }

    const urlFetchResponse = await fetch(url);
    if (urlFetchResponse.status !== 200) {
      throw Error(
        `Expected 200 HTTP Status code from SEND prevalidated URL (received ${urlFetchResponse.status})`
      );
    }
    const responseBlob = await urlFetchResponse.blob();
    const responseArrayBuffer = await responseBlob.arrayBuffer();
    const responseBuffer = Buffer.from(responseArrayBuffer);

    res.header("content-type", "application/pdf");
    res.header("content-length", `${responseBuffer.length}`);
    res.status(200).send(responseBuffer);
  } catch (e) {
    const errorMessage = unknownToString(e);
    res
      .status(500)
      .json(
        getProblemJson(
          500,
          "Attachment unexpected error",
          `Unexpected error while contacting SEND attachment endpoint (${sendAttachmentUrl}) (${errorMessage})`
        )
      );
  }
};

export const communicationRouter = Router();

const handlePutInstallation: RouteHandler = (_, res) =>
  res.json({ message: "OK" });
addHandler(
  messageRouter,
  "post",
  addApiV1Prefix("/message"),
  handleCreateMessage
);

addHandler(
  communicationRouter,
  "get",
  addApiCommunicationV1Prefix("/messages"),
  handleGetMessages
);
addHandler(
  communicationRouter,
  "get",
  addApiCommunicationV1Prefix("/messages/:id"),
  handleGetMessage
);
addHandler(
  communicationRouter,
  "put",
  addApiCommunicationV1Prefix("/messages/:id/status"),
  handlePutMessageStatus
);
addHandler(
  communicationRouter,
  "get",
  addApiCommunicationV1Prefix("/third-party-messages/:id/precondition"),
  handleGetThirdPartyMessagePrecondition,
  () => Math.random() * 500
);
addHandler(
  communicationRouter,
  "get",
  addApiCommunicationV1Prefix("/third-party-messages/:id"),
  handleGetThirdPartyMessage,
  () => Math.random() * 500
);
addHandler(
  communicationRouter,
  "get",
  addApiCommunicationV1Prefix("/third-party-messages/:messageId/attachments/*"),
  handleGetThirdPartyMessageAttachment,
  () => Math.random() * 500
);
addHandler(
  communicationRouter,
  "get",
  addApiCommunicationV1Prefix("/payment/info/:rptId"),
  handleGetPaymentInfo,
  () => Math.ceil(500 + 1000 * Math.random())
);
addHandler(
  communicationRouter,
  "put",
  addApiCommunicationV1Prefix("/installations/:installationID"),
  handlePutInstallation
);

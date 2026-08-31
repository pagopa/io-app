/* eslint-disable @typescript-eslint/no-misused-promises */
import { Request, Response, Router } from "express";

import { lollipopMiddleware } from "../../../middleware/lollipopMiddleware";
import { getProblemJson } from "../../../payloads/error";
import { addHandler } from "../../../payloads/response";
import {
  handleLeftEitherIfNeeded,
  unknownToString
} from "../../../utils/error";
import { logWarning } from "../../../utils/logging";
import { serverUrl } from "../../../utils/server";
import { generateCheckQRPath } from "../../pn/routers/aarRouter";
import { generateLollipopLambdaGetPath } from "../../pn/routers/lollipopLambda";
import {
  generateAcceptMandatePath,
  generateCreateMandatePath
} from "../../pn/routers/mandatesRouter";
import { generateNotificationPath } from "../../pn/routers/notificationsRouter";
import {
  generateRequestHeaders,
  isTestOrUndefinedFromQuery,
  mandateIdOrUndefinedFromQuery
} from "../services/ioSendService";
import MessagesService from "../services/messagesService";
import { bodyToString } from "../utils";

export const ioSendRouter = Router();

addHandler(
  ioSendRouter,
  "post",
  "/api/com/v1/send/aar/qr-code-check",
  lollipopMiddleware(async (req, res) => {
    const sendQRCodeUrl = `${serverUrl}${generateCheckQRPath()}`;
    const sendQRCodeBodyEither = bodyToString(req.body);
    if (handleLeftEitherIfNeeded(sendQRCodeBodyEither, res)) {
      return;
    }
    commonHandleIsTestQueryParam(req);
    const sendQRCodeFetch = () =>
      fetch(sendQRCodeUrl, {
        method: "post",
        headers: generateRequestHeaders(req.headers),
        body: sendQRCodeBodyEither.right
      });
    await fetchSENDDataAndForwardResponse(sendQRCodeFetch, "QRCode", res);
  }),
  () => Math.random() * 500
);

addHandler(
  ioSendRouter,
  "get",
  "/api/com/v1/send/aar/notifications/:iun",
  lollipopMiddleware(async (req, res) => {
    const iun = req.params.iun;
    const mandateId = mandateIdOrUndefinedFromQuery(req.query);
    const sendNotificationUrl = `${serverUrl}${generateNotificationPath(
      iun,
      mandateId
    )}`;
    commonHandleIsTestQueryParam(req);
    const sendNotificationFetch = () =>
      fetch(sendNotificationUrl, {
        headers: generateRequestHeaders(req.headers)
      });
    await fetchSENDDataAndForwardResponse(
      sendNotificationFetch,
      "Notification",
      res
    );
  }),
  () => Math.random() * 500
);

addHandler(
  ioSendRouter,
  "get",
  "/api/com/v1/send/aar/attachments/*",
  lollipopMiddleware(async (req, res) => {
    const urlEncodedBase64AttachmentUrl = req.params[0];
    const attachmentUrlEither =
      MessagesService.urlAttachmentFromUrlEncodedBase64UrlIfNeeded(
        urlEncodedBase64AttachmentUrl
      );
    if (handleLeftEitherIfNeeded(attachmentUrlEither, res)) {
      return;
    }
    const mandateId = mandateIdOrUndefinedFromQuery(req.query);
    const sendAttachmentEndpointEither =
      MessagesService.checkAndBuildSENDAttachmentEndpoint(
        attachmentUrlEither.right,
        mandateId
      );
    if (handleLeftEitherIfNeeded(sendAttachmentEndpointEither, res)) {
      return;
    }
    const sendAttachmentUrl = `${serverUrl}${sendAttachmentEndpointEither.right}`;
    commonHandleIsTestQueryParam(req);
    const sendAttachmentFetch = () =>
      fetch(sendAttachmentUrl, {
        headers: generateRequestHeaders(req.headers)
      });
    await fetchSENDDataAndForwardResponse(
      sendAttachmentFetch,
      "Attachment",
      res
    );
  }),
  () => Math.random() * 500
);

addHandler(
  ioSendRouter,
  "post",
  "/api/com/v1/send/aar/mandates",
  lollipopMiddleware(async (req, res) => {
    const sendCreateMandateUrl = `${serverUrl}${generateCreateMandatePath()}`;
    const sendCreateMandateBodyEither = bodyToString(req.body);
    if (handleLeftEitherIfNeeded(sendCreateMandateBodyEither, res)) {
      return;
    }
    commonHandleIsTestQueryParam(req);
    const sendCreateMandateFetch = () =>
      fetch(sendCreateMandateUrl, {
        method: "post",
        headers: generateRequestHeaders(req.headers),
        body: sendCreateMandateBodyEither.right
      });
    await fetchSENDDataAndForwardResponse(
      sendCreateMandateFetch,
      "Mandate/Create",
      res
    );
  }),
  () => Math.random() * 500
);

addHandler(
  ioSendRouter,
  "patch",
  "/api/com/v1/send/aar/mandates/:mandateId",
  lollipopMiddleware(async (req, res) => {
    const mandateId = req.params.mandateId;
    const sendAcceptMandateUrl = `${serverUrl}${generateAcceptMandatePath(
      mandateId
    )}`;
    const sendAcceptMandateBodyEither = bodyToString(req.body);
    if (handleLeftEitherIfNeeded(sendAcceptMandateBodyEither, res)) {
      return;
    }
    commonHandleIsTestQueryParam(req);
    const sendCreateMandateFetch = () =>
      fetch(sendAcceptMandateUrl, {
        method: "PATCH",
        headers: generateRequestHeaders(req.headers),
        body: sendAcceptMandateBodyEither.right
      });
    await fetchSENDDataAndForwardResponse(
      sendCreateMandateFetch,
      "Mandate/Accept",
      res
    );
  }),
  () => Math.random() * 500
);

addHandler(
  ioSendRouter,
  "get",
  "/api/com/v1/send/lollipop-check/test",
  lollipopMiddleware(async (req, res) => {
    const sendLollipopLambdaGetUrl = `${serverUrl}${generateLollipopLambdaGetPath()}`;
    commonHandleIsTestQueryParam(req);
    const sendLollipopLambdaGetFetch = () =>
      fetch(sendLollipopLambdaGetUrl, {
        method: "get",
        headers: generateRequestHeaders(req.headers, "application/json", true)
      });
    await fetchSENDDataAndForwardResponse(
      sendLollipopLambdaGetFetch,
      "lollipop-test",
      res
    );
  }),
  () => Math.random() * 500
);

addHandler(
  ioSendRouter,
  "post",
  "/api/com/v1/send/lollipop-check/test",
  lollipopMiddleware(async (req, res) => {
    const sendLollipopLambdaPostUrl = `${serverUrl}${generateLollipopLambdaGetPath()}`;
    const sendLollipopLambdaPostBodyEither = bodyToString(req.body);
    if (handleLeftEitherIfNeeded(sendLollipopLambdaPostBodyEither, res)) {
      return;
    }
    commonHandleIsTestQueryParam(req);
    const sendLambdaLollipopPostFetch = () =>
      fetch(sendLollipopLambdaPostUrl, {
        method: "post",
        headers: generateRequestHeaders(req.headers, "application/json", true),
        body: sendLollipopLambdaPostBodyEither.right
      });
    await fetchSENDDataAndForwardResponse(
      sendLambdaLollipopPostFetch,
      "lollipop-test",
      res
    );
  }),
  () => Math.random() * 500
);

const fetchSENDDataAndForwardResponse = async (
  fetchFunction: () => Promise<globalThis.Response>,
  endpointName: string,
  res: Response
) => {
  try {
    const sendResponse = await fetchFunction();

    const contentType = sendResponse.headers.get("content-type");
    const responseBodyBuffer = await sendResponse.arrayBuffer();
    const body = Buffer.from(responseBodyBuffer);
    if (contentType) {
      res.setHeader("Content-Type", contentType);
    }
    res.status(sendResponse.status).send(body);
  } catch (e) {
    const errorMessage = unknownToString(e);
    res
      .status(500)
      .json(
        getProblemJson(
          500,
          `${endpointName} unexpected error`,
          `Unexpected error while contacting SEND ${endpointName} endpoint (${errorMessage})`
        )
      );
  }
};

const commonHandleIsTestQueryParam = (req: Request) => {
  const isTest = isTestOrUndefinedFromQuery(req.query);
  if (isTest == null) {
    logWarning(
      `\n  API is missing "isTest" parameter in query string (${req.query.isTest})\n`
    );
  }
};

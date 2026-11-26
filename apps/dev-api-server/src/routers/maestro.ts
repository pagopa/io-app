import { PaymentFaultV2Enum } from "@io-app/api-types/generated/definitions/communication/PaymentFaultV2";
import { Router } from "express";

import MessagesDB from "../features/messages/persistence/messagesDatabase";
import { withPaymentData } from "../features/messages/persistence/messagesPayload";
import MessagesService from "../features/messages/services/messagesService";
import { PaymentsDatabase } from "../persistence/payments";
import { getLoginSessionToken } from "../persistence/sessionInfo";
import {
  addApiAuthV1Prefix,
  addApiCommunicationV1Prefix,
  addApiIdentityV1Prefix
} from "../utils/strings";

export const maestroRouter = Router();
const controls = Router();
const maxOutageMs = 3 * 60 * 1000;
// eslint-disable-next-line functional/no-let -- Shared only by this dedicated dev API instance.
let outageUntil = 0;
// eslint-disable-next-line functional/no-let -- Revocation applies only to the current synthetic session.
let expiredToken: string | undefined;

controls.use((req, res, next) => {
  if (req.socket.remoteAddress !== "127.0.0.1") {
    res.sendStatus(403);
    return;
  }
  next();
});

controls.get("/service-link", (_, res) => {
  res
    .type("html")
    .send(
      '<meta name="viewport" content="width=device-width, initial-scale=1"><a href="https://continua.io.pagopa.it/services/service-detail?serviceId=service1">Open the IO test service</a>'
    );
});

controls.post("/paid-message", (_, res) => {
  const message = MessagesService.createMessage();
  const result = withPaymentData(message);
  if (result._tag === "Left") {
    throw result.left;
  }
  const payment = result.right.content.payment_data;
  if (!payment?.payee) {
    throw new Error("Expected a notice number and payee for the paid fixture");
  }
  const rptId = `${payment.payee.fiscal_code}${payment.notice_number}`;
  PaymentsDatabase.createProcessedPayment(
    rptId,
    PaymentFaultV2Enum.PAA_PAGAMENTO_DUPLICATO
  );
  MessagesDB.addNewMessage(result.right);
  res.status(201).json({ subject: result.right.content.subject, rptId });
});

controls.post("/profile-outage", (_, res) => {
  // Expire automatically even if the runner is killed before cleanup.
  outageUntil = Date.now() + maxOutageMs;
  res.sendStatus(204);
});
controls.delete("/profile-outage", (_, res) => {
  outageUntil = 0;
  res.sendStatus(204);
});

controls.post("/expire-session", (_, res) => {
  const token = getLoginSessionToken();
  if (!token) {
    res.status(409).send("No active mock session");
    return;
  }
  expiredToken = token;
  res.sendStatus(204);
});

maestroRouter.use("/maestro", controls);
maestroRouter.get(
  addApiCommunicationV1Prefix("/messages/:id"),
  (req, res, next) => {
    if (expiredToken && req.get("authorization") === `Bearer ${expiredToken}`) {
      res.sendStatus(401);
      return;
    }
    next();
  }
);
maestroRouter.post(addApiAuthV1Prefix("/fast-login"), (_, res, next) => {
  if (expiredToken && expiredToken === getLoginSessionToken()) {
    res.sendStatus(403);
    return;
  }
  next();
});
maestroRouter.get(addApiIdentityV1Prefix("/profile"), (_, res, next) => {
  if (Date.now() < outageUntil) {
    res.sendStatus(503);
    return;
  }
  next();
});

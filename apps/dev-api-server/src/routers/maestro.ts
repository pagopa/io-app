import { PaymentFaultV2Enum } from "@io-app/api-types/generated/definitions/communication/PaymentFaultV2";
import { Router } from "express";

import MessagesDB from "../features/messages/persistence/messagesDatabase";
import { withPaymentData } from "../features/messages/persistence/messagesPayload";
import MessagesService from "../features/messages/services/messagesService";
import { PaymentsDatabase } from "../persistence/payments";
import { addApiIdentityV1Prefix } from "../utils/strings";

export const maestroRouter = Router();
const controls = Router();
const maxOutageMs = 3 * 60 * 1000;
// eslint-disable-next-line functional/no-let -- Shared only by this dedicated dev API instance.
let outageUntil = 0;

controls.use((req, res, next) => {
  if (req.socket.remoteAddress !== "127.0.0.1") {
    res.sendStatus(403);
    return;
  }
  next();
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

maestroRouter.use("/maestro", controls);
maestroRouter.get(addApiIdentityV1Prefix("/profile"), (_, res, next) => {
  if (Date.now() < outageUntil) {
    res.sendStatus(503);
    return;
  }
  next();
});
